/**
 * Teste da rota POST encerrar-visita-corretor
 *
 * Uso:
 *   node scripts/test-encerrar-visita-corretor.mjs --visitId=UUID --integraId=UUID
 *   node scripts/test-encerrar-visita-corretor.mjs --api-key=SUA_CHAVE
 *
 * Variaveis de ambiente (ou .env):
 *   VITE_SUPABASE_URL
 *   FRONT_DESK_API_KEY
 */

import { readFileSync } from 'node:fs';

const DEFAULT_INTEGRA_ID = 'ce5e8226-5f10-4fba-a560-78dee9eb764f';

function loadEnv() {
  const env = {};
  try {
    for (const line of readFileSync('.env', 'utf-8').split('\n')) {
      const trimmed = line.trim();
      if (!trimmed || trimmed.startsWith('#')) continue;
      const i = trimmed.indexOf('=');
      if (i === -1) continue;
      const key = trimmed.slice(0, i).trim();
      let val = trimmed.slice(i + 1).trim();
      if ((val.startsWith('"') && val.endsWith('"')) || (val.startsWith("'") && val.endsWith("'"))) {
        val = val.slice(1, -1);
      }
      env[key] = val;
    }
  } catch {
    // .env opcional
  }
  return env;
}

function parseArgs(argv) {
  const args = { visitId: '', integraId: DEFAULT_INTEGRA_ID, apiKey: '' };
  for (const arg of argv) {
    if (arg.startsWith('--visitId=')) args.visitId = arg.slice('--visitId='.length);
    if (arg.startsWith('--integraId=')) args.integraId = arg.slice('--integraId='.length);
    if (arg.startsWith('--api-key=')) args.apiKey = arg.slice('--api-key='.length);
  }
  return args;
}

function formatJson(text) {
  try {
    return JSON.stringify(JSON.parse(text), null, 2);
  } catch {
    return text || '(vazio)';
  }
}

const fileEnv = loadEnv();
const args = parseArgs(process.argv.slice(2));

const supabaseUrl = process.env.VITE_SUPABASE_URL || fileEnv.VITE_SUPABASE_URL;
const apiKey = args.apiKey || process.env.FRONT_DESK_API_KEY || fileEnv.FRONT_DESK_API_KEY || '';

if (!supabaseUrl) {
  console.error('Erro: VITE_SUPABASE_URL nao encontrada no .env ou ambiente.');
  process.exit(1);
}

if (!args.visitId) {
  console.error('Erro: --visitId e obrigatorio.');
  console.error('Exemplo: node scripts/test-encerrar-visita-corretor.mjs --visitId=UUID --integraId=UUID');
  process.exit(1);
}

const url = `${supabaseUrl}/functions/v1/encerrar-visita-corretor`;
const payload = { visitId: args.visitId, integraId: args.integraId };

console.log('=== Teste encerrar-visita-corretor ===\n');
console.log('POST', url);
console.log('Body:', JSON.stringify(payload, null, 2));
console.log('x-api-key:', apiKey ? `${apiKey.slice(0, 8)}...` : '(nao configurada)');
console.log('');

if (!apiKey) {
  console.warn('AVISO: FRONT_DESK_API_KEY nao definida. Esperado 401 Unauthorized.\n');
}

const response = await fetch(url, {
  method: 'POST',
  headers: {
    'Content-Type': 'application/json',
    ...(apiKey ? { 'x-api-key': apiKey } : {}),
  },
  body: JSON.stringify(payload),
});

const body = await response.text();

console.log('STATUS:', response.status, response.statusText);
console.log('\nRESPONSE:');
console.log(formatJson(body));

if (response.ok) {
  const data = JSON.parse(body);
  console.log('\nRESUMO:');
  console.log(`  Visita encerrada: ${data.visita?.id}`);
  console.log(`  Status: ${data.visita?.status}`);
  console.log(`  Encerrado por corretor: ${data.visita?.encerrado_por_corretor}`);
  process.exit(0);
}

process.exit(response.status === 401 && !apiKey ? 0 : 1);
