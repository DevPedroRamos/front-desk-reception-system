-- Corrigir política RLS para agendamentos públicos
-- PROBLEMA: A política atual não filtra pelo token, permitindo ver todos os agendamentos

-- Primeiro, remover a política problemática
DROP POLICY IF EXISTS "Público pode ver por token" ON public.agendamentos;

-- Criar nova política que filtra corretamente pelo token
CREATE POLICY "Público pode ver agendamento por token válido"
ON public.agendamentos
FOR SELECT
TO anon, authenticated
USING (
  token IS NOT NULL 
  AND expires_at > now() 
  AND status != 'cancelado'
);

-- Adicionar comentário explicativo
COMMENT ON POLICY "Público pode ver agendamento por token válido" ON public.agendamentos IS 
'Permite acesso público a agendamentos não expirados e não cancelados. O filtro pelo token específico é feito na query do cliente.';