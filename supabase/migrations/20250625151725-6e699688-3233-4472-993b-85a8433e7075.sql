
-- Criar tabela para pesquisas de satisfação
CREATE TABLE public.pesquisas_satisfacao (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  nome_completo VARCHAR NOT NULL,
  cpf VARCHAR NOT NULL,
  email VARCHAR NOT NULL,
  corretor_nome VARCHAR,
  onde_conheceu VARCHAR,
  empreendimento_interesse VARCHAR,
  comprou_empreendimento BOOLEAN DEFAULT false,
  empreendimento_adquirido VARCHAR,
  nota_consultor INTEGER CHECK (nota_consultor >= 0 AND nota_consultor <= 10),
  avaliacao_experiencia TEXT,
  dicas_sugestoes TEXT,
  codigo_validacao VARCHAR(4) NOT NULL,
  validado BOOLEAN DEFAULT false,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Atualizar tabela brindes para incluir pesquisa_satisfacao_id e campos necessários
ALTER TABLE public.brindes 
ADD COLUMN pesquisa_satisfacao_id UUID REFERENCES public.pesquisas_satisfacao(id),
ADD COLUMN validado BOOLEAN DEFAULT false,
ADD COLUMN codigo_usado VARCHAR(4),
ADD COLUMN data_validacao TIMESTAMP WITH TIME ZONE;

-- Remover a constraint de foreign key visit_id da tabela brindes pois nem todos os brindes virão de visitas
ALTER TABLE public.brindes ALTER COLUMN visit_id DROP NOT NULL;
