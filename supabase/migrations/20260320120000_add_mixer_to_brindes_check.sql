-- Atualizar constraint para permitir o novo tipo de brinde Mixer
ALTER TABLE brindes DROP CONSTRAINT IF EXISTS brindes_tipo_brinde_check;

ALTER TABLE brindes ADD CONSTRAINT brindes_tipo_brinde_check
CHECK (tipo_brinde IN ('Cinemark', 'Mixer', 'Vinho', 'Churrasqueira'));
