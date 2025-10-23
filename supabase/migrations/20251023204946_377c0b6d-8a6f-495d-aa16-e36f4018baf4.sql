-- Create recebimentos table
CREATE TABLE public.recebimentos (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  visit_id UUID REFERENCES public.visits(id) ON DELETE CASCADE,
  corretor_id UUID NOT NULL,
  corretor_apelido VARCHAR NOT NULL,
  corretor_gerente VARCHAR,
  corretor_superintendente VARCHAR,
  cliente_nome VARCHAR NOT NULL,
  cliente_cpf VARCHAR,
  empreendimento VARCHAR,
  unidade VARCHAR,
  valor_entrada NUMERIC NOT NULL,
  valor_pago NUMERIC,
  status VARCHAR NOT NULL DEFAULT 'aguardando_devolucao',
  data_hora TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),
  finalizado_em TIMESTAMP WITH TIME ZONE,
  finalizado_por UUID,
  observacoes TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create indexes for performance
CREATE INDEX idx_recebimentos_corretor ON public.recebimentos(corretor_id);
CREATE INDEX idx_recebimentos_status ON public.recebimentos(status);
CREATE INDEX idx_recebimentos_data ON public.recebimentos(data_hora);
CREATE INDEX idx_recebimentos_visit ON public.recebimentos(visit_id);

-- Enable Row Level Security
ALTER TABLE public.recebimentos ENABLE ROW LEVEL SECURITY;

-- RLS Policies: Authenticated users can view all recebimentos
CREATE POLICY "Authenticated users can view recebimentos"
  ON public.recebimentos FOR SELECT
  TO authenticated
  USING (true);

-- RLS Policies: Authenticated users can insert recebimentos
CREATE POLICY "Authenticated users can insert recebimentos"
  ON public.recebimentos FOR INSERT
  TO authenticated
  WITH CHECK (true);

-- RLS Policies: Authenticated users can update recebimentos
CREATE POLICY "Authenticated users can update recebimentos"
  ON public.recebimentos FOR UPDATE
  TO authenticated
  USING (true);

-- Trigger to update updated_at column
CREATE TRIGGER update_recebimentos_updated_at
  BEFORE UPDATE ON public.recebimentos
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();