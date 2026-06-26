import { readFileSync } from 'node:fs';

function loadToken() {
  const content = readFileSync('.env', 'utf-8');
  for (const line of content.split('\n')) {
    const m = line.match(/^VITE_METROCASA_API_TOKEN=(.+)$/);
    if (m) return m[1].replace(/^["']|["']$/g, '').trim();
  }
  throw new Error('no token');
}

const API_URL = 'https://api.metrocasamais.app/api/notifications/send';
const token = loadToken();
const payload = { targetType: 'ALL', title: 'T', body: 'T', platformType: 'BOTH' };

async function tryAuth(label, headers, bodyObj = payload) {
  const res = await fetch(API_URL, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', ...headers },
    body: JSON.stringify(bodyObj),
  });
  console.log(`${label}: ${res.status} ${(await res.text()).slice(0, 80)}`);
}

console.log('Token .env length:', token.length);
console.log('Token prefix:', token.slice(0, 15));

await tryAuth('x-api-key header', { 'x-api-key': token });
await tryAuth('X-API-KEY header', { 'X-API-KEY': token });
await tryAuth('Authorization Bearer', { Authorization: `Bearer ${token}` });

// sem underscore apos metro_key
if (token.startsWith('metro_key_')) {
  const alt = token.replace('metro_key_', 'metro_key');
  await tryAuth('sem underscore (metro_keyXXX)', { 'x-api-key': alt });
}
