


-- Ajustar a tabela agendamentos para incluir email
ALTER TABLE public.agendamentos 
ADD COLUMN IF NOT EXISTS email character varying;

-- Criar função para gerar link de agendamento direto
CREATE OR REPLACE FUNCTION public.gerar_link_agendamento_direto(
  corretor_uuid uuid,
  corretor_nome_param text,
  corretor_apelido_param text
)
RETURNS text
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  novo_token TEXT;
BEGIN
  -- Gerar token único usando base64 padrão
  novo_token := encode(gen_random_bytes(32), 'base64');
  -- Remover caracteres problemáticos para URL
  novo_token := replace(replace(replace(novo_token, '+', '-'), '/', '_'), '=', '');
  
  -- Inserir na tabela de links do corretor
  INSERT INTO public.corretor_links (corretor_id, token, titulo, ativo)
  VALUES (corretor_uuid, novo_token, 'Link Direto de Agendamento', true);
  
  RETURN novo_token;
END;
$$;


