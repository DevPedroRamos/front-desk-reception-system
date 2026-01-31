

## Plano: Dashboard em Tempo Real com Notificacoes

### Visao Geral
Implementar atualizacao em tempo real na pagina Index.tsx utilizando Supabase Realtime, seguindo o mesmo padrao ja existente no TV.tsx, com adicao de notificacoes toast para novos atendimentos.

### Arquitetura da Solucao

```text
+-------------------+     +-----------------------+     +------------------+
|  Supabase         |---->|  Realtime Channel     |---->|  Index.tsx       |
|  (tabela visits)  |     |  postgres_changes     |     |  (Dashboard)     |
+-------------------+     +-----------------------+     +------------------+
                                    |
                                    v
                          +-------------------+
                          |  toast(sonner)    |
                          |  Notificacao      |
                          +-------------------+
```

---

### Alteracoes no `src/pages/Index.tsx`

#### 1. Adicionar Refs para Controle de Notificacoes

```tsx
// Refs para evitar notificacoes duplicadas
const notifiedVisitIds = useRef(new Set<string>());
const lastKnownVisitId = useRef<string | null>(null);
```

#### 2. Criar useEffect para Realtime Subscription

Novo useEffect que:
- Cria canal Supabase para escutar eventos `INSERT` e `UPDATE` na tabela `visits`
- Quando detectar INSERT (novo atendimento):
  - Exibe toast de sucesso com nome do cliente e corretor
  - Atualiza automaticamente a lista de visitas ativas e estatisticas
- Quando detectar UPDATE (status mudou para finalizado):
  - Move a visita de ativas para finalizadas
  - Atualiza estatisticas
- Implementa fallback polling a cada 30 segundos (como backup)
- Limpa subscriptions no cleanup

```tsx
useEffect(() => {
  // Apenas executar apos carga inicial
  if (isInitialLoad.current) return;

  const channel = supabase
    .channel("dashboard-visits-realtime")
    .on("postgres_changes", {
      event: "INSERT",
      schema: "public",
      table: "visits"
    }, (payload) => {
      const newVisit = payload.new as Visit;
      
      if (!notifiedVisitIds.current.has(newVisit.id)) {
        notifiedVisitIds.current.add(newVisit.id);
        
        // Notificacao toast
        toast.success("Novo Atendimento!", {
          description: `${newVisit.cliente_nome} com ${newVisit.corretor_nome}`,
          duration: 5000,
        });
        
        // Atualizar dados
        loadActiveVisits();
        loadDashboardStats();
      }
    })
    .on("postgres_changes", {
      event: "UPDATE",
      schema: "public",
      table: "visits"
    }, (payload) => {
      // Quando visita for finalizada, atualizar ambas as listas
      loadActiveVisits();
      loadFinishedVisits();
      loadDashboardStats();
    })
    .subscribe();

  // Cleanup
  return () => {
    supabase.removeChannel(channel);
  };
}, [isInitialLoad.current]);
```

#### 3. Remover Botao "Atualizar"

- Remover ou ocultar o botao `RefreshCw` ja que nao sera mais necessario
- Opcionalmente: manter o botao mas com texto "Sincronizar" para casos de dessincronizacao

#### 4. Adicionar Indicador Visual de "Tempo Real"

- Badge no header mostrando que esta conectado em tempo real
- Pequeno pulso animado indicando conexao ativa

```tsx
<Badge className="bg-green-100 text-green-700 border-green-300">
  <span className="w-2 h-2 bg-green-500 rounded-full animate-pulse mr-2" />
  Tempo Real
</Badge>
```

---

### Resumo das Alteracoes

| Acao | Descricao |
|------|-----------|
| Adicionar refs | Controle de IDs notificados e ultimo ID conhecido |
| Novo useEffect | Subscription Realtime para INSERT/UPDATE |
| Toast notification | Notificar novos atendimentos com sonner |
| Badge indicador | Mostrar status de conexao em tempo real |
| Opcional: remover botao | Remover/ajustar botao Atualizar |

---

### Fluxo de Eventos

1. **Novo Atendimento (INSERT):**
   - Cliente inicia visita em outra pagina
   - Supabase dispara evento INSERT
   - Dashboard recebe via Realtime
   - Toast aparece no canto: "Novo Atendimento! Cliente X com Corretor Y"
   - Tabela de ativos atualiza automaticamente
   - Cards de estatisticas atualizam

2. **Atendimento Finalizado (UPDATE):**
   - Corretor finaliza visita
   - Supabase dispara evento UPDATE
   - Dashboard recebe via Realtime
   - Visita move de "Ativos" para "Finalizados"
   - Estatisticas atualizam automaticamente

---

### Consideracoes Tecnicas

- Supabase Realtime ja esta habilitado no projeto (usado em TV.tsx)
- Sonner (toast) ja esta instalado e configurado
- Fallback polling garante funcionamento mesmo se Realtime desconectar
- Limpeza adequada de subscriptions previne memory leaks

