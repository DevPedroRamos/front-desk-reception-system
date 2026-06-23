## Adicionar autenticação na API do Integra

### 1. Cadastrar secret
- Solicitar via `add_secret` a variável `INTEGRA_API_KEY` (usuário cola o valor no formulário seguro).

### 2. Atualizar edge function `get-funcionarios`
Em `supabase/functions/get-funcionarios/index.ts`:
- Ler `const integraApiKey = Deno.env.get("INTEGRA_API_KEY")`.
- Se ausente, retornar 500 com mensagem clara.
- Adicionar header na chamada `fetch`:
  ```ts
  headers: {
    "x-integra-api-key": integraApiKey,
    "accept": "*/*",
  }
  ```
- Manter o restante (filtros `status === "ACTIVE"` + departamento VENDAS, CORS, cache 60s).

### 3. Validação
- Deploy automático da função.
- Testar via `curl_edge_functions` para confirmar 200 e lista de corretores.
- Abrir `/recepcao` e validar que o select de corretores carrega da API Integra.

### Fora de escopo
- Mudanças em UI, hooks ou tabelas (já feitos na iteração anterior).
