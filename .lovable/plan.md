## Validação do bloqueio de usuários banidos

### Auditoria do estado atual

O bloqueio hoje acontece em **3 camadas no frontend** (todas client-side):

| Camada | Local | O que faz |
|---|---|---|
| Cadastro | `AuthContext.signUp` | Bloqueia signup se `users.ban = true` |
| Login | `AuthContext.signIn` | Após autenticar, consulta `users.ban` e faz `signOut()` se banido |
| Sessão ativa | `useBanCheck` em `ProtectedRoutes` | Consulta `users.ban` no mount; se true, redireciona para `/banned` |

### Lacunas identificadas (independem de role)

1. **Banimento durante a sessão não derruba o usuário.** `useBanCheck` roda só no mount; quem já está logado mantém acesso até recarregar a página. Não existe Realtime escutando alterações em `users.ban`.
2. **Falha silenciosa em `useBanCheck`.** `.single()` retorna erro se não achar linha em `users` (ex.: CPF dessincronizado, sem CPF nos metadados nem em `profiles`) — o hook assume `isBanned = false` e libera o acesso. Um banido sem CPF acessível passa.
3. **Sem enforcement no backend.** Nenhuma RLS leva `ban` em conta. Um usuário banido com JWT ainda válido pode chamar a Data API diretamente (qualquer endpoint cuja policy só exige `auth.uid()`) e ler/escrever dados.
4. **Rotas públicas autenticadas não checam ban.** `/gerar-link`, `/check-in`, `/agendamentos`(parcial), e qualquer rota fora de `ProtectedRoutes` que use sessão não passa por `useBanCheck`. (TV/MKT/Persona/Agendar/PesquisaSatisfacao são públicas por design — ok.)
5. **`/banned` permite re-tentar `/`.** Como o redirect depende do hook acima, qualquer falha de leitura libera o app.

### Plano de correção

**1. Função SQL canônica `public.is_user_banned(uuid)`** (`SECURITY DEFINER`, `search_path=public`):
   - Resolve o CPF do usuário via `auth.users.raw_user_meta_data->>'cpf'` com fallback para `profiles.cpf`.
   - Retorna `true` se existir `users.ban = true` para esse CPF, **e também `true` se o CPF não puder ser resolvido** (fail-closed — corrige a lacuna #2).

**2. Enforcement no backend (lacuna #3)**
   - Adicionar `AND NOT public.is_user_banned(auth.uid())` nas policies de INSERT/UPDATE/DELETE das tabelas sensíveis acessadas pelo app (lista: `visits`, `lista_espera`, `agendamentos`, `recebimentos`, `entregas`, `brindes`, `tipos_brinde`, `corretores_online`, `lead_historico`, `lead_observacoes`, `persona_respostas`, `pesquisas_satisfacao`, `corretor_links`, `dashboards`, `metas`). SELECT fica livre para não quebrar a tela `/banned`.
   - Confirmar lista com você antes de aplicar (algumas tabelas talvez devam bloquear até SELECT).

**3. Refatorar `useBanCheck` (lacunas #1, #2, #5)**
   - Usar a RPC `is_user_banned` em vez de query direta (fail-closed automático).
   - Adicionar subscription Realtime em `users` filtrada pelo CPF do usuário: ao detectar `ban = true`, fazer `signOut()` imediato e redirecionar para `/banned`.
   - Habilitar Realtime em `public.users` via `ALTER PUBLICATION supabase_realtime ADD TABLE public.users` (se ainda não estiver).

**4. Cobrir rotas autenticadas fora de `ProtectedRoutes` (lacuna #4)**
   - Envolver `/gerar-link` e `/check-in` com a mesma verificação (ou movê-las para dentro de `ProtectedRoutes` se exigirem login). Confirmar com você quais dessas rotas são realmente públicas.

**5. Mensagens e UX**
   - Toast claro ao ser deslogado por ban durante a sessão.
   - Manter `/banned` como hoje, mas redirecionar pra lá só após `signOut()` para garantir que o JWT seja invalidado.

### Pontos que precisam da sua decisão antes da implementação

- **Rotas públicas com sessão**: `/gerar-link` e `/check-in` devem exigir login + checagem de ban?
- **Bloqueio em SELECT**: alguma tabela deve impedir banidos até de **ler** dados (ex.: `visits`, `agendamentos`)? Por padrão proponho bloquear só escrita.
- **Lista de tabelas a proteger**: confirmar a lista acima ou ajustar.
