
-- Habilitar RLS nas tabelas
ALTER TABLE public.visits ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.users ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.agendamentos ENABLE ROW LEVEL SECURITY;

-- Políticas para a tabela visits (permitir acesso público para o sistema de recepção)
CREATE POLICY "Allow public read access to visits" 
ON public.visits FOR SELECT 
USING (true);

CREATE POLICY "Allow public insert access to visits" 
ON public.visits FOR INSERT 
WITH CHECK (true);

CREATE POLICY "Allow public update access to visits" 
ON public.visits FOR UPDATE 
USING (true);

-- Políticas para a tabela users (permitir acesso público para busca de corretores)
CREATE POLICY "Allow public read access to users" 
ON public.users FOR SELECT 
USING (true);

-- Políticas para a tabela agendamentos
CREATE POLICY "Allow public read access to agendamentos" 
ON public.agendamentos FOR SELECT 
USING (true);

CREATE POLICY "Allow public insert access to agendamentos" 
ON public.agendamentos FOR INSERT 
WITH CHECK (true);
