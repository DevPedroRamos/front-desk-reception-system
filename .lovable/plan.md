## Plano: Novos Brindes (Cooler, Copo, Kit Fondue) com Copo Automático

### Visão Geral
- Substituir os tipos atuais (Cinemark, Mixer, Churrasqueira, Vinho) pelos novos: **Cooler**, **Copo** e **Kit Fondue**.
- **Copo** é entregue automaticamente a todo cliente ao registrar a visita (gravado direto na tabela `brindes`).
- Indicativo visual em todos os fluxos de cadastro avisando que o cliente receberá o Copo.
- No diálogo de finalização, mostrar que o Copo já foi entregue e oferecer um brinde extra opcional (Cooler ou Kit Fondue).

---

### 1. Migração de Banco (`brindes`)
Atualizar o CHECK constraint `brindes_tipo_brinde_check` para aceitar apenas os novos valores:

```sql
ALTER TABLE public.brindes DROP CONSTRAINT brindes_tipo_brinde_check;
ALTER TABLE public.brindes
  ADD CONSTRAINT brindes_tipo_brinde_check
  CHECK (tipo_brinde IN ('Cooler', 'Copo', 'Kit Fondue'));
```

Observação: registros antigos com Cinemark/Mixer/Churrasqueira/Vinho permanecem (constraint só valida novos inserts/updates). Se preferir limpar histórico, posso adicionar `DELETE` — confirmar antes.

---

### 2. Registro automático do Copo
Inserir um registro em `brindes` (`tipo_brinde = 'Copo'`, `validado = true`) imediatamente após criar a visita, nos dois pontos onde visitas são criadas:

- `src/pages/recepcao.tsx` (mutation que insere em `visits`)
- `src/components/IniciarVisitaDialog.tsx` (após o insert em `visits`)

Padrão usado:
```ts
await supabase.from('brindes').insert({
  visit_id: novaVisita.id,
  cliente_nome, cliente_cpf, corretor_nome,
  tipo_brinde: 'Copo',
  validado: true,
  data_validacao: new Date().toISOString(),
});
```

---

### 3. Indicativos visuais no cadastro
Banner/badge destacado (ícone GlassWater + cor azul) com texto **"Este cliente receberá um Copo de brinde"**:

- `src/components/AddClienteDialog.tsx` — banner abaixo do título.
- `src/components/IniciarVisitaDialog.tsx` — banner antes dos botões.
- `src/pages/recepcao.tsx` — banner no card do formulário de cadastro.

---

### 4. Diálogo de Finalização (`src/pages/Index.tsx`)
Reformular o `showBrindeDialog`:
- Cabeçalho com badge verde: **"Copo já entregue no início da visita"**.
- Texto: "Deseja entregar um brinde adicional?"
- Botões substituídos para: **Cooler**, **Kit Fondue**, **Sem brinde adicional**.
- `finalizarComBrinde` mantém a lógica atual (insere o brinde extra se selecionado, finaliza a visita).

---

### 5. Página `/brindes` (`src/pages/Brindes.tsx`)
- Trocar cards de estatísticas: **Total**, **Copo**, **Cooler**, **Kit Fondue**.
- Atualizar filtro `Select` com os novos valores.
- Atualizar `getBrindeIcon`/`getBrindeColor` para os novos tipos (ícones: GlassWater, Snowflake, UtensilsCrossed).

---

### Arquivos afetados
- Migration nova em `supabase/migrations/`
- `src/pages/recepcao.tsx`
- `src/components/AddClienteDialog.tsx`
- `src/components/IniciarVisitaDialog.tsx`
- `src/pages/Index.tsx`
- `src/pages/Brindes.tsx`
