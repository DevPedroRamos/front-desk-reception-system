-- Criar tabela entregas
CREATE TABLE entregas (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  remetente VARCHAR(255) NOT NULL,
  destinatario VARCHAR(255) NOT NULL,
  usuario_registro_id UUID NOT NULL,
  usuario_registro_nome VARCHAR(255) NOT NULL,
  loja VARCHAR(100) NOT NULL,
  andar VARCHAR(50),
  status VARCHAR(50) NOT NULL DEFAULT 'aguardando_retirada',
  data_hora_registro TIMESTAMPTZ NOT NULL DEFAULT now(),
  quem_retirou VARCHAR(255),
  quem_retirou_cpf VARCHAR(14),
  data_hora_retirada TIMESTAMPTZ,
  observacoes TEXT,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- Constraint para status válidos
ALTER TABLE entregas ADD CONSTRAINT entregas_status_check 
CHECK (status IN ('aguardando_retirada', 'finalizado'));

-- Habilitar RLS
ALTER TABLE entregas ENABLE ROW LEVEL SECURITY;

-- Políticas RLS
CREATE POLICY "Authenticated users can view entregas" 
ON entregas FOR SELECT 
USING (auth.uid() IS NOT NULL);

CREATE POLICY "Authenticated users can insert entregas" 
ON entregas FOR INSERT 
WITH CHECK (auth.uid() IS NOT NULL);

CREATE POLICY "Authenticated users can update entregas" 
ON entregas FOR UPDATE 
USING (auth.uid() IS NOT NULL);

-- Trigger para atualizar updated_at
CREATE TRIGGER update_entregas_updated_at
BEFORE UPDATE ON entregas
FOR EACH ROW
EXECUTE FUNCTION update_updated_at_column();

-- Índices para melhor performance
CREATE INDEX idx_entregas_status ON entregas(status);
CREATE INDEX idx_entregas_data_hora_registro ON entregas(data_hora_registro);
CREATE INDEX idx_entregas_loja ON entregas(loja);