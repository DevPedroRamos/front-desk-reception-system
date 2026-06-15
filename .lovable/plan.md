## Diagnóstico

As policies RLS da tabela `tipos_brinde` estão corretas e usam `has_role(auth.uid(), 'admin')`, que consulta a tabela `public.user_roles`. Porém, o usuário admin atual (`pedro.silva@metrocasa.com.br`) **não tem registro em `user_roles`** — a permissão de admin do app está armazenada apenas em `profiles.role`. Por isso, qualquer INSERT/UPDATE/DELETE em `tipos_brinde` é bloqueado silenciosamente pelo RLS, mesmo o usuário sendo admin na UI.

Os logs confirmam: `"RPC falhou ou retornou false, verificando profiles..."` → `"Admin verificado via profiles"`. O frontend faz fallback, mas o Postgres não.

## Plano de correção

### 1. Backfill de `user_roles` a partir de `profiles`
Inserir em `user_roles` todos os usuários que hoje têm `profiles.role = 'admin'` (e demais roles existentes), evitando duplicatas via `ON CONFLICT`.

### 2. Trigger de sincronização
Criar trigger `AFTER INSERT OR UPDATE OF role` em `profiles` que mantém `user_roles` sincronizado automaticamente:
- Quando `profiles.role` muda para `admin` (ou outro valor válido do enum `app_role`), insere/garante o registro em `user_roles`.
- Quando muda para algo que não é mais admin, remove o registro antigo.

Isso garante que qualquer alteração futura no painel continue funcionando sem precisar mexer em duas tabelas.

### 3. Melhorar feedback de erro no frontend
Hoje os botões de criar/editar/excluir/toggle em `BrindesAdmin.tsx` provavelmente falham sem mostrar mensagem clara. Adicionar `toast.error` com a mensagem retornada pelo Supabase em todas as mutações (`handleSave`, `handleDelete`, `handleToggleAtivo`, `handleToggleAutomatica`) para que erros de RLS futuros fiquem visíveis em vez de silenciosos.

## Arquivos afetados

- **Migração nova**: backfill + função + trigger de sincronização `profiles.role` → `user_roles`.
- **`src/pages/admin/BrindesAdmin.tsx`**: tratamento de erro nas mutações com `toast.error`.

## Resultado esperado

Após aprovar:
- Pedro (e demais admins) passam a ter linha em `user_roles` com role `admin`.
- `has_role()` retorna `true` → as policies liberam INSERT/UPDATE/DELETE.
- Adicionar, excluir, ativar/desativar e alternar entrega automática funcionam imediatamente.
- Erros futuros aparecem em toast em vez de falhar em silêncio.