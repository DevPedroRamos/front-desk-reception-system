CREATE OR REPLACE FUNCTION public.get_dashboard_stats_filtered(start_date date DEFAULT NULL::date, end_date date DEFAULT NULL::date, superintendente character varying DEFAULT NULL::character varying)
 RETURNS TABLE(total_visitas_hoje bigint, visitas_ativas bigint, visitas_finalizadas_hoje bigint, mesas_ocupadas bigint, clientes_lista_espera bigint)
 LANGUAGE plpgsql
 SET search_path = public
AS $function$
DECLARE
    v_superintendente varchar := superintendente;
BEGIN
    RETURN QUERY
    SELECT 
        (SELECT COUNT(*) 
         FROM visits v 
         LEFT JOIN users u ON v.corretor_id = u.id
         WHERE (start_date IS NULL OR DATE(v.horario_entrada) >= start_date)
           AND (end_date IS NULL OR DATE(v.horario_entrada) <= end_date)
           AND (v_superintendente IS NULL OR u.superintendente = v_superintendente)
        ) as total_visitas_hoje,
        
        (SELECT COUNT(*) 
         FROM visits v 
         LEFT JOIN users u ON v.corretor_id = u.id
         WHERE v.status = 'ativo'
           AND (v_superintendente IS NULL OR u.superintendente = v_superintendente)
        ) as visitas_ativas,
        
        (SELECT COUNT(*) 
         FROM visits v 
         LEFT JOIN users u ON v.corretor_id = u.id
         WHERE v.status = 'finalizado' 
           AND (start_date IS NULL OR DATE(v.horario_entrada) >= start_date)
           AND (end_date IS NULL OR DATE(v.horario_entrada) <= end_date)
           AND (v_superintendente IS NULL OR u.superintendente = v_superintendente)
        ) as visitas_finalizadas_hoje,
        
        (SELECT COUNT(DISTINCT v.mesa) 
         FROM visits v 
         LEFT JOIN users u ON v.corretor_id = u.id
         WHERE v.status = 'ativo'
           AND (v_superintendente IS NULL OR u.superintendente = v_superintendente)
        ) as mesas_ocupadas,
        
        (SELECT COUNT(*) 
         FROM lista_espera le 
         LEFT JOIN users u ON le.corretor_id = u.id
         WHERE le.status = 'aguardando'
           AND (start_date IS NULL OR DATE(le.created_at) >= start_date)
           AND (end_date IS NULL OR DATE(le.created_at) <= end_date)
           AND (v_superintendente IS NULL OR le.corretor_id IS NULL OR u.superintendente = v_superintendente)
        ) as clientes_lista_espera;
END;
$function$;