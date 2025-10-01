-- Criar tabela de agendamentos
CREATE TABLE IF NOT EXISTS public.agendamentos (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  token text UNIQUE NOT NULL,
  corretor_id uuid NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
  corretor_nome varchar NOT NULL,
  corretor_cpf varchar NOT NULL,
  
  -- Dados do cliente
  cliente_nome varchar,
  cliente_cpf varchar,
  cliente_telefone varchar,
  data_visita timestamp with time zone,
  
  -- Status do agendamento
  status varchar DEFAULT 'pendente' CHECK (status IN ('pendente', 'confirmado', 'check_in', 'finalizado', 'cancelado')),
  
  -- Controle de tempo
  created_at timestamp with time zone DEFAULT now(),
  confirmed_at timestamp with time zone,
  checked_in_at timestamp with time zone,
  expires_at timestamp with time zone DEFAULT (now() + interval '48 hours'),
  
  -- Dados da visita (preenchidos no check-in)
  mesa integer,
  loja varchar,
  andar varchar,
  empreendimento varchar
);

-- Habilitar RLS
ALTER TABLE public.agendamentos ENABLE ROW LEVEL SECURITY;

-- Policy: Corretores podem criar agendamentos
CREATE POLICY "Corretores podem criar agendamentos"
ON public.agendamentos
FOR INSERT
TO authenticated
WITH CHECK (corretor_id = auth.uid());

-- Policy: Corretores podem ver seus próprios agendamentos
CREATE POLICY "Corretores podem ver seus agendamentos"
ON public.agendamentos
FOR SELECT
TO authenticated
USING (corretor_id = auth.uid());

-- Policy: Corretores podem atualizar seus agendamentos
CREATE POLICY "Corretores podem atualizar seus agendamentos"
ON public.agendamentos
FOR UPDATE
TO authenticated
USING (corretor_id = auth.uid());

-- Policy: Público pode ver agendamento por token válido
CREATE POLICY "Público pode ver por token"
ON public.agendamentos
FOR SELECT
TO anon
USING (expires_at > now() AND status != 'cancelado');

-- Policy: Público pode atualizar agendamento por token (confirmação)
CREATE POLICY "Público pode confirmar agendamento"
ON public.agendamentos
FOR UPDATE
TO anon
USING (expires_at > now() AND status = 'pendente');

-- Policy: Recepção pode ver todos agendamentos confirmados
CREATE POLICY "Recepção vê agendamentos confirmados"
ON public.agendamentos
FOR SELECT
TO authenticated
USING (status IN ('confirmado', 'check_in'));

-- Policy: Recepção pode fazer check-in
CREATE POLICY "Recepção pode fazer check-in"
ON public.agendamentos
FOR UPDATE
TO authenticated
USING (status = 'confirmado');

-- Criar índices para performance
CREATE INDEX idx_agendamentos_token ON public.agendamentos(token);
CREATE INDEX idx_agendamentos_corretor ON public.agendamentos(corretor_id);
CREATE INDEX idx_agendamentos_cliente_cpf ON public.agendamentos(cliente_cpf);
CREATE INDEX idx_agendamentos_status ON public.agendamentos(status);
CREATE INDEX idx_agendamentos_data_visita ON public.agendamentos(data_visita);

-- Função para gerar token único
CREATE OR REPLACE FUNCTION public.generate_scheduling_token()
RETURNS text
LANGUAGE plpgsql
AS $$
BEGIN
  RETURN encode(gen_random_bytes(32), 'base64url');
END;
$$;