export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export type Database = {
  public: {
    Tables: {
      brindes: {
        Row: {
          cliente_cpf: string
          cliente_nome: string
          codigo_usado: string | null
          corretor_nome: string
          created_at: string
          data_validacao: string | null
          id: string
          pesquisa_satisfacao_id: string | null
          tipo_brinde: string
          validado: boolean | null
          visit_id: string | null
        }
        Insert: {
          cliente_cpf: string
          cliente_nome: string
          codigo_usado?: string | null
          corretor_nome: string
          created_at?: string
          data_validacao?: string | null
          id?: string
          pesquisa_satisfacao_id?: string | null
          tipo_brinde: string
          validado?: boolean | null
          visit_id?: string | null
        }
        Update: {
          cliente_cpf?: string
          cliente_nome?: string
          codigo_usado?: string | null
          corretor_nome?: string
          created_at?: string
          data_validacao?: string | null
          id?: string
          pesquisa_satisfacao_id?: string | null
          tipo_brinde?: string
          validado?: boolean | null
          visit_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "brindes_visit_id_fkey"
            columns: ["visit_id"]
            isOneToOne: false
            referencedRelation: "visits"
            referencedColumns: ["id"]
          },
        ]
      }
      corretor_links: {
        Row: {
          ativo: boolean
          corretor_id: string
          created_at: string
          id: string
          titulo: string
          token: string
          updated_at: string
        }
        Insert: {
          ativo?: boolean
          corretor_id: string
          created_at?: string
          id?: string
          titulo?: string
          token: string
          updated_at?: string
        }
        Update: {
          ativo?: boolean
          corretor_id?: string
          created_at?: string
          id?: string
          titulo?: string
          token?: string
          updated_at?: string
        }
        Relationships: []
      }
      empreendimentos: {
        Row: {
          created_at: string
          id: string
          nome: string
        }
        Insert: {
          created_at?: string
          id?: string
          nome: string
        }
        Update: {
          created_at?: string
          id?: string
          nome?: string
        }
        Relationships: []
      }
      lista_espera: {
        Row: {
          cliente_cpf: string
          cliente_nome: string
          cliente_whatsapp: string | null
          corretor_id: string | null
          corretor_nome: string | null
          created_at: string
          empreendimento: string | null
          id: string
          loja: string
          status: string
          updated_at: string
        }
        Insert: {
          cliente_cpf?: string
          cliente_nome: string
          cliente_whatsapp?: string | null
          corretor_id?: string | null
          corretor_nome?: string | null
          created_at?: string
          empreendimento?: string | null
          id?: string
          loja: string
          status?: string
          updated_at?: string
        }
        Update: {
          cliente_cpf?: string
          cliente_nome?: string
          cliente_whatsapp?: string | null
          corretor_id?: string | null
          corretor_nome?: string | null
          created_at?: string
          empreendimento?: string | null
          id?: string
          loja?: string
          status?: string
          updated_at?: string
        }
        Relationships: []
      }
      pesquisas_satisfacao: {
        Row: {
          avaliacao_experiencia: string | null
          codigo_validacao: string
          comprou_empreendimento: boolean | null
          corretor_nome: string | null
          cpf: string
          created_at: string
          dicas_sugestoes: string | null
          email: string
          empreendimento_adquirido: string | null
          empreendimento_interesse: string | null
          id: string
          nome_completo: string
          nota_consultor: number | null
          onde_conheceu: string | null
          validado: boolean | null
        }
        Insert: {
          avaliacao_experiencia?: string | null
          codigo_validacao: string
          comprou_empreendimento?: boolean | null
          corretor_nome?: string | null
          cpf: string
          created_at?: string
          dicas_sugestoes?: string | null
          email: string
          empreendimento_adquirido?: string | null
          empreendimento_interesse?: string | null
          id?: string
          nome_completo: string
          nota_consultor?: number | null
          onde_conheceu?: string | null
          validado?: boolean | null
        }
        Update: {
          avaliacao_experiencia?: string | null
          codigo_validacao?: string
          comprou_empreendimento?: boolean | null
          corretor_nome?: string | null
          cpf?: string
          created_at?: string
          dicas_sugestoes?: string | null
          email?: string
          empreendimento_adquirido?: string | null
          empreendimento_interesse?: string | null
          id?: string
          nome_completo?: string
          nota_consultor?: number | null
          onde_conheceu?: string | null
          validado?: boolean | null
        }
        Relationships: []
      }
      profiles: {
        Row: {
          cpf: string
          created_at: string | null
          id: string
          name: string
          role: string
        }
        Insert: {
          cpf: string
          created_at?: string | null
          id: string
          name: string
          role?: string
        }
        Update: {
          cpf?: string
          created_at?: string | null
          id?: string
          name?: string
          role?: string
        }
        Relationships: []
      }
      users: {
        Row: {
          apelido: string
          cpf: string
          created_at: string | null
          gerente: string
          id: string
          name: string
          role: string
          superintendente: string
        }
        Insert: {
          apelido: string
          cpf: string
          created_at?: string | null
          gerente: string
          id?: string
          name: string
          role: string
          superintendente: string
        }
        Update: {
          apelido?: string
          cpf?: string
          created_at?: string | null
          gerente?: string
          id?: string
          name?: string
          role?: string
          superintendente?: string
        }
        Relationships: []
      }
      visits: {
        Row: {
          andar: string
          cliente_cpf: string
          cliente_nome: string
          cliente_whatsapp: string | null
          corretor_id: string
          corretor_nome: string
          created_at: string | null
          empreendimento: string | null
          horario_entrada: string | null
          horario_saida: string | null
          id: string
          loja: string
          mesa: number
          status: string | null
        }
        Insert: {
          andar: string
          cliente_cpf: string
          cliente_nome: string
          cliente_whatsapp?: string | null
          corretor_id: string
          corretor_nome: string
          created_at?: string | null
          empreendimento?: string | null
          horario_entrada?: string | null
          horario_saida?: string | null
          id?: string
          loja: string
          mesa: number
          status?: string | null
        }
        Update: {
          andar?: string
          cliente_cpf?: string
          cliente_nome?: string
          cliente_whatsapp?: string | null
          corretor_id?: string
          corretor_nome?: string
          created_at?: string | null
          empreendimento?: string | null
          horario_entrada?: string | null
          horario_saida?: string | null
          id?: string
          loja?: string
          mesa?: number
          status?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "visits_corretor_id_fkey"
            columns: ["corretor_id"]
            isOneToOne: false
            referencedRelation: "users"
            referencedColumns: ["id"]
          },
        ]
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      buscar_cliente_por_cpf: {
        Args: { p_cpf: string }
        Returns: {
          nome: string
          cpf: string
          whatsapp: string
          ultima_visita: string
          total_visitas: number
        }[]
      }
      check_mesa_disponivel: {
        Args: { p_loja: string; p_andar: string; p_mesa: number }
        Returns: boolean
      }
      check_tempo_espera: {
        Args: { created_time: string }
        Returns: boolean
      }
      finalizar_visita: {
        Args: { visit_id: string }
        Returns: undefined
      }
      fix_user_relations: {
        Args: Record<PropertyKey, never>
        Returns: undefined
      }
      gerar_link_corretor: {
        Args: { corretor_uuid: string; link_titulo?: string }
        Returns: string
      }
      get_corretor_stats: {
        Args: { corretor_uuid: string }
        Returns: {
          total_visitas: number
          visitas_ativas: number
          visitas_hoje: number
          tempo_medio_minutos: number
          agendamentos_confirmados: number
        }[]
      }
      get_dashboard_stats: {
        Args: Record<PropertyKey, never>
        Returns: {
          total_visitas_hoje: number
          visitas_ativas: number
          visitas_finalizadas_hoje: number
          mesas_ocupadas: number
        }[]
      }
      get_dashboard_stats_filtered: {
        Args: {
          start_date?: string
          end_date?: string
          superintendente?: string
        }
        Returns: {
          total_visitas_hoje: number
          visitas_ativas: number
          visitas_finalizadas_hoje: number
          mesas_ocupadas: number
          clientes_lista_espera: number
        }[]
      }
      validate_cpf_and_create_profile: {
        Args: { user_cpf: string }
        Returns: boolean
      }
    }
    Enums: {
      [_ in never]: never
    }
    CompositeTypes: {
      [_ in never]: never
    }
  }
}

type DefaultSchema = Database[Extract<keyof Database, "public">]

export type Tables<
  DefaultSchemaTableNameOrOptions extends
    | keyof (DefaultSchema["Tables"] & DefaultSchema["Views"])
    | { schema: keyof Database },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof Database
  }
    ? keyof (Database[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
        Database[DefaultSchemaTableNameOrOptions["schema"]]["Views"])
    : never = never,
> = DefaultSchemaTableNameOrOptions extends { schema: keyof Database }
  ? (Database[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
      Database[DefaultSchemaTableNameOrOptions["schema"]]["Views"])[TableName] extends {
      Row: infer R
    }
    ? R
    : never
  : DefaultSchemaTableNameOrOptions extends keyof (DefaultSchema["Tables"] &
        DefaultSchema["Views"])
    ? (DefaultSchema["Tables"] &
        DefaultSchema["Views"])[DefaultSchemaTableNameOrOptions] extends {
        Row: infer R
      }
      ? R
      : never
    : never

export type TablesInsert<
  DefaultSchemaTableNameOrOptions extends
    | keyof DefaultSchema["Tables"]
    | { schema: keyof Database },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof Database
  }
    ? keyof Database[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = DefaultSchemaTableNameOrOptions extends { schema: keyof Database }
  ? Database[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Insert: infer I
    }
    ? I
    : never
  : DefaultSchemaTableNameOrOptions extends keyof DefaultSchema["Tables"]
    ? DefaultSchema["Tables"][DefaultSchemaTableNameOrOptions] extends {
        Insert: infer I
      }
      ? I
      : never
    : never

export type TablesUpdate<
  DefaultSchemaTableNameOrOptions extends
    | keyof DefaultSchema["Tables"]
    | { schema: keyof Database },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof Database
  }
    ? keyof Database[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = DefaultSchemaTableNameOrOptions extends { schema: keyof Database }
  ? Database[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Update: infer U
    }
    ? U
    : never
  : DefaultSchemaTableNameOrOptions extends keyof DefaultSchema["Tables"]
    ? DefaultSchema["Tables"][DefaultSchemaTableNameOrOptions] extends {
        Update: infer U
      }
      ? U
      : never
    : never

export type Enums<
  DefaultSchemaEnumNameOrOptions extends
    | keyof DefaultSchema["Enums"]
    | { schema: keyof Database },
  EnumName extends DefaultSchemaEnumNameOrOptions extends {
    schema: keyof Database
  }
    ? keyof Database[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"]
    : never = never,
> = DefaultSchemaEnumNameOrOptions extends { schema: keyof Database }
  ? Database[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"][EnumName]
  : DefaultSchemaEnumNameOrOptions extends keyof DefaultSchema["Enums"]
    ? DefaultSchema["Enums"][DefaultSchemaEnumNameOrOptions]
    : never

export type CompositeTypes<
  PublicCompositeTypeNameOrOptions extends
    | keyof DefaultSchema["CompositeTypes"]
    | { schema: keyof Database },
  CompositeTypeName extends PublicCompositeTypeNameOrOptions extends {
    schema: keyof Database
  }
    ? keyof Database[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"]
    : never = never,
> = PublicCompositeTypeNameOrOptions extends { schema: keyof Database }
  ? Database[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"][CompositeTypeName]
  : PublicCompositeTypeNameOrOptions extends keyof DefaultSchema["CompositeTypes"]
    ? DefaultSchema["CompositeTypes"][PublicCompositeTypeNameOrOptions]
    : never

export const Constants = {
  public: {
    Enums: {},
  },
} as const
