-- Garantir extensão necessária
create extension if not exists pgcrypto;

-- Corrigir função de geração de token para usar base64 com normalização URL-safe
create or replace function public.generate_scheduling_token()
returns text
language plpgsql
as $$
declare
  raw text;
begin
  -- Gera 32 bytes aleatórios e codifica em base64
  raw := encode(gen_random_bytes(32), 'base64');
  -- Normaliza para base64url: + -> -, / -> _, remove '=' do final
  raw := replace(replace(raw, '+', '-'), '/', '_');
  raw := rtrim(raw, '=');
  return raw;
end;
$$;