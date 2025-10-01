-- Drop política antiga que requer autenticação
DROP POLICY IF EXISTS "Corretores podem criar agendamentos" ON public.agendamentos;

-- Criar nova política que permite criação pública de agendamentos pendentes
CREATE POLICY "Público pode criar agendamentos pendentes"
ON public.agendamentos
FOR INSERT
TO public
WITH CHECK (
  status = 'pendente' 
  AND cliente_nome IS NULL
);

-- Garantir que a função de geração de token existe
CREATE OR REPLACE FUNCTION public.generate_scheduling_token()
RETURNS TEXT
LANGUAGE plpgsql
AS $$
BEGIN
  RETURN encode(gen_random_bytes(32), 'base64url');
END;
$$;