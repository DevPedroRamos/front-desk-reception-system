import { readFileSync } from 'node:fs';

function loadToken() {
  const content = readFileSync('.env', 'utf-8');
  for (const line of content.split('\n')) {
    const trimmed = line.trim();
    if (!trimmed || trimmed.startsWith('#')) continue;
    for (const key of ['VITE_METROCASA_API_TOKEN', 'METROCASA_API_KEY']) {
      if (trimmed.startsWith(`${key}=`)) {
        let val = trimmed.slice(key.length + 1).trim();
        if ((val.startsWith('"') && val.endsWith('"')) || (val.startsWith("'") && val.endsWith("'"))) {
          val = val.slice(1, -1);
        }
        return val.trim();
      }
    }
  }
  throw new Error('Token nao encontrado. Defina VITE_METROCASA_API_TOKEN no .env');
}

const API_URL = 'https://api.metrocasamais.app/api/notifications/send';
const token = loadToken();

console.log('Validando token MetroCasa...');
console.log(`Token: ${token.slice(0, 12)}...${token.slice(-4)} (${token.length} chars)`);

const res = await fetch(API_URL, {
  method: 'POST',
  headers: { 'Content-Type': 'application/json', 'x-api-key': token },
  body: JSON.stringify({
    targetType: 'ALL',
    title: 'Validacao Token',
    body: 'Teste de validacao',
    platformType: 'BOTH',
  }),
});

const body = await res.text();
console.log(`\nStatus: ${res.status} ${res.statusText}`);
console.log('Body:', body);

if (res.ok) {
  console.log('\n[OK] Token valido. Atualize METROCASA_API_KEY no Supabase com este mesmo valor.');
  process.exit(0);
}

console.log('\n[FALHA] Token rejeitado pela API MetroCasa.');
console.log('Acao: copie o x-api-key que funciona no Postman (status 201) e:');
console.log('  1. Atualize VITE_METROCASA_API_TOKEN no .env');
console.log('  2. Atualize METROCASA_API_KEY em Supabase Dashboard → Edge Functions → Secrets');
console.log('  3. Rode novamente: npm run test:notify:validate');
process.exit(1);
