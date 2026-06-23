## Objetivo

Substituir a busca de corretores (hoje feita na tabela `users` do Supabase) pela API externa **Integra Metrocasa** nos fluxos de registro de visita. Ao registrar a visita, a notificação push passa a ser enviada para o CPF do corretor escolhido na lista da API.

## Fonte de dados

- Endpoint: `GET https://integra.metrocasa.com.br/api/funcionarios` (sem parâmetros).
- Filtros aplicados no cliente:
  - `status === "ACTIVE"`
  - `department.id === "073f19fd-76cf-434f-992c-72b770cdad15"` **ou** algum item de `departments` com esse `id` (departamento `VENDAS`).
- Campos mantidos por corretor: `id`, `fullName`, `nickname`, `cpf`, `phone`, `department`, `departments`, `role`, `status`.

## Implementação

### 1. Edge Function `get-funcionarios` (proxy)

Criar `supabase/functions/get-funcionarios/index.ts` para evitar problemas de CORS e isolar a integração:

- `GET` sem auth (`verify_jwt = false` no `config.toml`).
- Faz `fetch` ao endpoint do Integra, aplica os filtros (`ACTIVE` + departamento VENDAS) e retorna `{ corretores: [{ id, nome, apelido, cpf, telefone }] }`.
- Cache HTTP curto (`Cache-Control: public, max-age=60`) para reduzir chamadas.
- CORS habilitado para o front.

### 2. Hook `useCorretoresIntegra`

Novo hook em `src/hooks/useCorretoresIntegra.tsx`:

- Usa React Query (`queryKey: ['corretores-integra']`, `staleTime: 5 min`).
- Invoca a edge function via `supabase.functions.invoke('get-funcionarios')`.
- Retorna lista normalizada `{ id, nome (apelido || fullName), fullName, cpf, telefone }`.

### 3. Telas atualizadas

Trocar a fonte de corretores nestes locais (remover o `useQuery` que lê `users`):

- `src/pages/recepcao.tsx` — formulário "Registrar Nova Visita".
- `src/components/AddClienteDialog.tsx` — adicionar cliente à lista de espera.

Comportamento:

- O `AutoSuggest`/Select continua igual visualmente; passa a consumir `useCorretoresIntegra`.
- Ao selecionar o corretor, guardar no state: `corretor_nome` (apelido ou fullName), `corretor_cpf`, `corretor_id` (id Integra).
- A opção atual de "NOVO" corretor (com cadastro de apelido) é **removida** desses dois fluxos, já que a lista agora é fechada pela API.
- O campo `corretor_id` salvo em `visits` / `lista_espera` permanece `string`, recebendo o `id` da Integra (UUID).

### 4. Notificação push usa CPF do corretor

Em `src/hooks/useNotificarVisita.tsx`:

- Remover constante `CPF_DESTINATARIO_TESTE`.
- `NotificarVisitaInput` ganha `corretor_cpf: string`.
- `targetIds` e `data.cpf` passam a usar `dados.corretor_cpf`.
- Se `corretor_cpf` estiver vazio, não dispara o POST e loga aviso.

Atualizar chamadores de `notificarVisita`:

- `src/pages/recepcao.tsx` → passar `corretor_cpf` do corretor selecionado.
- `src/components/IniciarVisitaDialog.tsx` → precisa ter o CPF do corretor. Como a lista de espera hoje só salva `corretor_id`/`corretor_nome`, vamos:
  - Persistir também `corretor_cpf` em `lista_espera` (nova coluna `text nullable`, sem default).
  - `AddClienteDialog` grava o `corretor_cpf` vindo da Integra.
  - `IniciarVisitaDialog` lê esse campo e repassa para `notificarVisita` e para `visits.corretor_cpf` (nova coluna em `visits` também, opcional, para histórico).

### 5. Migração

Migration única adicionando colunas:

```sql
ALTER TABLE public.lista_espera ADD COLUMN IF NOT EXISTS corretor_cpf text;
ALTER TABLE public.visits        ADD COLUMN IF NOT EXISTS corretor_cpf text;
```

Sem mudança de RLS/GRANTs (colunas novas em tabelas existentes).

### 6. Fora de escopo

- Não alterar nenhum fluxo de ban, edge function de auth ou tabela `users`.
- Não tocar outros lugares onde a tabela `users` é usada (dashboards, podio, admin etc.).
- Não criar cache local persistido — apenas React Query em memória.

## Pontos a confirmar

1. Sim deve realmente **Remover** a opção "NOVO" , não e mais necessario essa função, todos os dados devem vir do integra.
2. O `id` retornado pela Integra (UUID texto) pode ser gravado direto em `visits.corretor_id` (que hoje é uuid)? Caso seja `uuid`, ok. Caso a coluna seja `text`, também ok. Se preferir, posso parar de gravar `corretor_id` e manter só `corretor_cpf` + `corretor_nome`.