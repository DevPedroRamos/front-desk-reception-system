import { readFileSync } from 'node:fs';

function loadToken() {
  const content = readFileSync('.env', 'utf-8');
  for (const line of content.split('\n')) {
    const m = line.match(/^VITE_METROCASA_API_TOKEN=(.+)$/);
    if (m) return m[1].replace(/^["']|["']$/g, '');
  }
  throw new Error('token not found');
}

const API_URL = 'https://api.metrocasamais.app/api/notifications/send';
const token = loadToken();
const basePayload = {
  targetType: 'ALL',
  title: 'Teste Auth',
  body: 'Teste',
  platformType: 'BOTH',
};

async function test(label, options) {
  const res = await fetch(API_URL, options);
  const body = await res.text();
  console.log(`\n[${label}] Status: ${res.status}`);
  console.log(body.slice(0, 200));
}

await test('header x-api-key', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json', 'x-api-key': token },
  body: JSON.stringify(basePayload),
});

await test('body x-api-key', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({ ...basePayload, 'x-api-key': token }),
});

await test('header Authorization Bearer', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
  body: JSON.stringify(basePayload),
});

await test('header api-key', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json', 'api-key': token },
  body: JSON.stringify(basePayload),
});
