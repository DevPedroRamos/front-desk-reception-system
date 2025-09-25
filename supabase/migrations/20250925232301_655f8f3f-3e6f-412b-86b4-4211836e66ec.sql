-- Create table for persona questionnaire responses
CREATE TABLE public.persona_respostas (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  cpf VARCHAR(11) NOT NULL UNIQUE,
  respostas JSONB NOT NULL DEFAULT '{}',
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable Row Level Security
ALTER TABLE public.persona_respostas ENABLE ROW LEVEL SECURITY;

-- Create policies
CREATE POLICY "Anyone can insert persona responses" 
ON public.persona_respostas 
FOR INSERT 
WITH CHECK (true);

CREATE POLICY "Admins can view all persona responses" 
ON public.persona_respostas 
FOR SELECT 
USING (has_role(auth.uid(), 'admin'));

-- Create trigger for automatic timestamp updates
CREATE TRIGGER update_persona_respostas_updated_at
BEFORE UPDATE ON public.persona_respostas
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();

-- Create index on CPF for faster lookups
CREATE INDEX idx_persona_respostas_cpf ON public.persona_respostas(cpf);