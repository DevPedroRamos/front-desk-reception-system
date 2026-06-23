ALTER TABLE public.lista_espera ADD COLUMN IF NOT EXISTS corretor_cpf text;
ALTER TABLE public.visits ADD COLUMN IF NOT EXISTS corretor_cpf text;