
-- 1. Create table
CREATE TABLE public.tipos_brinde (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  nome text NOT NULL UNIQUE,
  ativo boolean NOT NULL DEFAULT true,
  entrega_automatica boolean NOT NULL DEFAULT false,
  icone_url text,
  estoque integer NOT NULL DEFAULT 0,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

-- 2. Grants
GRANT SELECT ON public.tipos_brinde TO authenticated;
GRANT INSERT, UPDATE, DELETE ON public.tipos_brinde TO authenticated;
GRANT ALL ON public.tipos_brinde TO service_role;

-- 3. RLS
ALTER TABLE public.tipos_brinde ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Authenticated can read tipos_brinde"
  ON public.tipos_brinde FOR SELECT
  TO authenticated
  USING (true);

CREATE POLICY "Admins can insert tipos_brinde"
  ON public.tipos_brinde FOR INSERT
  TO authenticated
  WITH CHECK (public.has_role(auth.uid(), 'admin'));

CREATE POLICY "Admins can update tipos_brinde"
  ON public.tipos_brinde FOR UPDATE
  TO authenticated
  USING (public.has_role(auth.uid(), 'admin'))
  WITH CHECK (public.has_role(auth.uid(), 'admin'));

CREATE POLICY "Admins can delete tipos_brinde"
  ON public.tipos_brinde FOR DELETE
  TO authenticated
  USING (public.has_role(auth.uid(), 'admin'));

-- 4. Updated_at trigger
CREATE TRIGGER update_tipos_brinde_updated_at
  BEFORE UPDATE ON public.tipos_brinde
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

-- 5. Remove old check constraint (mantém histórico)
ALTER TABLE public.brindes DROP CONSTRAINT IF EXISTS brindes_tipo_brinde_check;

-- 6. Seed inicial
INSERT INTO public.tipos_brinde (nome, ativo, entrega_automatica, estoque) VALUES
  ('Copo', true, true, 0),
  ('Cooler', true, false, 0),
  ('Kit Fondue', true, false, 0)
ON CONFLICT (nome) DO NOTHING;

-- 7. Trigger de decremento de estoque
CREATE OR REPLACE FUNCTION public.decrement_brinde_estoque()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  IF NEW.validado = true THEN
    UPDATE public.tipos_brinde
       SET estoque = GREATEST(estoque - 1, 0)
     WHERE nome = NEW.tipo_brinde
       AND estoque > 0;
  END IF;
  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS trg_decrement_brinde_estoque ON public.brindes;
CREATE TRIGGER trg_decrement_brinde_estoque
  AFTER INSERT ON public.brindes
  FOR EACH ROW EXECUTE FUNCTION public.decrement_brinde_estoque();
