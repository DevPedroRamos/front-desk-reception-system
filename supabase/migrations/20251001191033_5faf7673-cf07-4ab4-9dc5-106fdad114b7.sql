-- Remover política antiga de confirmação pública
DROP POLICY IF EXISTS "Público pode confirmar agendamento" ON public.agendamentos;

-- Criar nova política mais permissiva para confirmação de agendamento
-- Permite UPDATE quando o token é válido (não expirado e status pendente)
CREATE POLICY "Público pode confirmar agendamento via token"
ON public.agendamentos
FOR UPDATE
TO anon, authenticated
USING (
  expires_at > now() 
  AND status = 'pendente'
)
WITH CHECK (
  expires_at > now() 
  AND status IN ('pendente', 'confirmado')
  AND confirmed_at IS NOT NULL
);