# Front Desk — Documentação da API

Documento base para integração de aplicações externas com o sistema de recepção Metrocasa.

**Base URL (produção):**
```
https://mghsqsdfikclpktjlqpe.supabase.co/functions/v1
```

---

## Autenticação

Todas as rotas exigem o header:

| Header      | Valor                          |
|-------------|--------------------------------|
| `x-api-key` | Chave secreta (`FRONT_DESK_API_KEY`) |

A chave é configurada no **Supabase Dashboard** → Project Settings → Edge Functions → Secrets.

Requisições sem chave ou com chave inválida retornam `401 Unauthorized`.

---

## Endpoints disponíveis

| Método | Rota                           | Descrição                              |
|--------|--------------------------------|----------------------------------------|
| GET    | `/get-corretor-historico`      | Histórico de visitas finalizadas       |
| GET    | `/get-corretor-visitas-ativas` | Visitas ativas em andamento            |

---

## GET /get-corretor-historico

Retorna o histórico de visitas **finalizadas** de um corretor, identificado pelo **ID Integra**.

### Query parameters

| Parâmetro   | Obrigatório | Tipo   | Default | Descrição                                      |
|-------------|-------------|--------|---------|------------------------------------------------|
| `integraId` | Sim         | UUID   | —       | ID do corretor no Integra (`corretor_id`)      |
| `limit`     | Não         | number | `50`    | Quantidade de registros por página (máx. 200)  |
| `offset`    | Não         | number | `0`     | Deslocamento para paginação                    |

### Critérios de filtro

- `corretor_id = integraId`
- `status = 'finalizado'`
- Ordenação: `horario_saida` decrescente, depois `created_at` decrescente

### Resposta de sucesso — `200 OK`

```json
{
  "integra_id": "ce5e8226-5f10-4fba-a560-78dee9eb764f",
  "corretor_nome": "Nome do Corretor",
  "total": 15,
  "visitas": [
    {
      "id": "uuid-da-visita",
      "cliente_nome": "Maria Silva",
      "cliente_cpf": "12345678901",
      "loja": "Loja 1",
      "andar": "N/A",
      "mesa": 5,
      "empreendimento": "Residencial Exemplo",
      "horario_entrada": "2026-06-22T10:00:00.000Z",
      "horario_saida": "2026-06-22T11:30:00.000Z",
      "created_at": "2026-06-22T10:00:00.000Z"
    }
  ]
}
```

### Campos da resposta

| Campo           | Tipo     | Descrição                                           |
|-----------------|----------|-----------------------------------------------------|
| `integra_id`    | string   | ID Integra consultado                               |
| `corretor_nome` | string?  | Nome do corretor (da primeira visita da página)     |
| `total`         | number   | Total de visitas finalizadas do corretor            |
| `visitas`       | array    | Lista paginada de visitas                           |

### Campos de cada visita

| Campo              | Tipo    | Descrição                        |
|--------------------|---------|----------------------------------|
| `id`               | string  | UUID da visita                   |
| `cliente_nome`     | string  | Nome do cliente                  |
| `cliente_cpf`      | string  | CPF do cliente                   |
| `loja`             | string  | Loja do atendimento              |
| `andar`            | string  | Andar (ou `N/A`)                 |
| `mesa`             | number  | Número da mesa                   |
| `empreendimento`   | string? | Empreendimento de interesse      |
| `horario_entrada`  | string? | ISO 8601 — início do atendimento |
| `horario_saida`    | string? | ISO 8601 — fim do atendimento    |
| `created_at`       | string? | ISO 8601 — criação do registro   |

### Erros

| Status | Body                                      | Causa                              |
|--------|-------------------------------------------|------------------------------------|
| `400`  | `{ "error": "Parametro integraId e obrigatorio" }` | `integraId` ausente na URL |
| `401`  | `{ "error": "Nao autorizado" }`            | `x-api-key` ausente ou inválida    |
| `405`  | `{ "error": "Metodo nao permitido" }`     | Método diferente de GET            |
| `500`  | `{ "error": "...", "detail": "..." }`     | Erro interno ou falha no banco     |

---

## GET /get-corretor-visitas-ativas

Retorna as visitas **ativas** (em andamento) de um corretor, identificado pelo **ID Integra**.

### Query parameters

| Parâmetro   | Obrigatório | Tipo   | Default | Descrição                                      |
|-------------|-------------|--------|---------|------------------------------------------------|
| `integraId` | Sim         | UUID   | —       | ID do corretor no Integra (`corretor_id`)      |
| `limit`     | Não         | number | `50`    | Quantidade de registros por página (máx. 200)  |
| `offset`    | Não         | number | `0`     | Deslocamento para paginação                    |

### Critérios de filtro

- `corretor_id = integraId`
- `status = 'ativo'`
- Ordenação: `horario_entrada` decrescente, depois `created_at` decrescente

### Resposta de sucesso — `200 OK`

```json
{
  "integra_id": "ce5e8226-5f10-4fba-a560-78dee9eb764f",
  "corretor_nome": "Nome do Corretor",
  "total": 2,
  "visitas": [
    {
      "id": "uuid-da-visita",
      "cliente_nome": "Maria Silva",
      "cliente_cpf": "12345678901",
      "cliente_whatsapp": "11999999999",
      "loja": "Loja 1",
      "andar": "N/A",
      "mesa": 5,
      "empreendimento": "Residencial Exemplo",
      "horario_entrada": "2026-06-22T10:00:00.000Z",
      "created_at": "2026-06-22T10:00:00.000Z"
    }
  ]
}
```

### Campos da resposta

| Campo           | Tipo     | Descrição                                           |
|-----------------|----------|-----------------------------------------------------|
| `integra_id`    | string   | ID Integra consultado                               |
| `corretor_nome` | string?  | Nome do corretor (da primeira visita da página)     |
| `total`         | number   | Total de visitas ativas do corretor                 |
| `visitas`       | array    | Lista paginada de visitas                           |

### Campos de cada visita

| Campo               | Tipo    | Descrição                        |
|---------------------|---------|----------------------------------|
| `id`                | string  | UUID da visita                   |
| `cliente_nome`      | string  | Nome do cliente                  |
| `cliente_cpf`       | string  | CPF do cliente                   |
| `cliente_whatsapp`  | string? | WhatsApp do cliente              |
| `loja`              | string  | Loja do atendimento              |
| `andar`             | string  | Andar (ou `N/A`)                 |
| `mesa`              | number  | Número da mesa                   |
| `empreendimento`    | string? | Empreendimento de interesse      |
| `horario_entrada`   | string? | ISO 8601 — início do atendimento |
| `created_at`        | string? | ISO 8601 — criação do registro   |

### Erros

| Status | Body                                      | Causa                              |
|--------|-------------------------------------------|------------------------------------|
| `400`  | `{ "error": "Parametro integraId e obrigatorio" }` | `integraId` ausente na URL |
| `401`  | `{ "error": "Nao autorizado" }`            | `x-api-key` ausente ou inválida    |
| `405`  | `{ "error": "Metodo nao permitido" }`     | Método diferente de GET            |
| `500`  | `{ "error": "...", "detail": "..." }`     | Erro interno ou falha no banco     |

---

## Exemplos

### cURL — histórico

```bash
curl -G "https://mghsqsdfikclpktjlqpe.supabase.co/functions/v1/get-corretor-historico" \
  --data-urlencode "integraId=ce5e8226-5f10-4fba-a560-78dee9eb764f" \
  --data-urlencode "limit=50" \
  --data-urlencode "offset=0" \
  -H "x-api-key: SUA_CHAVE_AQUI"
```

### cURL — visitas ativas

```bash
curl -G "https://mghsqsdfikclpktjlqpe.supabase.co/functions/v1/get-corretor-visitas-ativas" \
  --data-urlencode "integraId=ce5e8226-5f10-4fba-a560-78dee9eb764f" \
  --data-urlencode "limit=50" \
  --data-urlencode "offset=0" \
  -H "x-api-key: SUA_CHAVE_AQUI"
```

### JavaScript (fetch) — visitas ativas

```javascript
const integraId = 'ce5e8226-5f10-4fba-a560-78dee9eb764f';
const url = new URL('https://mghsqsdfikclpktjlqpe.supabase.co/functions/v1/get-corretor-visitas-ativas');
url.searchParams.set('integraId', integraId);
url.searchParams.set('limit', '50');
url.searchParams.set('offset', '0');

const response = await fetch(url, {
  headers: { 'x-api-key': process.env.FRONT_DESK_API_KEY },
});

const data = await response.json();
console.log(data.total, data.visitas);
```

### JavaScript (fetch) — histórico

```javascript
const integraId = 'ce5e8226-5f10-4fba-a560-78dee9eb764f';
const url = new URL('https://mghsqsdfikclpktjlqpe.supabase.co/functions/v1/get-corretor-historico');
url.searchParams.set('integraId', integraId);
url.searchParams.set('limit', '50');
url.searchParams.set('offset', '0');

const response = await fetch(url, {
  headers: { 'x-api-key': process.env.FRONT_DESK_API_KEY },
});

const data = await response.json();
console.log(data.total, data.visitas);
```

### Paginação

Para buscar a segunda página com 50 registros:

```
GET .../get-corretor-historico?integraId={UUID}&limit=50&offset=50
```

---

## Teste local

O repositório inclui scripts de teste:

**Histórico (finalizadas):**
```bash
node scripts/test-historico-corretor.mjs --api-key=SUA_CHAVE
```

**Visitas ativas:**
```bash
node scripts/test-visitas-ativas-corretor.mjs --api-key=SUA_CHAVE
```

Parâmetros opcionais (ambos os scripts):

```bash
node scripts/test-visitas-ativas-corretor.mjs \
  --integraId=ce5e8226-5f10-4fba-a560-78dee9eb764f \
  --limit=10 \
  --offset=0 \
  --api-key=SUA_CHAVE
```

Também é possível definir `FRONT_DESK_API_KEY` no `.env` local.

---

## Referência de código

| Recurso              | Caminho                                                   |
|----------------------|-----------------------------------------------------------|
| Edge Function (hist.)| `supabase/functions/get-corretor-historico/index.ts`      |
| Edge Function (ativas)| `supabase/functions/get-corretor-visitas-ativas/index.ts`|
| Módulo histórico     | `src/api/historico-corretor/`                             |
| Módulo visitas ativas| `src/api/visitas-ativas-corretor/`                        |
| Script teste hist.   | `scripts/test-historico-corretor.mjs`                     |
| Script teste ativas  | `scripts/test-visitas-ativas-corretor.mjs`                |
| Config Supabase      | `supabase/config.toml`                                    |

---

## Changelog

| Versão | Data       | Descrição                                      |
|--------|------------|------------------------------------------------|
| 1.1    | 2026-06-22 | Rota de visitas ativas do corretor             |
| 1.0    | 2026-06-22 | Rota inicial: histórico de visitas finalizadas |
