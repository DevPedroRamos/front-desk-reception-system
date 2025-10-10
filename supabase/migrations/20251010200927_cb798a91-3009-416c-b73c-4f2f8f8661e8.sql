-- Adicionar coluna origem_registro na tabela visits
ALTER TABLE public.visits 
ADD COLUMN origem_registro jsonb DEFAULT NULL;

-- Adicionar comentário explicativo
COMMENT ON COLUMN public.visits.origem_registro IS 
'Armazena informações sobre quem registrou a visita: 
{ "tipo": "manual", "role": "recepcionista", "nome": "Rayane" } para registro manual
{ "tipo": "auto" } para auto agendamento/check-in';

-- Criar índice para melhorar performance de queries
CREATE INDEX idx_visits_origem_registro ON public.visits USING gin(origem_registro);