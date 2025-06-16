
import { Layout } from "@/components/Layout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { UserPlus, MapPin, Clock } from "lucide-react";
import { useState } from "react";
import { useToast } from "@/hooks/use-toast";

const Recepcao = () => {
  const { toast } = useToast();
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

  // Mock data para demonstração
  const corretores = [
    "Maria Santos",
    "Carlos Oliveira", 
    "Fernanda Rocha",
    "João Pereira",
    "Ana Silva"
  ];

  const empreendimentos = [
    "Residencial Park View",
    "Condomínio Jardins",
    "Torres do Atlântico",
    "Villa Sunset",
    "Golden Tower"
  ];

  const mesasOcupadas = [3, 7, 12, 15]; // Mesas atualmente ocupadas

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    // Validação básica
    if (!formData.cliente_nome || !formData.cliente_cpf || !formData.mesa) {
      toast({
        title: "Campos obrigatórios",
        description: "Por favor, preencha todos os campos obrigatórios.",
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

    console.log("Nova visita registrada:", formData);
    
    toast({
      title: "Visita registrada!",
      description: `Cliente ${formData.cliente_nome} foi registrado na mesa ${formData.mesa}.`,
    });

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
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-5 md:grid-cols-10 gap-3">
              {Array.from({ length: 20 }, (_, i) => i + 1).map((mesa) => {
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
                  
                  <div className="space-y-2">
                    <Label htmlFor="corretor_nome">Corretor</Label>
                    <Select onValueChange={(value) => setFormData(prev => ({ ...prev, corretor_nome: value }))}>
                      <SelectTrigger>
                        <SelectValue placeholder="Selecione o corretor" />
                      </SelectTrigger>
                      <SelectContent>
                        {corretores.map((corretor) => (
                          <SelectItem key={corretor} value={corretor}>
                            {corretor}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                </div>
              </div>

              {/* Dados da Visita */}
              <div className="space-y-4">
                <h3 className="text-lg font-semibold text-slate-900 border-b border-slate-200 pb-2">
                  Dados da Visita
                </h3>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="empreendimento">Empreendimento de Interesse</Label>
                    <Select onValueChange={(value) => setFormData(prev => ({ ...prev, empreendimento: value }))}>
                      <SelectTrigger>
                        <SelectValue placeholder="Selecione o empreendimento" />
                      </SelectTrigger>
                      <SelectContent>
                        {empreendimentos.map((emp) => (
                          <SelectItem key={emp} value={emp}>
                            {emp}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  
                  <div className="space-y-2">
                    <Label htmlFor="loja">Loja</Label>
                    <Select onValueChange={(value) => setFormData(prev => ({ ...prev, loja: value }))}>
                      <SelectTrigger>
                        <SelectValue placeholder="Selecione a loja" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="Loja A">Loja A</SelectItem>
                        <SelectItem value="Loja B">Loja B</SelectItem>
                        <SelectItem value="Loja C">Loja C</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  
                  <div className="space-y-2">
                    <Label htmlFor="andar">Andar</Label>
                    <Select onValueChange={(value) => setFormData(prev => ({ ...prev, andar: value }))}>
                      <SelectTrigger>
                        <SelectValue placeholder="Selecione o andar" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="Térreo">Térreo</SelectItem>
                        <SelectItem value="1º Andar">1º Andar</SelectItem>
                        <SelectItem value="2º Andar">2º Andar</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  
                  <div className="space-y-2">
                    <Label htmlFor="mesa">Mesa *</Label>
                    <Select onValueChange={(value) => setFormData(prev => ({ ...prev, mesa: value }))}>
                      <SelectTrigger>
                        <SelectValue placeholder="Selecione a mesa" />
                      </SelectTrigger>
                      <SelectContent>
                        {Array.from({ length: 20 }, (_, i) => i + 1).map((mesa) => 
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
                >
                  Registrar Entrada
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
