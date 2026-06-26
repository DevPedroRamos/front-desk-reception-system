import { readFileSync } from 'node:fs';
import { createClient } from '@supabase/supabase-js';

function loadEnv() {
  const env = {};
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
  return env;
}

const env = loadEnv();
const supabase = createClient(env.VITE_SUPABASE_URL, env.VITE_SUPABASE_PUBLISHABLE_KEY);
const payload = { targetType: 'ALL', title: 'Debug Test', body: 'Teste', platformType: 'BOTH' };

const { data, error } = await supabase.functions.invoke('send-notification', { body: payload });

if (error) {
  console.log('invoke ERROR');
  console.log('errorName:', error.name);
  console.log('errorMessage:', error.message);
  if (error.context) {
    console.log('status:', error.context.status);
    console.log('body:', await error.context.text());
  }
} else {
  console.log('invoke OK:', JSON.stringify(data, null, 2));
}
