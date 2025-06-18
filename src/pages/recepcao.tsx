
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import { Copy, User, Users, Building2, MapPin, Table } from "lucide-react";
import { useState, useEffect } from "react";
import { useToast } from "@/hooks/use-toast";
import { useSearchParams } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { useMutation } from "@tanstack/react-query";
import { Layout } from "@/components/Layout";

const Recepcao = () => {
  const { toast } = useToast();
  const [searchParams] = useSearchParams();
  const [corretorNome, setCorretorNome] = useState("");
  const [formData, setFormData] = useState({
    cliente_nome: "",
    cliente_cpf: "",
    corretor_nome: "",
    loja: "",
    andar: "",
    mesa: "",
  });

  const lojas = [
    "Loja 1",
    "Loja 2",
    "Loja 3",
    "Loja 4",
    "Loja 5"
  ];

  const andares = [
    "Térreo",
    "1º Andar",
    "2º Andar",
    "3º Andar",
    "4º Andar"
  ];

  const mesas = [
    "Mesa 1",
    "Mesa 2",
    "Mesa 3",
    "Mesa 4",
    "Mesa 5"
  ];

  useEffect(() => {
    // Pegar o nome do corretor da URL
    const corretor = searchParams.get('corretor');
    if (corretor) {
      setCorretorNome(decodeURIComponent(corretor));
      setFormData(prev => ({ ...prev, corretor_nome: decodeURIComponent(corretor) }));
    }
  }, [searchParams]);

  // Mutation para criar visita
  const createVisitMutation = useMutation({
    mutationFn: async (visitData: typeof formData) => {
      const { data, error } = await supabase
        .from('visits')
        .insert([visitData])
        .select()
        .single();

      if (error) {
        console.error('Erro ao criar visita:', error);
        throw error;
      }

      return data;
    },
    onSuccess: () => {
      // Copiar mensagem automaticamente
      const primeiroNome = formData.cliente_nome.split(' ')[0];
      const message = `Corretor ${formData.corretor_nome} - Cliente ${primeiroNome} - ${formData.loja} - Mesa ${formData.mesa}`;
      
      navigator.clipboard.writeText(message).then(() => {
        toast({
          title: "Visita registrada!",
          description: "Visita registrada com sucesso e mensagem copiada para a área de transferência.",
        });
      }).catch(() => {
        toast({
          title: "Visita registrada!",
          description: "Visita registrada com sucesso.",
        });
      });

      // Limpar formulário
      setFormData({
        cliente_nome: "",
        cliente_cpf: "",
        corretor_nome: corretorNome,
        loja: "",
        andar: "",
        mesa: "",
      });
    },
    onError: (error) => {
      console.error('Erro ao registrar visita:', error);
      toast({
        title: "Erro ao registrar visita",
        description: "Ocorreu um erro ao registrar a visita. Tente novamente.",
        variant: "destructive",
      });
    }
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.cliente_nome || !formData.corretor_nome || !formData.loja || !formData.andar || !formData.mesa) {
      toast({
        title: "Campos obrigatórios",
        description: "Por favor, preencha todos os campos obrigatórios.",
        variant: "destructive",
      });
      return;
    }

    // Se CPF não for preenchido, usar valor padrão
    const cpfToSubmit = formData.cliente_cpf.trim() || "00000000000";

    createVisitMutation.mutate({
      ...formData,
      cliente_cpf: cpfToSubmit,
    });
  };

  const generateMessage = () => {
    const primeiroNome = formData.cliente_nome.split(' ')[0];
    return `Corretor ${formData.corretor_nome} - Cliente ${primeiroNome} - ${formData.loja} - Mesa ${formData.mesa}`;
  };

  const handleCopyToClipboard = () => {
    const message = generateMessage();
    navigator.clipboard.writeText(message);
    toast({
      title: "Mensagem copiada!",
      description: "A mensagem foi copiada para a área de transferência.",
    });
  };

  return (
    <Layout>
      <div className="max-w-2xl mx-auto">
        <div className="text-center mb-8">
          <div className="w-16 h-16 bg-blue-600 rounded-2xl flex items-center justify-center mx-auto mb-4">
            <span className="text-white text-2xl">👋</span>
          </div>
          <h1 className="text-2xl font-bold text-slate-900 mb-2">
            Recepção de Clientes
          </h1>
          {corretorNome && (
            <p className="text-slate-600">
              Corretor: <strong>{corretorNome}</strong>
            </p>
          )}
        </div>

        <Card className="shadow-xl border-0">
          <CardHeader className="text-center pb-4">
            <CardTitle className="flex items-center justify-center gap-2 text-slate-900">
              <Users className="h-5 w-5" />
              Dados da Visita
            </CardTitle>
            <CardDescription>Informe os dados do cliente para registrar a visita.</CardDescription>
          </CardHeader>

          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="cliente_nome" className="text-slate-700">
                  Nome do Cliente *
                </Label>
                <div className="relative">
                  <User className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-slate-400" />
                  <Input
                    id="cliente_nome"
                    placeholder="Nome completo do cliente"
                    value={formData.cliente_nome}
                    onChange={(e) => setFormData(prev => ({ ...prev, cliente_nome: e.target.value }))}
                    required
                    className="h-12 pl-10"
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="cliente_cpf" className="text-slate-700">
                  CPF do Cliente
                </Label>
                <Input
                  id="cliente_cpf"
                  placeholder="CPF do cliente (opcional)"
                  value={formData.cliente_cpf}
                  onChange={(e) => setFormData(prev => ({ ...prev, cliente_cpf: e.target.value }))}
                  className="h-12"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="corretor_nome" className="text-slate-700">
                  Corretor *
                </Label>
                <div className="relative">
                  <User className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-slate-400" />
                  <Input
                    id="corretor_nome"
                    placeholder="Nome do corretor"
                    value={formData.corretor_nome}
                    onChange={(e) => setFormData(prev => ({ ...prev, corretor_nome: e.target.value }))}
                    required
                    className="h-12 pl-10"
                    disabled
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="loja" className="text-slate-700">
                  Loja *
                </Label>
                <Select onValueChange={(value) => setFormData(prev => ({ ...prev, loja: value }))}>
                  <SelectTrigger className="h-12">
                    <div className="flex items-center gap-2">
                      <Building2 className="h-4 w-4 text-slate-400" />
                      <SelectValue placeholder="Selecione a loja" />
                    </div>
                  </SelectTrigger>
                  <SelectContent>
                    {lojas.map((loja) => (
                      <SelectItem key={loja} value={loja}>
                        {loja}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label htmlFor="andar" className="text-slate-700">
                  Andar *
                </Label>
                <Select onValueChange={(value) => setFormData(prev => ({ ...prev, andar: value }))}>
                  <SelectTrigger className="h-12">
                    <div className="flex items-center gap-2">
                      <MapPin className="h-4 w-4 text-slate-400" />
                      <SelectValue placeholder="Selecione o andar" />
                    </div>
                  </SelectTrigger>
                  <SelectContent>
                    {andares.map((andar) => (
                      <SelectItem key={andar} value={andar}>
                        {andar}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label htmlFor="mesa" className="text-slate-700">
                  Mesa *
                </Label>
                <Select onValueChange={(value) => setFormData(prev => ({ ...prev, mesa: value }))}>
                  <SelectTrigger className="h-12">
                    <div className="flex items-center gap-2">
                      <Table className="h-4 w-4 text-slate-400" />
                      <SelectValue placeholder="Selecione a mesa" />
                    </div>
                  </SelectTrigger>
                  <SelectContent>
                    {mesas.map((mesa) => (
                      <SelectItem key={mesa} value={mesa}>
                        {mesa}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <Button
                type="submit"
                className="w-full h-12 bg-blue-600 hover:bg-blue-700 text-lg font-semibold"
                disabled={createVisitMutation.isPending}
              >
                {createVisitMutation.isPending ? "Registrando..." : "Registrar Visita"}
              </Button>
            </form>

            <Button
              onClick={handleCopyToClipboard}
              className="w-full h-12 mt-4 bg-green-600 hover:bg-green-700 text-lg font-semibold"
              disabled={!formData.cliente_nome || !formData.corretor_nome || !formData.loja || !formData.mesa}
            >
              Copiar Mensagem
              <Copy className="ml-2 h-4 w-4" />
            </Button>
          </CardContent>
        </Card>
      </div>
    </Layout>
  );
};

export default Recepcao;
