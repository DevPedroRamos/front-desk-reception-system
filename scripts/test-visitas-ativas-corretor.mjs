/**
 * Teste da rota GET get-corretor-visitas-ativas
 *
 * Uso:
 *   node scripts/test-visitas-ativas-corretor.mjs
 *   node scripts/test-visitas-ativas-corretor.mjs --integraId=UUID
 *   node scripts/test-visitas-ativas-corretor.mjs --api-key=SUA_CHAVE
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
    // .env opcional se variaveis vierem do ambiente
  }
  return env;
}

function parseArgs(argv) {
  const args = { integraId: DEFAULT_INTEGRA_ID, limit: 50, offset: 0, apiKey: '' };
  for (const arg of argv) {
    if (arg.startsWith('--integraId=')) args.integraId = arg.slice('--integraId='.length);
    if (arg.startsWith('--limit=')) args.limit = Number(arg.slice('--limit='.length));
    if (arg.startsWith('--offset=')) args.offset = Number(arg.slice('--offset='.length));
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

const url = new URL(`${supabaseUrl}/functions/v1/get-corretor-visitas-ativas`);
url.searchParams.set('integraId', args.integraId);
url.searchParams.set('limit', String(args.limit));
url.searchParams.set('offset', String(args.offset));

console.log('=== Teste get-corretor-visitas-ativas ===\n');
console.log('GET', url.toString());
console.log('x-api-key:', apiKey ? `${apiKey.slice(0, 8)}...` : '(nao configurada)');
console.log('');

if (!apiKey) {
  console.warn('AVISO: FRONT_DESK_API_KEY nao definida. Esperado 401 Unauthorized.');
  console.warn('Configure no Supabase Dashboard ou passe --api-key=...\n');
}

const response = await fetch(url, {
  method: 'GET',
  headers: apiKey ? { 'x-api-key': apiKey } : {},
});

const body = await response.text();

console.log('STATUS:', response.status, response.statusText);
console.log('\nRESPONSE:');
console.log(formatJson(body));

if (response.ok) {
  const data = JSON.parse(body);
  console.log('\nRESUMO:');
  console.log(`  Corretor: ${data.corretor_nome ?? '(sem nome)'}`);
  console.log(`  Total ativas: ${data.total}`);
  console.log(`  Retornadas nesta pagina: ${data.visitas?.length ?? 0}`);
  process.exit(0);
}

process.exit(response.status === 401 && !apiKey ? 0 : 1);
