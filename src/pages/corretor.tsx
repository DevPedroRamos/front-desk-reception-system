
import { Layout } from "@/components/Layout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Users, Link2, Search, Copy, Calendar } from "lucide-react";
import { useState } from "react";
import { useToast } from "@/hooks/use-toast";

const Corretor = () => {
  const { toast } = useToast();
  const [searchCpf, setSearchCpf] = useState("");
  const [corretorNome, setCorretorNome] = useState("Maria Santos"); // Mock do corretor logado
  const [generatedLink, setGeneratedLink] = useState("");

  // Mock data dos agendamentos do corretor
  const agendamentos = [
    {
      id: "1",
      cliente_nome: "João Silva",
      cliente_cpf: "123.456.789-00",
      whatsapp: "(11) 99999-1234",
      empreendimento: "Residencial Park View",
      data: "2024-01-16",
      hora: "14:00",
      status: "confirmado"
    },
    {
      id: "2",
      cliente_nome: "Ana Costa",
      cliente_cpf: "987.654.321-00",
      whatsapp: "(11) 88888-5678",
      empreendimento: "Condomínio Jardins",
      data: "2024-01-17",
      hora: "15:30",
      status: "pendente"
    }
  ];

  const handleGenerateLink = () => {
    if (!corretorNome) {
      toast({
        title: "Nome obrigatório",
        description: "Por favor, insira o nome do corretor.",
        variant: "destructive",
      });
      return;
    }

    // Gerar link personalizado
    const encodedName = encodeURIComponent(corretorNome);
    const baseUrl = window.location.origin;
    const link = `${baseUrl}/cliente?corretor=${encodedName}`;
    
    setGeneratedLink(link);
    
    toast({
      title: "Link gerado!",
      description: "Link de indicação criado com sucesso.",
    });
  };

  const handleCopyLink = async () => {
    try {
      await navigator.clipboard.writeText(generatedLink);
      toast({
        title: "Link copiado!",
        description: "O link foi copiado para a área de transferência.",
      });
    } catch (error) {
      toast({
        title: "Erro ao copiar",
        description: "Não foi possível copiar o link.",
        variant: "destructive",
      });
    }
  };

  const handleSearchClient = () => {
    if (!searchCpf) {
      toast({
        title: "CPF obrigatório",
        description: "Por favor, insira um CPF para buscar.",
        variant: "destructive",
      });
      return;
    }

    // Mock da busca
    console.log("Buscando cliente por CPF:", searchCpf);
    
    toast({
      title: "Busca realizada",
      description: `Buscando dados do cliente com CPF ${searchCpf}...`,
    });
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case "confirmado": return "bg-green-100 text-green-800 border-green-200";
      case "pendente": return "bg-yellow-100 text-yellow-800 border-yellow-200";
      default: return "bg-gray-100 text-gray-800 border-gray-200";
    }
  };

  return (
    <Layout>
      <div className="max-w-4xl mx-auto space-y-8">
        {/* Header */}
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center">
            <Users className="h-5 w-5 text-blue-600" />
          </div>
          <div>
            <h1 className="text-3xl font-bold text-slate-900">Área do Corretor</h1>
            <p className="text-slate-600">Bem-vindo, {corretorNome}</p>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Busca de Cliente */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Search className="h-5 w-5" />
                Buscar Cliente
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="search-cpf">CPF do Cliente</Label>
                <Input
                  id="search-cpf"
                  placeholder="000.000.000-00"
                  value={searchCpf}
                  onChange={(e) => setSearchCpf(e.target.value)}
                />
              </div>
              
              <Button 
                onClick={handleSearchClient}
                className="w-full bg-blue-600 hover:bg-blue-700"
              >
                <Search className="h-4 w-4 mr-2" />
                Buscar Cliente
              </Button>
              
              <div className="text-sm text-slate-600 bg-slate-50 p-3 rounded-lg">
                <strong>Dica:</strong> Use esta ferramenta para verificar se um cliente já possui agendamentos ou visitas anteriores.
              </div>
            </CardContent>
          </Card>

          {/* Gerador de Link */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Link2 className="h-5 w-5" />
                Link de Indicação
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="corretor-name">Seu Nome</Label>
                <Input
                  id="corretor-name"
                  placeholder="Digite seu nome"
                  value={corretorNome}
                  onChange={(e) => setCorretorNome(e.target.value)}
                />
              </div>
              
              <Button 
                onClick={handleGenerateLink}
                className="w-full bg-green-600 hover:bg-green-700"
              >
                <Link2 className="h-4 w-4 mr-2" />
                Gerar Link
              </Button>
              
              {generatedLink && (
                <div className="space-y-2">
                  <Label>Link Personalizado</Label>
                  <div className="flex gap-2">
                    <Input
                      value={generatedLink}
                      readOnly
                      className="text-sm bg-slate-50"
                    />
                    <Button 
                      size="sm" 
                      variant="outline"
                      onClick={handleCopyLink}
                    >
                      <Copy className="h-4 w-4" />
                    </Button>
                  </div>
                  <p className="text-xs text-slate-600">
                    Compartilhe este link com seus clientes para que eles possam confirmar visitas diretamente.
                  </p>
                </div>
              )}
            </CardContent>
          </Card>
        </div>

        {/* Meus Agendamentos */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Calendar className="h-5 w-5" />
              Meus Agendamentos
            </CardTitle>
          </CardHeader>
          <CardContent>
            {agendamentos.length > 0 ? (
              <div className="space-y-4">
                {agendamentos.map((agendamento) => (
                  <div 
                    key={agendamento.id}
                    className="border border-slate-200 rounded-lg p-4 hover:shadow-md transition-shadow"
                  >
                    <div className="flex items-start justify-between mb-3">
                      <div>
                        <h3 className="font-semibold text-slate-900">
                          {agendamento.cliente_nome}
                        </h3>
                        <p className="text-sm text-slate-600">
                          CPF: {agendamento.cliente_cpf}
                        </p>
                      </div>
                      <Badge className={getStatusColor(agendamento.status)}>
                        {agendamento.status === "confirmado" ? "Confirmado" : "Pendente"}
                      </Badge>
                    </div>
                    
                    <div className="grid grid-cols-2 gap-4 text-sm">
                      <div>
                        <span className="text-slate-500">Data:</span>
                        <span className="ml-2 font-medium">
                          {new Date(agendamento.data).toLocaleDateString('pt-BR')}
                        </span>
                      </div>
                      <div>
                        <span className="text-slate-500">Horário:</span>
                        <span className="ml-2 font-medium">{agendamento.hora}</span>
                      </div>
                      <div>
                        <span className="text-slate-500">WhatsApp:</span>
                        <span className="ml-2 font-medium">{agendamento.whatsapp}</span>
                      </div>
                      <div className="col-span-2">
                        <span className="text-slate-500">Empreendimento:</span>
                        <span className="ml-2 font-medium">{agendamento.empreendimento}</span>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-12">
                <Calendar className="h-12 w-12 text-slate-300 mx-auto mb-4" />
                <h3 className="text-lg font-semibold text-slate-900 mb-2">
                  Nenhum agendamento
                </h3>
                <p className="text-slate-600">
                  Você não possui agendamentos no momento.
                </p>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </Layout>
  );
};

export default Corretor;
