-- Remover a constraint antiga
ALTER TABLE brindes DROP CONSTRAINT IF EXISTS brindes_tipo_brinde_check;

-- Criar nova constraint com os 3 tipos de brinde
ALTER TABLE brindes ADD CONSTRAINT brindes_tipo_brinde_check 
CHECK (tipo_brinde IN ('Cinemark', 'Vinho', 'Churrasqueira'));