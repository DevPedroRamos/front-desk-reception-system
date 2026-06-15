## Plano: Gestão de Brindes via Painel Admin

### Objetivo
Substituir os brindes hard-coded (Cooler, Copo, Kit Fondue) por um cadastro dinâmico gerenciável em uma nova página administrativa, com controle de estoque e entrega automática configurável.

### Banco de Dados

Nova tabela `tipos_brinde`:

| Campo              | Tipo      | Descrição                                          |
|--------------------|-----------|----------------------------------------------------|
| id                 | uuid      | PK                                                 |
| nome               | text      | Nome único do brinde                               |
| ativo              | boolean   | Liga/desliga sem excluir (default true)            |
| entrega_automatica | boolean   | Se entregue ao iniciar visita (default false)      |
| icone_url          | text      | URL da imagem/ícone (storage)                      |
| estoque            | integer   | Quantidade disponível (default 0)                  |
| created_at/updated_at | timestamp |                                                |

- RLS: somente admins (via `has_role(auth.uid(),'admin')`) podem INSERT/UPDATE/DELETE; SELECT liberado a `authenticated` (recepção e dashboard precisam ler).
- Bucket de storage `brindes-icones` (público) para upload das imagens.
- Seed inicial: inserir Cooler, Kit Fondue (entrega_automatica=false) e Copo (entrega_automatica=true), preservando registros antigos da tabela `brindes`.
- Remover o CHECK constraint `brindes_tipo_brinde_check` para que `brindes.tipo_brinde` aceite qualquer nome cadastrado dinamicamente (mantém histórico intacto).

### Trigger de Estoque
Trigger `AFTER INSERT` em `brindes` que decrementa `tipos_brinde.estoque` em 1 quando um brinde validado é entregue (apenas se estoque > 0; senão não bloqueia, só não decrementa abaixo de zero).

### Frontend

**Nova página** `src/pages/admin/BrindesAdmin.tsx` (rota `/admin/brindes`):
- Listagem em tabela com colunas: ícone, nome, estoque, entrega automática (switch), ativo (switch), ações.
- Botão "Novo Brinde" abre dialog com: nome, upload de ícone, estoque inicial, switches.
- Editar/excluir inline.
- Cards de resumo no topo: total de tipos, ativos, estoque total.
- Proteção via `AdminProtectedRoute`.

**Sidebar** (`src/components/AppSidebar.tsx`): adicionar item "Brindes (Admin)" com ícone `Gift` na seção Administração.

**Rota** em `src/App.tsx`: `/admin/brindes` dentro de `ProtectedRoutes`.

**Refatoração das telas existentes** para consumir `tipos_brinde` dinamicamente em vez de listas fixas:
- `src/pages/Index.tsx` — dialog de finalização carrega opções de `tipos_brinde` onde `ativo=true AND entrega_automatica=false`.
- `src/pages/recepcao.tsx` e `src/components/IniciarVisitaDialog.tsx` — ao criar visita, inserir um registro em `brindes` para CADA tipo com `entrega_automatica=true AND ativo=true` (hoje hard-coded "Copo").
- `src/components/AddClienteDialog.tsx`, `IniciarVisitaDialog.tsx`, `recepcao.tsx` — banner informativo lista dinamicamente os brindes de entrega automática.
- `src/pages/Brindes.tsx` — filtros, ícones e cores derivados de `tipos_brinde` (com fallback para tipos legados ainda presentes em histórico).

### Fluxo

```text
Admin cadastra "Cooler" (estoque=20, ativo=true, automatico=false)
   |
   v
Recepção registra visita -> insere 1 brinde de cada tipo "automatico=true"
   |
   v
Trigger decrementa estoque dos automáticos
   |
   v
Finalização: dropdown mostra apenas tipos ativos não-automáticos
   |
   v
Brinde escolhido inserido em `brindes` -> trigger decrementa estoque
```

### Resumo de Arquivos

- **Migração**: cria `tipos_brinde`, RLS, bucket storage, trigger de estoque, remove CHECK antigo, seed inicial.
- **Novos**: `src/pages/admin/BrindesAdmin.tsx`, `src/components/admin/BrindeFormDialog.tsx`, `src/hooks/useTiposBrinde.tsx`.
- **Editados**: `src/App.tsx`, `src/components/AppSidebar.tsx`, `src/pages/Index.tsx`, `src/pages/recepcao.tsx`, `src/pages/Brindes.tsx`, `src/components/IniciarVisitaDialog.tsx`, `src/components/AddClienteDialog.tsx`.
