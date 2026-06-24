## Alterar header de autorização na API de notificações

### Objetivo
Trocar o cabeçalho HTTP usado nas requisições para `https://api.metrocasamais.app/api/notifications/send` de `Authorization` para `x-api-key` (minúsculo).

### Arquivos alterados
- `src/hooks/useNotificarVisita.tsx`

### Mudanças
- Na função `notificarVisita`: substituir `Authorization: authToken` por `'x-api-key': authToken`
- Na função `testarNotificacao`: substituir `Authorization: authToken` por `'x-api-key': authToken`

O valor do token continua vindo de `import.meta.env.VITE_METROCASA_API_TOKEN` (já atualizado no `.env`).
