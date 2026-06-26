ALTER TABLE public.visits
  ADD COLUMN IF NOT EXISTS encerrado_por_corretor boolean NOT NULL DEFAULT false,
  ADD COLUMN IF NOT EXISTS origem_encerramento jsonb DEFAULT NULL;

COMMENT ON COLUMN public.visits.encerrado_por_corretor IS
  'True quando a visita foi encerrada pelo corretor via app externo';

COMMENT ON COLUMN public.visits.origem_encerramento IS
  'Metadados do encerramento: { "tipo": "corretor", "integra_id": "...", "encerrado_em": "ISO" }';
