
import { Layout } from "@/components/Layout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { UserPlus, MapPin, Clock, Copy } from "lucide-react";
import { useState, useEffect } from "react";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { AutoSuggest } from "@/components/AutoSuggest";

const Recepcao = () => {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [formData, setFormData] = useState({
    cliente_nome: "",
    cliente_cpf: "",
    cliente_whatsapp: "",
    corretor_nome: "",
    empreendimento: "",
    loja: "",
    andar: "",
    mesa: "",
  });

  // Definir configuração das lojas
  const lojasConfig = {
    "Loja 1": { mesas: 22, temAndar: false },
    "Loja 2": { mesas: 29, temAndar: true },
    "Loja 3": { mesas: 10, temAndar: false },
    "Loja Superior 37 andar": { mesas: 29, temAndar: false }
  };

  // Buscar corretores do banco de dados
  const { data: corretores = [] } = useQuery({
    queryKey: ['corretores'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('users')
        .select('id, name, apelido')
        .eq('role', 'corretor');
      
      if (error) {
        console.error('Erro ao buscar corretores:', error);
        return [];
      }
      
      return data?.map(corretor => ({
        id: corretor.id,
        name: `${corretor.name} (${corretor.apelido})`
      })) || [];
    }
  });

  // Buscar empreendimentos do banco de dados
  const { data: empreendimentos = [] } = useQuery({
    queryKey: ['empreendimentos'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('empreendimentos')
        .select('id, nome')
        .order('nome');
      
      if (error) {
        console.error('Erro ao buscar empreendimentos:', error);
        return [];
      }
      
      return data?.map(emp => ({
        id: emp.id,
        name: emp.nome
      })) || [];
    }
  });

  // Buscar visitas ativas para verificar mesas ocupadas
  const { data: visitasAtivas = [] } = useQuery({
    queryKey: ['visitas-ativas'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('visits')
        .select('mesa, loja, andar')
        .eq('status', 'ativo');
      
      if (error) {
        console.error('Erro ao buscar visitas ativas:', error);
        return [];
      }
      
      return data || [];
    }
  });

  // Função para copiar mensagem para clipboard
  const copyMessageToClipboard = async (visitData: typeof formData) => {
    try {
      // Buscar apelido do corretor
      let apelidoCorretor = visitData.corretor_nome;
      if (visitData.corretor_nome) {
        const { data: corretorData } = await supabase
          .from('users')
          .select('apelido')
          .or(`name.ilike.%${visitData.corretor_nome.split(' (')[0]}%,apelido.ilike.%${visitData.corretor_nome}%`)
          .limit(1)
          .single();
        
        apelidoCorretor = corretorData?.apelido || visitData.corretor_nome;
      }

      // Extrair primeiro nome do cliente
      const primeiroNome = visitData.cliente_nome.split(' ')[0];
      
      // Criar mensagem
      const mensagem = `Corretor ${apelidoCorretor} - Cliente ${primeiroNome} - ${visitData.loja} - Mesa ${visitData.mesa}`;
      
      // Copiar para clipboard
      await navigator.clipboard.writeText(mensagem);
      
      // Mostrar notificação de sucesso
      toast({
        title: "Mensagem copiada!",
        description: "A mensagem foi copiada para a área de transferência.",
        action: (
          <div className="flex items-center gap-1">
            <Copy className="h-3 w-3" />
            <span className="text-xs">Copiado</span>
          </div>
        ),
      });

      console.log('Mensagem copiada:', mensagem);
    } catch (error) {
      console.error('Erro ao copiar mensagem:', error);
      toast({
        title: "Erro ao copiar",
        description: "Não foi possível copiar a mensagem.",
        variant: "destructive",
      });
    }
  };

  // Mutation para criar nova visita
  const createVisitMutation = useMutation({
    mutationFn: async (visitData: typeof formData) => {
      // Buscar ID do corretor se foi informado
      let corretor_id = null;
      if (visitData.corretor_nome) {
        const { data: corretorData } = await supabase
          .from('users')
          .select('id')
          .or(`name.ilike.%${visitData.corretor_nome.split(' (')[0]}%,apelido.ilike.%${visitData.corretor_nome}%`)
          .limit(1)
          .single();
        
        corretor_id = corretorData?.id || null;
      }

      const { data, error } = await supabase
        .from('visits')
        .insert({
          cliente_nome: visitData.cliente_nome,
          cliente_cpf: visitData.cliente_cpf,
          cliente_whatsapp: visitData.cliente_whatsapp || null,
          corretor_nome: visitData.corretor_nome || '',
          corretor_id: corretor_id || '00000000-0000-0000-0000-000000000000',
          empreendimento: visitData.empreendimento || null,
          loja: visitData.loja,
          andar: visitData.andar || 'N/A',
          mesa: parseInt(visitData.mesa),
          status: 'ativo'
        })
        .select()
        .single();

      if (error) {
        console.error('Erro ao criar visita:', error);
        throw error;
      }

      return data;
    },
    onSuccess: async (data) => {
      toast({
        title: "Visita registrada!",
        description: `Cliente ${data.cliente_nome} foi registrado na mesa ${data.mesa}.`,
      });

      // Copiar mensagem automaticamente
      await copyMessageToClipboard(formData);

      // Limpar formulário
      setFormData({
        cliente_nome: "",
        cliente_cpf: "",
        cliente_whatsapp: "",
        corretor_nome: "",
        empreendimento: "",
        loja: "",
        andar: "",
        mesa: "",
      });

      // Atualizar dados das visitas ativas
      queryClient.invalidateQueries({ queryKey: ['visitas-ativas'] });
    },
    onError: (error) => {
      console.error('Erro ao registrar visita:', error);
      toast({
        title: "Erro ao registrar visita",
        description: "Ocorreu um erro ao salvar os dados. Tente novamente.",
        variant: "destructive",
      });
    }
  });

  // Calcular mesas ocupadas baseado nas visitas ativas
  const mesasOcupadas = visitasAtivas
    .filter(visita => visita.loja === formData.loja && 
      (formData.andar === '' || visita.andar === formData.andar || formData.andar === 'N/A'))
    .map(visita => visita.mesa);

  // Limpar andar quando trocar de loja
  useEffect(() => {
    if (formData.loja && !lojasConfig[formData.loja as keyof typeof lojasConfig]?.temAndar) {
      setFormData(prev => ({ ...prev, andar: "" }));
    }
  }, [formData.loja]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    // Validação básica
    if (!formData.cliente_nome || !formData.cliente_cpf || !formData.mesa || !formData.loja) {
      toast({
        title: "Campos obrigatórios",
        description: "Por favor, preencha todos os campos obrigatórios.",
        variant: "destructive",
      });
      return;
    }

    // Verificar se precisa de andar para Loja 2
    if (formData.loja === "Loja 2" && !formData.andar) {
      toast({
        title: "Andar obrigatório",
        description: "Para Loja 2, é necessário selecionar o andar.",
        variant: "destructive",
      });
      return;
    }

    // Verificar se a mesa está ocupada
    if (mesasOcupadas.includes(parseInt(formData.mesa))) {
      toast({
        title: "Mesa ocupada",
        description: "Esta mesa já está sendo utilizada. Escolha outra mesa.",
        variant: "destructive",
      });
      return;
    }

    createVisitMutation.mutate(formData);
  };

  const renderMesaOption = (mesa: number) => {
    const isOcupada = mesasOcupadas.includes(mesa);
    return (
      <SelectItem 
        key={mesa} 
        value={mesa.toString()} 
        disabled={isOcupada}
        className={isOcupada ? "opacity-50" : ""}
      >
        <div className="flex items-center gap-2">
          <span>Mesa {mesa}</span>
          {isOcupada && (
            <Badge variant="secondary" className="text-xs">
              Ocupada
            </Badge>
          )}
        </div>
      </SelectItem>
    );
  };

  const getMaxMesas = () => {
    if (!formData.loja) return 0;
    return lojasConfig[formData.loja as keyof typeof lojasConfig]?.mesas || 0;
  };

  return (
    <Layout>
      <div className="max-w-4xl mx-auto space-y-8">
        {/* Header */}
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center">
            <UserPlus className="h-5 w-5 text-blue-600" />
          </div>
          <div>
            <h1 className="text-3xl font-bold text-slate-900">Recepção</h1>
            <p className="text-slate-600">Registre a entrada de novos clientes</p>
          </div>
        </div>

        {/* Status das Mesas */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <MapPin className="h-5 w-5" />
              Status das Mesas
              {formData.loja && (
                <span className="text-sm font-normal text-slate-600">
                  - {formData.loja}
                  {formData.loja === "Loja 2" && formData.andar && `, ${formData.andar}`}
                </span>
              )}
            </CardTitle>
          </CardHeader>
          <CardContent>
            {!formData.loja ? (
              <p className="text-slate-500">Selecione a loja para ver o status das mesas.</p>
            ) : (
              <>
                <div className="grid grid-cols-5 md:grid-cols-10 gap-3">
                  {Array.from({ length: getMaxMesas() }, (_, i) => i + 1).map((mesa) => {
                    const isOcupada = mesasOcupadas.includes(mesa);
                    return (
                      <div
                        key={mesa}
                        className={`
                          w-12 h-12 rounded-lg border-2 flex items-center justify-center text-sm font-semibold
                          ${isOcupada 
                            ? 'bg-red-100 border-red-300 text-red-700' 
                            : 'bg-green-100 border-green-300 text-green-700'
                          }
                        `}
                      >
                        {mesa}
                      </div>
                    );
                  })}
                </div>
                <div className="flex items-center gap-6 mt-4 text-sm">
                  <div className="flex items-center gap-2">
                    <div className="w-4 h-4 bg-green-100 border-2 border-green-300 rounded"></div>
                    <span className="text-slate-600">Disponível</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <div className="w-4 h-4 bg-red-100 border-2 border-red-300 rounded"></div>
                    <span className="text-slate-600">Ocupada</span>
                  </div>
                </div>
              </>
            )}
          </CardContent>
        </Card>

        {/* Formulário de Registro */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Clock className="h-5 w-5" />
              Registrar Nova Visita
            </CardTitle>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-6">
              {/* Dados do Cliente */}
              <div className="space-y-4">
                <h3 className="text-lg font-semibold text-slate-900 border-b border-slate-200 pb-2">
                  Dados do Cliente
                </h3>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="cliente_nome">Nome Completo *</Label>
                    <Input
                      id="cliente_nome"
                      placeholder="Digite o nome do cliente"
                      value={formData.cliente_nome}
                      onChange={(e) => setFormData(prev => ({ ...prev, cliente_nome: e.target.value }))}
                      required
                    />
                  </div>
                  
                  <div className="space-y-2">
                    <Label htmlFor="cliente_cpf">CPF *</Label>
                    <Input
                      id="cliente_cpf"
                      placeholder="000.000.000-00"
                      value={formData.cliente_cpf}
                      onChange={(e) => setFormData(prev => ({ ...prev, cliente_cpf: e.target.value }))}
                      required
                    />
                  </div>
                  
                  <div className="space-y-2">
                    <Label htmlFor="cliente_whatsapp">WhatsApp</Label>
                    <Input
                      id="cliente_whatsapp"
                      placeholder="(00) 00000-0000"
                      value={formData.cliente_whatsapp}
                      onChange={(e) => setFormData(prev => ({ ...prev, cliente_whatsapp: e.target.value }))}
                    />
                  </div>
                  
                  <AutoSuggest
                    label="Corretor"
                    placeholder="Digite o nome do corretor"
                    options={corretores}
                    value={formData.corretor_nome}
                    onValueChange={(value) => setFormData(prev => ({ ...prev, corretor_nome: value }))}
                  />
                </div>
              </div>

              {/* Dados da Visita */}
              <div className="space-y-4">
                <h3 className="text-lg font-semibold text-slate-900 border-b border-slate-200 pb-2">
                  Dados da Visita
                </h3>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <AutoSuggest
                    label="Empreendimento de Interesse"
                    placeholder="Digite o nome do empreendimento"
                    options={empreendimentos}
                    value={formData.empreendimento}
                    onValueChange={(value) => setFormData(prev => ({ ...prev, empreendimento: value }))}
                  />
                  
                  <div className="space-y-2">
                    <Label htmlFor="loja">Loja *</Label>
                    <Select onValueChange={(value) => setFormData(prev => ({ ...prev, loja: value, mesa: "" }))}>
                      <SelectTrigger>
                        <SelectValue placeholder="Selecione a loja" />
                      </SelectTrigger>
                      <SelectContent>
                        {Object.keys(lojasConfig).map((loja) => (
                          <SelectItem key={loja} value={loja}>
                            {loja} ({lojasConfig[loja as keyof typeof lojasConfig].mesas} mesas)
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  
                  {formData.loja === "Loja 2" && (
                    <div className="space-y-2">
                      <Label htmlFor="andar">Andar *</Label>
                      <Select onValueChange={(value) => setFormData(prev => ({ ...prev, andar: value, mesa: "" }))}>
                        <SelectTrigger>
                          <SelectValue placeholder="Selecione o andar" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="Térreo">Térreo</SelectItem>
                          <SelectItem value="Mezanino">Mezanino</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  )}
                  
                  <div className="space-y-2">
                    <Label htmlFor="mesa">Mesa *</Label>
                    <Select 
                      onValueChange={(value) => setFormData(prev => ({ ...prev, mesa: value }))}
                      disabled={!formData.loja || (formData.loja === "Loja 2" && !formData.andar)}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Selecione a mesa" />
                      </SelectTrigger>
                      <SelectContent>
                        {Array.from({ length: getMaxMesas() }, (_, i) => i + 1).map((mesa) => 
                          renderMesaOption(mesa)
                        )}
                      </SelectContent>
                    </Select>
                  </div>
                </div>
              </div>

              {/* Botões */}
              <div className="flex gap-4 pt-6">
                <Button 
                  type="submit" 
                  className="flex-1 bg-blue-600 hover:bg-blue-700"
                  disabled={createVisitMutation.isPending}
                >
                  {createVisitMutation.isPending ? "Registrando..." : "Registrar Entrada"}
                </Button>
                <Button 
                  type="button" 
                  variant="outline" 
                  onClick={() => setFormData({
                    cliente_nome: "",
                    cliente_cpf: "",
                    cliente_whatsapp: "",
                    corretor_nome: "",
                    empreendimento: "",
                    loja: "",
                    andar: "",
                    mesa: "",
                  })}
                >
                  Limpar
                </Button>
              </div>
            </form>
          </CardContent>
        </Card>
      </div>
    </Layout>
  );
};

export default Recepcao;
