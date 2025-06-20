
-- Remover as tabelas de agendamento
DROP TABLE IF EXISTS public.agendamento_tokens CASCADE;
DROP TABLE IF EXISTS public.agendamentos CASCADE;

-- Remover as funções relacionadas a agendamentos
DROP FUNCTION IF EXISTS public.gerar_token_agendamento(uuid);
DROP FUNCTION IF EXISTS public.buscar_agendamentos_corretor(uuid);
DROP FUNCTION IF EXISTS public.gerar_link_agendamento_direto(uuid, text, text);
