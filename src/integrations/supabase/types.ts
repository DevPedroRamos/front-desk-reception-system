export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export type Database = {
  // Allows to automatically instantiate createClient with right options
  // instead of createClient<Database, { PostgrestVersion: 'XX' }>(URL, KEY)
  __InternalSupabase: {
    PostgrestVersion: "12.2.3 (519615d)"
  }
  public: {
    Tables: {
      agendamentos: {
        Row: {
          andar: string | null
          checked_in_at: string | null
          cliente_cpf: string | null
          cliente_nome: string | null
          cliente_telefone: string | null
          confirmed_at: string | null
          corretor_cpf: string
          corretor_id: string
          corretor_nome: string
          created_at: string | null
          data_visita: string | null
          empreendimento: string | null
          expires_at: string | null
          id: string
          loja: string | null
          mesa: number | null
          status: string | null
          token: string
        }
        Insert: {
          andar?: string | null
          checked_in_at?: string | null
          cliente_cpf?: string | null
          cliente_nome?: string | null
          cliente_telefone?: string | null
          confirmed_at?: string | null
          corretor_cpf: string
          corretor_id: string
          corretor_nome: string
          created_at?: string | null
          data_visita?: string | null
          empreendimento?: string | null
          expires_at?: string | null
          id?: string
          loja?: string | null
          mesa?: number | null
          status?: string | null
          token: string
        }
        Update: {
          andar?: string | null
          checked_in_at?: string | null
          cliente_cpf?: string | null
          cliente_nome?: string | null
          cliente_telefone?: string | null
          confirmed_at?: string | null
          corretor_cpf?: string
          corretor_id?: string
          corretor_nome?: string
          created_at?: string | null
          data_visita?: string | null
          empreendimento?: string | null
          expires_at?: string | null
          id?: string
          loja?: string | null
          mesa?: number | null
          status?: string | null
          token?: string
        }
        Relationships: [
          {
            foreignKeyName: "agendamentos_corretor_id_fkey"
            columns: ["corretor_id"]
            isOneToOne: false
            referencedRelation: "users"
            referencedColumns: ["id"]
          },
        ]
      }
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
      candidatos: {
        Row: {
          cpf: string
          created_at: string | null
          curriculo_url: string | null
          email: string
          id: string
          nome: string
          vaga_id: string | null
          whatsapp: string | null
        }
        Insert: {
          cpf: string
          created_at?: string | null
          curriculo_url?: string | null
          email: string
          id?: string
          nome: string
          vaga_id?: string | null
          whatsapp?: string | null
        }
        Update: {
          cpf?: string
          created_at?: string | null
          curriculo_url?: string | null
          email?: string
          id?: string
          nome?: string
          vaga_id?: string | null
          whatsapp?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "candidatos_vaga_id_fkey"
            columns: ["vaga_id"]
            isOneToOne: false
            referencedRelation: "vagas"
            referencedColumns: ["id"]
          },
        ]
      }
      checklist_fotos: {
        Row: {
          checklist_item_id: string | null
          created_at: string | null
          foto_url: string
          id: string
          nome_arquivo: string | null
        }
        Insert: {
          checklist_item_id?: string | null
          created_at?: string | null
          foto_url: string
          id?: string
          nome_arquivo?: string | null
        }
        Update: {
          checklist_item_id?: string | null
          created_at?: string | null
          foto_url?: string
          id?: string
          nome_arquivo?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "checklist_fotos_checklist_item_id_fkey"
            columns: ["checklist_item_id"]
            isOneToOne: false
            referencedRelation: "checklist_itens"
            referencedColumns: ["id"]
          },
        ]
      }
      checklist_itens: {
        Row: {
          ambiente: string
          created_at: string | null
          fotos: string[] | null
          id: string
          item_nome: string
          observacao: string | null
          status: string
          updated_at: string | null
          vistoria_id: string | null
        }
        Insert: {
          ambiente: string
          created_at?: string | null
          fotos?: string[] | null
          id?: string
          item_nome: string
          observacao?: string | null
          status?: string
          updated_at?: string | null
          vistoria_id?: string | null
        }
        Update: {
          ambiente?: string
          created_at?: string | null
          fotos?: string[] | null
          id?: string
          item_nome?: string
          observacao?: string | null
          status?: string
          updated_at?: string | null
          vistoria_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "checklist_itens_vistoria_id_fkey"
            columns: ["vistoria_id"]
            isOneToOne: false
            referencedRelation: "vistorias"
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
          address: string | null
          created_at: string
          id: string
          idobra: string | null
          nome: string
          project_status: string | null
        }
        Insert: {
          address?: string | null
          created_at?: string
          id?: string
          idobra?: string | null
          nome: string
          project_status?: string | null
        }
        Update: {
          address?: string | null
          created_at?: string
          id?: string
          idobra?: string | null
          nome?: string
          project_status?: string | null
        }
        Relationships: []
      }
      faq_articles: {
        Row: {
          category_id: string
          content: string
          created_at: string
          display_order: number | null
          id: string
          is_active: boolean | null
          is_featured: boolean | null
          keywords: string[] | null
          slug: string | null
          title: string
          updated_at: string
          view_count: number | null
        }
        Insert: {
          category_id: string
          content: string
          created_at?: string
          display_order?: number | null
          id?: string
          is_active?: boolean | null
          is_featured?: boolean | null
          keywords?: string[] | null
          slug?: string | null
          title: string
          updated_at?: string
          view_count?: number | null
        }
        Update: {
          category_id?: string
          content?: string
          created_at?: string
          display_order?: number | null
          id?: string
          is_active?: boolean | null
          is_featured?: boolean | null
          keywords?: string[] | null
          slug?: string | null
          title?: string
          updated_at?: string
          view_count?: number | null
        }
        Relationships: [
          {
            foreignKeyName: "faq_articles_category_id_fkey"
            columns: ["category_id"]
            isOneToOne: false
            referencedRelation: "faq_categories"
            referencedColumns: ["id"]
          },
        ]
      }
      faq_categories: {
        Row: {
          created_at: string
          description: string | null
          display_order: number | null
          icon: string | null
          id: string
          is_active: boolean | null
          name: string
          updated_at: string
        }
        Insert: {
          created_at?: string
          description?: string | null
          display_order?: number | null
          icon?: string | null
          id?: string
          is_active?: boolean | null
          name: string
          updated_at?: string
        }
        Update: {
          created_at?: string
          description?: string | null
          display_order?: number | null
          icon?: string | null
          id?: string
          is_active?: boolean | null
          name?: string
          updated_at?: string
        }
        Relationships: []
      }
      invoice_uploads: {
        Row: {
          created_at: string | null
          file_name: string
          file_size: number
          file_type: string
          file_url: string
          id: string
          periodo_id: number | null
          user_id: string
        }
        Insert: {
          created_at?: string | null
          file_name: string
          file_size: number
          file_type: string
          file_url: string
          id?: string
          periodo_id?: number | null
          user_id: string
        }
        Update: {
          created_at?: string | null
          file_name?: string
          file_size?: number
          file_type?: string
          file_url?: string
          id?: string
          periodo_id?: number | null
          user_id?: string
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
      metas: {
        Row: {
          created_at: string
          display_order: number
          id: string
          image_url: string | null
          is_active: boolean
          is_featured: boolean
          quantidade: number
          role: string
          title: string
          updated_at: string
        }
        Insert: {
          created_at?: string
          display_order?: number
          id?: string
          image_url?: string | null
          is_active?: boolean
          is_featured?: boolean
          quantidade?: number
          role: string
          title: string
          updated_at?: string
        }
        Update: {
          created_at?: string
          display_order?: number
          id?: string
          image_url?: string | null
          is_active?: boolean
          is_featured?: boolean
          quantidade?: number
          role?: string
          title?: string
          updated_at?: string
        }
        Relationships: []
      }
      news_articles: {
        Row: {
          author_id: string
          author_name: string
          category_id: string
          content: string
          created_at: string
          description: string
          featured_image_url: string | null
          id: string
          is_featured: boolean
          is_published: boolean
          meta_description: string | null
          meta_title: string | null
          published_at: string | null
          reading_time_minutes: number | null
          slug: string
          tags: string[] | null
          title: string
          updated_at: string
          view_count: number
        }
        Insert: {
          author_id: string
          author_name: string
          category_id: string
          content: string
          created_at?: string
          description: string
          featured_image_url?: string | null
          id?: string
          is_featured?: boolean
          is_published?: boolean
          meta_description?: string | null
          meta_title?: string | null
          published_at?: string | null
          reading_time_minutes?: number | null
          slug: string
          tags?: string[] | null
          title: string
          updated_at?: string
          view_count?: number
        }
        Update: {
          author_id?: string
          author_name?: string
          category_id?: string
          content?: string
          created_at?: string
          description?: string
          featured_image_url?: string | null
          id?: string
          is_featured?: boolean
          is_published?: boolean
          meta_description?: string | null
          meta_title?: string | null
          published_at?: string | null
          reading_time_minutes?: number | null
          slug?: string
          tags?: string[] | null
          title?: string
          updated_at?: string
          view_count?: number
        }
        Relationships: [
          {
            foreignKeyName: "news_articles_category_id_fkey"
            columns: ["category_id"]
            isOneToOne: false
            referencedRelation: "news_categories"
            referencedColumns: ["id"]
          },
        ]
      }
      news_categories: {
        Row: {
          color: string | null
          created_at: string
          description: string | null
          display_order: number | null
          id: string
          is_active: boolean
          name: string
          slug: string
          updated_at: string
        }
        Insert: {
          color?: string | null
          created_at?: string
          description?: string | null
          display_order?: number | null
          id?: string
          is_active?: boolean
          name: string
          slug: string
          updated_at?: string
        }
        Update: {
          color?: string | null
          created_at?: string
          description?: string | null
          display_order?: number | null
          id?: string
          is_active?: boolean
          name?: string
          slug?: string
          updated_at?: string
        }
        Relationships: []
      }
      persona_respostas: {
        Row: {
          cpf: string
          created_at: string
          id: string
          respostas: Json
          updated_at: string
          user_id: string | null
        }
        Insert: {
          cpf: string
          created_at?: string
          id?: string
          respostas?: Json
          updated_at?: string
          user_id?: string | null
        }
        Update: {
          cpf?: string
          created_at?: string
          id?: string
          respostas?: Json
          updated_at?: string
          user_id?: string | null
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
          avatar_url: string | null
          cover_url: string | null
          cpf: string
          created_at: string | null
          id: string
          name: string
          role: string
        }
        Insert: {
          avatar_url?: string | null
          cover_url?: string | null
          cpf: string
          created_at?: string | null
          id: string
          name: string
          role?: string
        }
        Update: {
          avatar_url?: string | null
          cover_url?: string | null
          cpf?: string
          created_at?: string | null
          id?: string
          name?: string
          role?: string
        }
        Relationships: []
      }
      referrals: {
        Row: {
          created_at: string
          id: string
          indicado_cpf: string
          indicado_nome: string
          indicado_telefone: string
          referrer_agencia: string
          referrer_apartamento: string | null
          referrer_banco: string
          referrer_bloco: string | null
          referrer_cep: string
          referrer_conta: string
          referrer_cpf: string
          referrer_empreendimento: string | null
          referrer_nascimento: string
          referrer_nome: string
          referrer_numero: string
          referrer_rg: string
          referrer_telefone: string
          referrer_type: string
          status: string
          updated_at: string
          user_agent: string | null
          user_ip: string | null
        }
        Insert: {
          created_at?: string
          id?: string
          indicado_cpf: string
          indicado_nome: string
          indicado_telefone: string
          referrer_agencia: string
          referrer_apartamento?: string | null
          referrer_banco: string
          referrer_bloco?: string | null
          referrer_cep: string
          referrer_conta: string
          referrer_cpf: string
          referrer_empreendimento?: string | null
          referrer_nascimento: string
          referrer_nome: string
          referrer_numero: string
          referrer_rg: string
          referrer_telefone: string
          referrer_type: string
          status?: string
          updated_at?: string
          user_agent?: string | null
          user_ip?: string | null
        }
        Update: {
          created_at?: string
          id?: string
          indicado_cpf?: string
          indicado_nome?: string
          indicado_telefone?: string
          referrer_agencia?: string
          referrer_apartamento?: string | null
          referrer_banco?: string
          referrer_bloco?: string | null
          referrer_cep?: string
          referrer_conta?: string
          referrer_cpf?: string
          referrer_empreendimento?: string | null
          referrer_nascimento?: string
          referrer_nome?: string
          referrer_numero?: string
          referrer_rg?: string
          referrer_telefone?: string
          referrer_type?: string
          status?: string
          updated_at?: string
          user_agent?: string | null
          user_ip?: string | null
        }
        Relationships: []
      }
      search_logs: {
        Row: {
          created_at: string
          id: string
          results_count: number | null
          search_term: string
          user_ip: string | null
        }
        Insert: {
          created_at?: string
          id?: string
          results_count?: number | null
          search_term: string
          user_ip?: string | null
        }
        Update: {
          created_at?: string
          id?: string
          results_count?: number | null
          search_term?: string
          user_ip?: string | null
        }
        Relationships: []
      }
      unidades: {
        Row: {
          bloco: string
          created_at: string | null
          data_limpeza_agendada: string | null
          empreendimento_id: string | null
          id: string
          metragem: number | null
          numero: string
          status: string
          status_limpeza: string | null
          tipologia: string | null
          updated_at: string | null
        }
        Insert: {
          bloco: string
          created_at?: string | null
          data_limpeza_agendada?: string | null
          empreendimento_id?: string | null
          id?: string
          metragem?: number | null
          numero: string
          status?: string
          status_limpeza?: string | null
          tipologia?: string | null
          updated_at?: string | null
        }
        Update: {
          bloco?: string
          created_at?: string | null
          data_limpeza_agendada?: string | null
          empreendimento_id?: string | null
          id?: string
          metragem?: number | null
          numero?: string
          status?: string
          status_limpeza?: string | null
          tipologia?: string | null
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "unidades_empreendimento_id_fkey"
            columns: ["empreendimento_id"]
            isOneToOne: false
            referencedRelation: "empreendimentos"
            referencedColumns: ["id"]
          },
        ]
      }
      useful_links: {
        Row: {
          created_at: string
          description: string
          display_order: number
          id: string
          is_active: boolean
          title: string
          updated_at: string
          url: string
        }
        Insert: {
          created_at?: string
          description: string
          display_order?: number
          id?: string
          is_active?: boolean
          title: string
          updated_at?: string
          url: string
        }
        Update: {
          created_at?: string
          description?: string
          display_order?: number
          id?: string
          is_active?: boolean
          title?: string
          updated_at?: string
          url?: string
        }
        Relationships: []
      }
      user_roles: {
        Row: {
          id: string
          role: Database["public"]["Enums"]["app_role"]
          user_id: string
        }
        Insert: {
          id?: string
          role: Database["public"]["Enums"]["app_role"]
          user_id: string
        }
        Update: {
          id?: string
          role?: Database["public"]["Enums"]["app_role"]
          user_id?: string
        }
        Relationships: []
      }
      users: {
        Row: {
          apelido: string
          ban: boolean
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
          ban?: boolean
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
          ban?: boolean
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
      vagas: {
        Row: {
          beneficios: string[] | null
          created_at: string | null
          descricao: string
          empresa: string | null
          id: string
          local: string
          requisitos: string[] | null
          setor: string
          status: string | null
          tags: string[] | null
          tipo: string | null
          titulo: string
          updated_at: string | null
        }
        Insert: {
          beneficios?: string[] | null
          created_at?: string | null
          descricao: string
          empresa?: string | null
          id?: string
          local: string
          requisitos?: string[] | null
          setor: string
          status?: string | null
          tags?: string[] | null
          tipo?: string | null
          titulo: string
          updated_at?: string | null
        }
        Update: {
          beneficios?: string[] | null
          created_at?: string | null
          descricao?: string
          empresa?: string | null
          id?: string
          local?: string
          requisitos?: string[] | null
          setor?: string
          status?: string | null
          tags?: string[] | null
          tipo?: string | null
          titulo?: string
          updated_at?: string | null
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
          origem_registro: Json | null
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
          origem_registro?: Json | null
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
          origem_registro?: Json | null
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
      vistorias: {
        Row: {
          created_at: string | null
          data_vistoria: string | null
          id: string
          observacoes: string | null
          status_final: string | null
          unidade_id: string | null
          updated_at: string | null
          vistoriador_id: string | null
          vistoriador_nome: string | null
        }
        Insert: {
          created_at?: string | null
          data_vistoria?: string | null
          id?: string
          observacoes?: string | null
          status_final?: string | null
          unidade_id?: string | null
          updated_at?: string | null
          vistoriador_id?: string | null
          vistoriador_nome?: string | null
        }
        Update: {
          created_at?: string | null
          data_vistoria?: string | null
          id?: string
          observacoes?: string | null
          status_final?: string | null
          unidade_id?: string | null
          updated_at?: string | null
          vistoriador_id?: string | null
          vistoriador_nome?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "vistorias_unidade_id_fkey"
            columns: ["unidade_id"]
            isOneToOne: false
            referencedRelation: "unidades"
            referencedColumns: ["id"]
          },
        ]
      }
    }
    Views: {
      base_de_vendas: {
        Row: {
          assinatura_cef: string | null
          bl: string | null
          c_credito_baixada: number | null
          c_credito_em_aberto: number | null
          c_desconto_baixada: number | null
          c_desconto_em_aberto: number | null
          cliente: string | null
          comissao_extra_perc: number | null
          comissao_extra_perc_gerente: number | null
          comissao_extra_perc_superintendente: number | null
          comissao_integral_extra: number | null
          comissao_integral_extra_gerente: number | null
          comissao_integral_extra_superintendente: number | null
          comissao_integral_sinal: number | null
          comissao_integral_sinal_gerente: number | null
          comissao_integral_sinal_superintendente: number | null
          comissao_integral_vgv_pre_chaves: number | null
          comissao_integral_vgv_pre_chaves_gerente: number | null
          comissao_integral_vgv_pre_chaves_superintendente: number | null
          comissao_sinal_perc: number | null
          comissao_sinal_perc_gerente: number | null
          comissao_sinal_perc_superintendente: number | null
          comissao_vgv_pre_chaves_perc: number | null
          comissao_vgv_pre_chaves_perc_gerente: number | null
          comissao_vgv_pre_chaves_perc_superintendente: number | null
          created_at: string | null
          data_do_contrato: string | null
          data_pagto: string | null
          data_sicaq: string | null
          diretor: string | null
          empreendimento: string | null
          entrada: number | null
          fluxo: number | null
          gerente: string | null
          id: number | null
          origem: string | null
          perc_desconto: number | null
          perc_sinal_recebido: number | null
          periodo_id: number | null
          receber: number | null
          recebido: number | null
          recebido_de_sinal: number | null
          sinal_comissao_extra_vendedor: number | null
          sinal_comissao_extra_vendedor_gerente: number | null
          sinal_comissao_extra_vendedor_superintendente: number | null
          superintendente: string | null
          supervisor_coord_parceiro: string | null
          tipo_venda: string | null
          unid: string | null
          vendedor_parceiro: string | null
          vlr_contrato: number | null
          vlr_tabela: number | null
          vlr_venda: number | null
        }
        Insert: {
          assinatura_cef?: string | null
          bl?: string | null
          c_credito_baixada?: number | null
          c_credito_em_aberto?: number | null
          c_desconto_baixada?: number | null
          c_desconto_em_aberto?: number | null
          cliente?: string | null
          comissao_extra_perc?: number | null
          comissao_extra_perc_gerente?: number | null
          comissao_extra_perc_superintendente?: number | null
          comissao_integral_extra?: number | null
          comissao_integral_extra_gerente?: number | null
          comissao_integral_extra_superintendente?: number | null
          comissao_integral_sinal?: number | null
          comissao_integral_sinal_gerente?: number | null
          comissao_integral_sinal_superintendente?: number | null
          comissao_integral_vgv_pre_chaves?: number | null
          comissao_integral_vgv_pre_chaves_gerente?: number | null
          comissao_integral_vgv_pre_chaves_superintendente?: number | null
          comissao_sinal_perc?: number | null
          comissao_sinal_perc_gerente?: number | null
          comissao_sinal_perc_superintendente?: number | null
          comissao_vgv_pre_chaves_perc?: number | null
          comissao_vgv_pre_chaves_perc_gerente?: number | null
          comissao_vgv_pre_chaves_perc_superintendente?: number | null
          created_at?: string | null
          data_do_contrato?: string | null
          data_pagto?: string | null
          data_sicaq?: string | null
          diretor?: string | null
          empreendimento?: string | null
          entrada?: number | null
          fluxo?: number | null
          gerente?: string | null
          id?: number | null
          origem?: string | null
          perc_desconto?: number | null
          perc_sinal_recebido?: number | null
          periodo_id?: number | null
          receber?: number | null
          recebido?: number | null
          recebido_de_sinal?: number | null
          sinal_comissao_extra_vendedor?: number | null
          sinal_comissao_extra_vendedor_gerente?: number | null
          sinal_comissao_extra_vendedor_superintendente?: number | null
          superintendente?: string | null
          supervisor_coord_parceiro?: string | null
          tipo_venda?: string | null
          unid?: string | null
          vendedor_parceiro?: string | null
          vlr_contrato?: number | null
          vlr_tabela?: number | null
          vlr_venda?: number | null
        }
        Update: {
          assinatura_cef?: string | null
          bl?: string | null
          c_credito_baixada?: number | null
          c_credito_em_aberto?: number | null
          c_desconto_baixada?: number | null
          c_desconto_em_aberto?: number | null
          cliente?: string | null
          comissao_extra_perc?: number | null
          comissao_extra_perc_gerente?: number | null
          comissao_extra_perc_superintendente?: number | null
          comissao_integral_extra?: number | null
          comissao_integral_extra_gerente?: number | null
          comissao_integral_extra_superintendente?: number | null
          comissao_integral_sinal?: number | null
          comissao_integral_sinal_gerente?: number | null
          comissao_integral_sinal_superintendente?: number | null
          comissao_integral_vgv_pre_chaves?: number | null
          comissao_integral_vgv_pre_chaves_gerente?: number | null
          comissao_integral_vgv_pre_chaves_superintendente?: number | null
          comissao_sinal_perc?: number | null
          comissao_sinal_perc_gerente?: number | null
          comissao_sinal_perc_superintendente?: number | null
          comissao_vgv_pre_chaves_perc?: number | null
          comissao_vgv_pre_chaves_perc_gerente?: number | null
          comissao_vgv_pre_chaves_perc_superintendente?: number | null
          created_at?: string | null
          data_do_contrato?: string | null
          data_pagto?: string | null
          data_sicaq?: string | null
          diretor?: string | null
          empreendimento?: string | null
          entrada?: number | null
          fluxo?: number | null
          gerente?: string | null
          id?: number | null
          origem?: string | null
          perc_desconto?: number | null
          perc_sinal_recebido?: number | null
          periodo_id?: number | null
          receber?: number | null
          recebido?: number | null
          recebido_de_sinal?: number | null
          sinal_comissao_extra_vendedor?: number | null
          sinal_comissao_extra_vendedor_gerente?: number | null
          sinal_comissao_extra_vendedor_superintendente?: number | null
          superintendente?: string | null
          supervisor_coord_parceiro?: string | null
          tipo_venda?: string | null
          unid?: string | null
          vendedor_parceiro?: string | null
          vlr_contrato?: number | null
          vlr_tabela?: number | null
          vlr_venda?: number | null
        }
        Relationships: []
      }
      distrato: {
        Row: {
          apto: string | null
          cliente: string | null
          comissao_paga: boolean | null
          created_at: string | null
          descontar: boolean | null
          diretor: string | null
          dt_distrato: string | null
          empreendimento: string | null
          gerente: string | null
          id: number | null
          motivo: string | null
          observacao: string | null
          periodo_id: number | null
          superintendente: string | null
          supervisor: string | null
          tipo_distrato: string | null
          valor_gerente: number | null
          valor_gestor: number | null
          valor_superintendente: number | null
          valor_supervisor: number | null
          valor_total: number | null
          valor_vendedor: number | null
          vendedor: string | null
        }
        Insert: {
          apto?: string | null
          cliente?: string | null
          comissao_paga?: boolean | null
          created_at?: string | null
          descontar?: boolean | null
          diretor?: string | null
          dt_distrato?: string | null
          empreendimento?: string | null
          gerente?: string | null
          id?: number | null
          motivo?: string | null
          observacao?: string | null
          periodo_id?: number | null
          superintendente?: string | null
          supervisor?: string | null
          tipo_distrato?: string | null
          valor_gerente?: number | null
          valor_gestor?: number | null
          valor_superintendente?: number | null
          valor_supervisor?: number | null
          valor_total?: number | null
          valor_vendedor?: number | null
          vendedor?: string | null
        }
        Update: {
          apto?: string | null
          cliente?: string | null
          comissao_paga?: boolean | null
          created_at?: string | null
          descontar?: boolean | null
          diretor?: string | null
          dt_distrato?: string | null
          empreendimento?: string | null
          gerente?: string | null
          id?: number | null
          motivo?: string | null
          observacao?: string | null
          periodo_id?: number | null
          superintendente?: string | null
          supervisor?: string | null
          tipo_distrato?: string | null
          valor_gerente?: number | null
          valor_gestor?: number | null
          valor_superintendente?: number | null
          valor_supervisor?: number | null
          valor_total?: number | null
          valor_vendedor?: number | null
          vendedor?: string | null
        }
        Relationships: []
      }
      outros: {
        Row: {
          created_at: string | null
          descricao: string | null
          id: number | null
          nome_completo: string | null
          periodo_id: number | null
          valor: number | null
        }
        Insert: {
          created_at?: string | null
          descricao?: string | null
          id?: number | null
          nome_completo?: string | null
          periodo_id?: number | null
          valor?: number | null
        }
        Update: {
          created_at?: string | null
          descricao?: string | null
          id?: number | null
          nome_completo?: string | null
          periodo_id?: number | null
          valor?: number | null
        }
        Relationships: []
      }
      premiacao: {
        Row: {
          created_at: string | null
          descricao_premio_regra: string | null
          funcao: string | null
          gerente: string | null
          gestor: string | null
          id: number | null
          periodo_id: number | null
          premiado: string | null
          qtd_vendas: number | null
          valor_premio: number | null
        }
        Insert: {
          created_at?: string | null
          descricao_premio_regra?: string | null
          funcao?: string | null
          gerente?: string | null
          gestor?: string | null
          id?: number | null
          periodo_id?: number | null
          premiado?: string | null
          qtd_vendas?: number | null
          valor_premio?: number | null
        }
        Update: {
          created_at?: string | null
          descricao_premio_regra?: string | null
          funcao?: string | null
          gerente?: string | null
          gestor?: string | null
          id?: number | null
          periodo_id?: number | null
          premiado?: string | null
          qtd_vendas?: number | null
          valor_premio?: number | null
        }
        Relationships: []
      }
      resume: {
        Row: {
          adiantamento: number | null
          antecipacao: number | null
          comissao: number | null
          cpf: string | null
          created_at: string | null
          distrato: number | null
          id: string | null
          outras: number | null
          outros: number | null
          pagar: number | null
          periodo_id: number | null
          premio: number | null
          saldo_cef: number | null
          saldo_neg_periodos_anteriores: number | null
          saldo_permuta: number | null
          user_id: string | null
          valor_base: number | null
        }
        Insert: {
          adiantamento?: number | null
          antecipacao?: number | null
          comissao?: number | null
          cpf?: string | null
          created_at?: string | null
          distrato?: number | null
          id?: string | null
          outras?: number | null
          outros?: number | null
          pagar?: number | null
          periodo_id?: number | null
          premio?: number | null
          saldo_cef?: number | null
          saldo_neg_periodos_anteriores?: number | null
          saldo_permuta?: number | null
          user_id?: string | null
          valor_base?: number | null
        }
        Update: {
          adiantamento?: number | null
          antecipacao?: number | null
          comissao?: number | null
          cpf?: string | null
          created_at?: string | null
          distrato?: number | null
          id?: string | null
          outras?: number | null
          outros?: number | null
          pagar?: number | null
          periodo_id?: number | null
          premio?: number | null
          saldo_cef?: number | null
          saldo_neg_periodos_anteriores?: number | null
          saldo_permuta?: number | null
          user_id?: string | null
          valor_base?: number | null
        }
        Relationships: []
      }
      saldo_cef: {
        Row: {
          bl: string | null
          cliente: string | null
          comissao_extra_perc: number | null
          comissao_sinal_perc: number | null
          comissao_sinal_valor: number | null
          comissao_vgv_perc: number | null
          comissao_vgv_valor: number | null
          created_at: string | null
          empreendimento: string | null
          gerente: string | null
          gestor: string | null
          id: number | null
          periodo_id: number | null
          premio_repasse_fiador_valor: number | null
          subtotal: number | null
          superintendente: string | null
          supervisor_coord_parceiro: string | null
          total: number | null
          unid: string | null
          vendedor_parceiro: string | null
          vendedor_premio_repasse_fiador_valor: number | null
          vendedor_vgv_valor: number | null
        }
        Insert: {
          bl?: string | null
          cliente?: string | null
          comissao_extra_perc?: number | null
          comissao_sinal_perc?: number | null
          comissao_sinal_valor?: number | null
          comissao_vgv_perc?: number | null
          comissao_vgv_valor?: number | null
          created_at?: string | null
          empreendimento?: string | null
          gerente?: string | null
          gestor?: string | null
          id?: number | null
          periodo_id?: number | null
          premio_repasse_fiador_valor?: number | null
          subtotal?: number | null
          superintendente?: string | null
          supervisor_coord_parceiro?: string | null
          total?: number | null
          unid?: string | null
          vendedor_parceiro?: string | null
          vendedor_premio_repasse_fiador_valor?: number | null
          vendedor_vgv_valor?: number | null
        }
        Update: {
          bl?: string | null
          cliente?: string | null
          comissao_extra_perc?: number | null
          comissao_sinal_perc?: number | null
          comissao_sinal_valor?: number | null
          comissao_vgv_perc?: number | null
          comissao_vgv_valor?: number | null
          created_at?: string | null
          empreendimento?: string | null
          gerente?: string | null
          gestor?: string | null
          id?: number | null
          periodo_id?: number | null
          premio_repasse_fiador_valor?: number | null
          subtotal?: number | null
          superintendente?: string | null
          supervisor_coord_parceiro?: string | null
          total?: number | null
          unid?: string | null
          vendedor_parceiro?: string | null
          vendedor_premio_repasse_fiador_valor?: number | null
          vendedor_vgv_valor?: number | null
        }
        Relationships: []
      }
    }
    Functions: {
      binary_quantize: {
        Args: { "": string } | { "": unknown }
        Returns: unknown
      }
      buscar_cliente_por_cpf: {
        Args: { p_cpf: string }
        Returns: {
          cpf: string
          nome: string
          total_visitas: number
          ultima_visita: string
          whatsapp: string
        }[]
      }
      check_mesa_disponivel: {
        Args: { p_andar: string; p_loja: string; p_mesa: number }
        Returns: boolean
      }
      check_tempo_espera: {
        Args: { created_time: string }
        Returns: boolean
      }
      delete_category_reassign_articles: {
        Args: { p_category_id: string }
        Returns: number
      }
      finalizar_visita: {
        Args: { visit_id: string }
        Returns: undefined
      }
      fix_user_relations: {
        Args: Record<PropertyKey, never>
        Returns: undefined
      }
      generate_scheduling_token: {
        Args: Record<PropertyKey, never>
        Returns: string
      }
      gerar_link_corretor: {
        Args: { corretor_uuid: string; link_titulo?: string }
        Returns: string
      }
      get_champions_ranking: {
        Args: {
          limit_count?: number
          offset_count?: number
          ranking_type?: string
        }
        Returns: {
          avatar_url: string
          contracts_count: number
          name: string
          nickname: string
          revenue: number
          role: string
          sales_count: number
          total_count: number
          user_id: string
          visits_count: number
        }[]
      }
      get_champions_ranking_optimized: {
        Args: {
          limit_count?: number
          offset_count?: number
          ranking_type?: string
        }
        Returns: {
          avatar_url: string
          contracts_count: number
          name: string
          nickname: string
          revenue: number
          role: string
          sales_count: number
          total_count: number
          user_id: string
          visits_count: number
        }[]
      }
      get_corretor_stats: {
        Args: { corretor_uuid: string }
        Returns: {
          agendamentos_confirmados: number
          tempo_medio_minutos: number
          total_visitas: number
          visitas_ativas: number
          visitas_hoje: number
        }[]
      }
      get_current_period: {
        Args: Record<PropertyKey, never>
        Returns: {
          end: string
          id: number
          start: string
        }[]
      }
      get_dashboard_stats: {
        Args: Record<PropertyKey, never>
        Returns: {
          mesas_ocupadas: number
          total_visitas_hoje: number
          visitas_ativas: number
          visitas_finalizadas_hoje: number
        }[]
      }
      get_dashboard_stats_filtered: {
        Args: {
          end_date?: string
          start_date?: string
          superintendente?: string
        }
        Returns: {
          clientes_lista_espera: number
          mesas_ocupadas: number
          total_visitas_hoje: number
          visitas_ativas: number
          visitas_finalizadas_hoje: number
        }[]
      }
      get_payment_history: {
        Args: { current_period_id: number; user_cpf: string }
        Returns: {
          adiantamento: number
          antecipacao: number
          comissao: number
          created_at: string
          distrato: number
          id: string
          outras: number
          outros: number
          pagar: number
          period_end: string
          period_start: string
          periodo_id: number
          premio: number
          saldo_cef: number
          saldo_neg_periodos_anteriores: number
          saldo_permuta: number
          valor_base: number
        }[]
      }
      get_profile_stats: {
        Args: { user_uuid: string }
        Returns: {
          avatar_url: string
          contratos_count: number
          cover_url: string
          ranking_position: number
          recebimento: number
          total_users: number
          user_apelido: string
          user_cpf: string
          user_gerente: string
          user_id: string
          user_name: string
          user_role: string
          user_superintendente: string
          vendas_count: number
          visitas_count: number
        }[]
      }
      halfvec_avg: {
        Args: { "": number[] }
        Returns: unknown
      }
      halfvec_out: {
        Args: { "": unknown }
        Returns: unknown
      }
      halfvec_send: {
        Args: { "": unknown }
        Returns: string
      }
      halfvec_typmod_in: {
        Args: { "": unknown[] }
        Returns: number
      }
      has_role: {
        Args: {
          _role: Database["public"]["Enums"]["app_role"]
          _user_id: string
        }
        Returns: boolean
      }
      hnsw_bit_support: {
        Args: { "": unknown }
        Returns: unknown
      }
      hnsw_halfvec_support: {
        Args: { "": unknown }
        Returns: unknown
      }
      hnsw_sparsevec_support: {
        Args: { "": unknown }
        Returns: unknown
      }
      hnswhandler: {
        Args: { "": unknown }
        Returns: unknown
      }
      increment_article_views: {
        Args: { article_id: string }
        Returns: undefined
      }
      ivfflat_bit_support: {
        Args: { "": unknown }
        Returns: unknown
      }
      ivfflat_halfvec_support: {
        Args: { "": unknown }
        Returns: unknown
      }
      ivfflathandler: {
        Args: { "": unknown }
        Returns: unknown
      }
      l2_norm: {
        Args: { "": unknown } | { "": unknown }
        Returns: number
      }
      l2_normalize: {
        Args: { "": string } | { "": unknown } | { "": unknown }
        Returns: unknown
      }
      match_documents: {
        Args: { filter?: Json; match_count?: number; query_embedding: string }
        Returns: {
          content: string
          id: number
          metadata: Json
          similarity: number
        }[]
      }
      search_faq_articles: {
        Args: { search_term: string }
        Returns: {
          category_id: string
          category_name: string
          content: string
          id: string
          relevance: number
          title: string
        }[]
      }
      sparsevec_out: {
        Args: { "": unknown }
        Returns: unknown
      }
      sparsevec_send: {
        Args: { "": unknown }
        Returns: string
      }
      sparsevec_typmod_in: {
        Args: { "": unknown[] }
        Returns: number
      }
      validate_cpf_and_create_profile: {
        Args: { user_cpf: string }
        Returns: boolean
      }
      vector_avg: {
        Args: { "": number[] }
        Returns: string
      }
      vector_dims: {
        Args: { "": string } | { "": unknown }
        Returns: number
      }
      vector_norm: {
        Args: { "": string }
        Returns: number
      }
      vector_out: {
        Args: { "": string }
        Returns: unknown
      }
      vector_send: {
        Args: { "": string }
        Returns: string
      }
      vector_typmod_in: {
        Args: { "": unknown[] }
        Returns: number
      }
    }
    Enums: {
      app_role: "admin" | "user" | "editor"
    }
    CompositeTypes: {
      [_ in never]: never
    }
  }
}

type DatabaseWithoutInternals = Omit<Database, "__InternalSupabase">

type DefaultSchema = DatabaseWithoutInternals[Extract<keyof Database, "public">]

export type Tables<
  DefaultSchemaTableNameOrOptions extends
    | keyof (DefaultSchema["Tables"] & DefaultSchema["Views"])
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
        DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Views"])
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
      DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Views"])[TableName] extends {
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
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
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
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
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
    | { schema: keyof DatabaseWithoutInternals },
  EnumName extends DefaultSchemaEnumNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"]
    : never = never,
> = DefaultSchemaEnumNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"][EnumName]
  : DefaultSchemaEnumNameOrOptions extends keyof DefaultSchema["Enums"]
    ? DefaultSchema["Enums"][DefaultSchemaEnumNameOrOptions]
    : never

export type CompositeTypes<
  PublicCompositeTypeNameOrOptions extends
    | keyof DefaultSchema["CompositeTypes"]
    | { schema: keyof DatabaseWithoutInternals },
  CompositeTypeName extends PublicCompositeTypeNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"]
    : never = never,
> = PublicCompositeTypeNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"][CompositeTypeName]
  : PublicCompositeTypeNameOrOptions extends keyof DefaultSchema["CompositeTypes"]
    ? DefaultSchema["CompositeTypes"][PublicCompositeTypeNameOrOptions]
    : never

export const Constants = {
  public: {
    Enums: {
      app_role: ["admin", "user", "editor"],
    },
  },
} as const
