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
| POST   | `/encerrar-visita-corretor`    | Encerrar visita ativa pelo corretor     |

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

## POST /encerrar-visita-corretor

Encerra uma visita **ativa** pelo corretor (app externo). Atualiza `status` para `finalizado`, registra `horario_saida` e marca `encerrado_por_corretor = true`.

### Fluxo recomendado

1. `GET /get-corretor-visitas-ativas?integraId={UUID}` — listar visitas ativas
2. Usuário clica em "Encerrar atendimento"
3. `POST /encerrar-visita-corretor` com `visitId` e `integraId`

### Headers

| Header         | Valor                |
|----------------|----------------------|
| `Content-Type` | `application/json`   |
| `x-api-key`    | `FRONT_DESK_API_KEY` |

### Body (JSON)

| Campo       | Obrigatório | Tipo   | Descrição                          |
|-------------|-------------|--------|------------------------------------|
| `visitId`   | Sim         | UUID   | ID da visita a encerrar            |
| `integraId` | Sim         | UUID   | ID Integra do corretor (validação) |

```json
{
  "visitId": "uuid-da-visita",
  "integraId": "ce5e8226-5f10-4fba-a560-78dee9eb764f"
}
```

### Resposta de sucesso — `200 OK`

```json
{
  "success": true,
  "visita": {
    "id": "uuid-da-visita",
    "status": "finalizado",
    "horario_saida": "2026-06-23T14:30:00.000Z",
    "encerrado_por_corretor": true,
    "origem_encerramento": {
      "tipo": "corretor",
      "integra_id": "ce5e8226-5f10-4fba-a560-78dee9eb764f",
      "encerrado_em": "2026-06-23T14:30:00.000Z"
    }
  }
}
```

### Erros

| Status | Body | Causa |
|--------|------|-------|
| `400`  | `{ "error": "Campos visitId e integraId sao obrigatorios" }` | Body incompleto |
| `401`  | `{ "error": "Nao autorizado" }` | API key inválida |
| `403`  | `{ "error": "Corretor nao autorizado..." }` | `integraId` ≠ `corretor_id` da visita |
| `404`  | `{ "error": "Visita nao encontrada" }` | `visitId` inexistente |
| `409`  | `{ "error": "Visita ja finalizada" }` | Visita não está `ativo` |
| `405`  | `{ "error": "Metodo nao permitido" }` | Método diferente de POST |
| `500`  | `{ "error": "...", "detail": "..." }` | Erro interno |

### Indicadores no banco

| Coluna                  | Valor após encerramento pelo corretor |
|-------------------------|---------------------------------------|
| `status`                | `finalizado`                          |
| `horario_saida`         | timestamp ISO do encerramento         |
| `encerrado_por_corretor`| `true`                                |
| `origem_encerramento`   | `{ tipo, integra_id, encerrado_em }`  |

Encerramentos pela recepção mantêm `encerrado_por_corretor = false`.

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

### cURL — encerrar visita

```bash
curl -X POST "https://mghsqsdfikclpktjlqpe.supabase.co/functions/v1/encerrar-visita-corretor" \
  -H "Content-Type: application/json" \
  -H "x-api-key: SUA_CHAVE_AQUI" \
  -d '{"visitId":"uuid-da-visita","integraId":"ce5e8226-5f10-4fba-a560-78dee9eb764f"}'
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

### JavaScript (fetch) — encerrar visita

```javascript
const response = await fetch(
  'https://mghsqsdfikclpktjlqpe.supabase.co/functions/v1/encerrar-visita-corretor',
  {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'x-api-key': process.env.FRONT_DESK_API_KEY,
    },
    body: JSON.stringify({
      visitId: 'uuid-da-visita',
      integraId: 'ce5e8226-5f10-4fba-a560-78dee9eb764f',
    }),
  },
);

const data = await response.json();
console.log(data.success, data.visita);
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

**Encerrar visita:**
```bash
node scripts/test-encerrar-visita-corretor.mjs \
  --visitId=UUID_DA_VISITA \
  --integraId=ce5e8226-5f10-4fba-a560-78dee9eb764f
```

Parâmetros opcionais (scripts GET):

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
| Edge Function (encerrar)| `supabase/functions/encerrar-visita-corretor/index.ts`   |
| Módulo histórico     | `src/api/historico-corretor/`                             |
| Módulo visitas ativas| `src/api/visitas-ativas-corretor/`                        |
| Módulo encerrar      | `src/api/encerrar-visita-corretor/`                       |
| Script teste hist.   | `scripts/test-historico-corretor.mjs`                     |
| Script teste ativas  | `scripts/test-visitas-ativas-corretor.mjs`                |
| Script teste encerrar| `scripts/test-encerrar-visita-corretor.mjs`               |
| Migration encerramento | `supabase/migrations/20260623120000_add_encerrado_por_corretor_visits.sql` |
| Config Supabase      | `supabase/config.toml`                                    |

---

## Changelog

| Versão | Data       | Descrição                                      |
|--------|------------|------------------------------------------------|
| 1.2    | 2026-06-23 | Rota POST para encerrar visita pelo corretor   |
| 1.1    | 2026-06-22 | Rota de visitas ativas do corretor             |
| 1.0    | 2026-06-22 | Rota inicial: histórico de visitas finalizadas |
