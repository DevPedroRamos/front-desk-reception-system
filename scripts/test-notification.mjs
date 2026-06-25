import { readFileSync } from 'node:fs';
import { resolve, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';

const __dirname = dirname(fileURLToPath(import.meta.url));
const API_URL = 'https://api.metrocasamais.app/api/notifications/send';
const ORIGIN = 'http://localhost:8080';

function loadEnvToken() {
  const envPath = resolve(__dirname, '..', '.env');
  try {
    const content = readFileSync(envPath, 'utf-8');
    for (const line of content.split('\n')) {
      const trimmed = line.trim();
      if (!trimmed || trimmed.startsWith('#')) continue;
      const match = trimmed.match(/^VITE_METROCASA_API_TOKEN=(.+)$/);
      if (match) {
        return match[1].replace(/^["']|["']$/g, '');
      }
    }
  } catch (error) {
    console.error(`Erro ao ler .env em ${envPath}:`, error.message);
    process.exit(1);
  }
  console.error('VITE_METROCASA_API_TOKEN nao encontrado no .env');
  process.exit(1);
}

function printHeaders(label, headers) {
  console.log(`\n--- ${label} ---`);
  const corsHeaders = [
    'access-control-allow-origin',
    'access-control-allow-methods',
    'access-control-allow-headers',
    'access-control-max-age',
  ];
  for (const name of corsHeaders) {
    const value = headers.get(name);
    console.log(`  ${name}: ${value ?? '(ausente)'}`);
  }
}

function diagnoseCors(headers) {
  const allowOrigin = headers.get('access-control-allow-origin');
  const allowMethods = headers.get('access-control-allow-methods');
  const allowHeaders = headers.get('access-control-allow-headers');

  const issues = [];
  if (!allowOrigin) {
    issues.push('Access-Control-Allow-Origin ausente');
  } else if (allowOrigin !== '*' && allowOrigin !== ORIGIN) {
    issues.push(`Access-Control-Allow-Origin = "${allowOrigin}" (esperado "${ORIGIN}" ou "*")`);
  }
  if (!allowMethods || !allowMethods.toUpperCase().includes('POST')) {
    issues.push('Access-Control-Allow-Methods nao inclui POST');
  }
  if (!allowHeaders || !allowHeaders.toLowerCase().includes('x-api-key')) {
    issues.push('Access-Control-Allow-Headers nao inclui x-api-key');
  }

  if (issues.length === 0) {
    console.log('\n[OK] Preflight CORS parece correto para o navegador.');
  } else {
    console.log('\n[FALHA CORS] Problemas detectados no preflight:');
    for (const issue of issues) {
      console.log(`  - ${issue}`);
    }
    console.log('\nIsso explica o erro de CORS no app (fetch bloqueado antes do POST).');
  }
}

async function testPreflight() {
  console.log('\n========== ETAPA 1: Preflight OPTIONS (simulando navegador) ==========');
  console.log(`URL: ${API_URL}`);
  console.log(`Origin: ${ORIGIN}`);

  const response = await fetch(API_URL, {
    method: 'OPTIONS',
    headers: {
      Origin: ORIGIN,
      'Access-Control-Request-Method': 'POST',
      'Access-Control-Request-Headers': 'content-type, x-api-key',
    },
  });

  console.log(`\nStatus: ${response.status} ${response.statusText}`);
  printHeaders('Headers CORS recebidos', response.headers);
  diagnoseCors(response.headers);

  return response;
}

async function testPost(apiKey) {
  console.log('\n========== ETAPA 2: POST real (sem restricao de CORS) ==========');

  const payload = {
    targetType: 'ALL',
    title: 'Aviso Geral',
    body: 'Esta e uma notificacao enviada para todos no portal.',
    platformType: 'BOTH',
  };

  console.log('Payload:', JSON.stringify(payload, null, 2));

  const response = await fetch(API_URL, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'x-api-key': apiKey,
    },
    body: JSON.stringify(payload),
  });

  const body = await response.text();

  console.log(`\nStatus: ${response.status} ${response.statusText}`);
  printHeaders('Headers de resposta', response.headers);
  console.log('\nBody:');
  try {
    console.log(JSON.stringify(JSON.parse(body), null, 2));
  } catch {
    console.log(body || '(vazio)');
  }

  if (response.ok) {
    console.log('\n[OK] POST concluido com sucesso.');
  } else {
    console.log('\n[ERRO] POST retornou status de erro.');
  }

  return response;
}

async function main() {
  console.log('Teste da API de notificacao - diagnostico CORS');
  console.log('==============================================');

  const apiKey = loadEnvToken();
  console.log(`Token carregado: ${apiKey.slice(0, 12)}...${apiKey.slice(-4)}`);

  try {
    await testPreflight();
    await testPost(apiKey);
  } catch (error) {
    console.error('\n[ERRO DE REDE]', error.message);
    process.exit(1);
  }

  console.log('\n==============================================');
  console.log('Teste finalizado.');
}

main();
