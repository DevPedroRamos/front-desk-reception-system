## Problema

Depois de remover o FK `visits.corretor_id → users(id)` (corretores agora vêm da API Integra), o dashboard quebrou em dois pontos:

1. **RPC `get_dashboard_stats_filtered` → erro `42702`**  
   O parâmetro da função se chama `superintendente`, igual à coluna `users.superintendente`. O Postgres não consegue desambiguar e a função inteira falha. Como o front faz fallback para cálculo manual, ele acaba sendo executado — mas o resultado correto deveria vir da RPC.

2. **Queries de visitas ativas/finalizadas → erro `PGRST200`**  
   `src/pages/Index.tsx` (linhas 355 e 405) faz `users!visits_corretor_id_fkey(superintendente)` no `.select(...)`. Como o FK foi dropado, o PostgREST não encontra a relação e a query retorna erro — por isso "nenhum atendimento ativo" e "nenhuma visita finalizada" aparecem zerados.

O embed `users(superintendente)` **não é usado na renderização** das tabelas — a filtragem por superintendente já é feita separadamente buscando IDs em `users` e aplicando `.in('corretor_id', userIds)`. Então basta remover o embed.

## Correções

### 1. Migration: corrigir RPC `get_dashboard_stats_filtered`

Recriar a função renomeando o parâmetro `superintendente` para `superintendente_filter`, qualificando as comparações para eliminar a ambiguidade. Lógica e assinatura de retorno permanecem idênticas; o front continua chamando a RPC com a chave `superintendente` (mapearemos para o novo nome do parâmetro nomeado).

> Observação: como o cliente passa `params.superintendente`, o nome do parâmetro precisa continuar sendo `superintendente` na chamada. Solução: manter o nome do parâmetro, mas atribuí-lo a uma variável local (`v_superintendente`) no início do bloco `BEGIN` e usar essa variável nas comparações — isso elimina a ambiguidade sem mudar a assinatura pública.

### 2. `src/pages/Index.tsx` — remover embed quebrado

- Em `loadActiveVisits` (linha ~355): remover a linha `users!visits_corretor_id_fkey(superintendente)` do `.select(...)`.
- Em `loadFinishedVisits` (linha ~405): remover a mesma linha.

Nenhuma outra alteração necessária — a interface `Visit` não inclui esse campo e a renderização das tabelas não o usa.

### 3. Verificação

Após as correções:
- Dashboard carrega via RPC sem cair no fallback.
- "Atendimentos ativos" e "Visitas finalizadas" voltam a listar registros.
- Filtro por superintendente continua funcionando (via lookup separado em `users`).

## Fora de escopo

- Não alteramos outras páginas (recepção, agendamentos, recebimento, entregas) — elas não usam o embed quebrado.
- Não recriamos o FK removido na migração anterior.
- Não mexemos na sincronização entre Integra e `users` (filtro por superintendente continua dependendo dos registros legados em `users`).