
-- Função canônica para verificar ban do usuário autenticado (fail-closed)
CREATE OR REPLACE FUNCTION public.is_user_banned(_user_id uuid)
RETURNS boolean
LANGUAGE plpgsql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_uid uuid := COALESCE(_user_id, auth.uid());
  v_cpf text;
  v_ban boolean;
BEGIN
  IF v_uid IS NULL THEN
    -- Sem usuário autenticado: tratar como NÃO banido (RLS pode usar auth.uid() em outras checagens)
    RETURN false;
  END IF;

  -- 1) Tenta CPF nos metadados do auth
  SELECT NULLIF(raw_user_meta_data->>'cpf', '')
    INTO v_cpf
  FROM auth.users
  WHERE id = v_uid;

  -- 2) Fallback: CPF na tabela profiles
  IF v_cpf IS NULL THEN
    SELECT NULLIF(cpf, '')
      INTO v_cpf
    FROM public.profiles
    WHERE id = v_uid;
  END IF;

  -- Sem CPF resolvido => fail-closed (considera banido)
  IF v_cpf IS NULL THEN
    RETURN true;
  END IF;

  SELECT COALESCE(ban, false)
    INTO v_ban
  FROM public.users
  WHERE cpf = v_cpf
  LIMIT 1;

  -- Se não existir linha em users para esse CPF, considera banido (fail-closed)
  IF v_ban IS NULL THEN
    RETURN true;
  END IF;

  RETURN v_ban;
END;
$$;

GRANT EXECUTE ON FUNCTION public.is_user_banned(uuid) TO authenticated, anon, service_role;

-- Habilita Realtime na tabela users (idempotente)
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1
    FROM pg_publication_tables
    WHERE pubname = 'supabase_realtime'
      AND schemaname = 'public'
      AND tablename = 'users'
  ) THEN
    EXECUTE 'ALTER PUBLICATION supabase_realtime ADD TABLE public.users';
  END IF;
END $$;

ALTER TABLE public.users REPLICA IDENTITY FULL;
