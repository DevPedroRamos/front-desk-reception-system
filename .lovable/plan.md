## Diagnóstico

O erro `23503 visits_corretor_id_fkey` significa que a tabela `visits.corretor_id` tem **foreign key** para `public.users(id)`. Quando você seleciona um corretor vindo da API Integra (ex.: `01548828-75f1-49f4-be6d-229e37c8b68f`), esse UUID **não existe** em `public.users`, então o Postgres rejeita o insert.

Antes da integração com a Integra, todos os corretores vinham da tabela `users`, então o FK funcionava. Agora a fonte dos corretores é externa, e o FK está bloqueando.

## Plano: remover o FK `visits_corretor_id_fkey`

Como a fonte de verdade dos corretores agora é a API Integra (não mais a tabela `users`), o FK não faz mais sentido. A solução mais limpa é dropar a constraint e manter `corretor_id` como UUID livre.

### Passo 1 — Migração SQL
```sql
ALTER TABLE public.visits DROP CONSTRAINT IF EXISTS visits_corretor_id_fkey;
```

Mantém:
- A coluna `corretor_id` (UUID) — agora armazena o ID do funcionário Integra.
- `corretor_nome`, `corretor_cpf` (já são salvos com os dados vindos da Integra).
- Nenhum dado existente é afetado.

### Passo 2 — Verificação
Após a migração, abrir `/recepcao`, escolher um corretor da lista e iniciar uma visita. O insert deve passar sem erro 23503.

### Fora do escopo
- Não alterar o FK em outras tabelas (nenhuma outra usa `corretor_id → users`).
- Não alterar a tabela `users` (continua sendo usada para auth/perfis internos, brindes, recebimentos etc).
- Não criar nenhum upsert sincronizando Integra → `users` (desnecessário e adicionaria complexidade).

### Alternativa considerada (rejeitada)
Sincronizar cada corretor escolhido na tabela `users` antes do insert. Rejeitada porque `users` tem várias colunas NOT NULL (role, apelido, gerente, superintendente, diretor) que não vêm da Integra de forma confiável, e duplicaria a fonte de verdade.