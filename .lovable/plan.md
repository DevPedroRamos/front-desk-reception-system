## Alterar autenticação e payload do endpoint de notificações

Modificar o envio para `https://api.metrocasamais.app/api/notifications/send` para usar o token diretamente no header `Authorization` (sem prefixo `Bearer`) e ajustar o payload do teste.

### 1. `src/hooks/useNotificarVisita.tsx`
- Trocar `Authorization: \`Bearer ${authToken}\`` por `Authorization: authToken` (token puro, sem `Bearer`).
- Manter o token vindo de `VITE_METROCASA_API_TOKEN` (atualmente em `.env`). Substituir o valor pelo novo token informado: `metro_keymIXibFgjfStiowgeLIjyRBMDKILiazJUSihNMlITEfDhVbXWUqPMyxxDyktfrOus`.
- O `buildPayload` (usado nas notificações reais de visita) permanece como está, pois é usado em produção pelo fluxo de visitas — só a forma do header muda.

### 2. Função "Testar Notificação" (no `AppSidebar.tsx` via `handleTestNotificacao`)
Atualmente o teste reutiliza `notificarVisita` com payload de visita. Conforme solicitado, o teste deve enviar exatamente:

```json
{
  "userIds": [],
  "title": "Teste de Conexao",
  "body": "Corpo do teste",
  "platformType": ["WEB"],
  "type": "SYSTEM"
}
```

Como esse payload é diferente do de visita, adicionarei uma função separada `testarNotificacao()` exportada pelo hook `useNotificarVisita`, que faz o POST com esse corpo fixo e o header `Authorization` sem `Bearer`. O `handleTestNotificacao` no `AppSidebar` passa a chamar essa nova função em vez de `notificarVisita`.

### Resumo de arquivos alterados
- `src/hooks/useNotificarVisita.tsx` — header sem `Bearer`; nova função `testarNotificacao` com payload fixo de teste.
- `src/components/AppSidebar.tsx` — `handleTestNotificacao` usa `testarNotificacao` em vez de `notificarVisita`.
- `.env` — atualizar `VITE_METROCASA_API_TOKEN` com o novo token.

### Pergunta
Confirma a atualização do token em `.env` para `metro_key...rOus`? (Se preferir manter o token atual no `.env` e usá-lo, basta dizer.)
