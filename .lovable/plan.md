## Paginar a API do Integra para trazer todos os corretores ativos

### Alteração em `supabase/functions/get-funcionarios/index.ts`

- Trocar a chamada única por um loop que percorre todas as páginas:
  - Usar `limit=200` (reduz o número de requisições; ~27 páginas para 5294 registros).
  - Começar em `page=1`, ler `pagination.totalPages` da primeira resposta e iterar até cobrir todas.
  - Guard de segurança: parar após 100 páginas para evitar loop infinito.
  - Manter o header `x-integra-api-key` em todas as requisições.
- Concatenar todos os `employees` recebidos antes de aplicar os filtros existentes (`status === "ACTIVE"` + departamento VENDAS).
- Buscar páginas sequencialmente (mais simples e suficiente). Se latência ficar alta, podemos otimizar com `Promise.all` em lotes depois.
- Aumentar `Cache-Control` para `public, max-age=300` (5 min) já que o dataset é grande e muda pouco.
- Em caso de falha em qualquer página, retornar 502 com a página que falhou no log.

### Validação
- `curl_edge_functions` em `/get-funcionarios` → conferir `corretores.length` > 0 e nomes de VENDAS.
- Abrir `/recepcao` e validar o dropdown.

### Fora de escopo
- Mudanças em UI, hooks, tabelas ou outras edge functions.
