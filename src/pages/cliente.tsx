
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { UserCheck, Building2, Phone } from "lucide-react";
import { useState, useEffect } from "react";
import { useToast } from "@/hooks/use-toast";
import { useSearchParams } from "react-router-dom";

const Cliente = () => {
  const { toast } = useToast();
  const [searchParams] = useSearchParams();
  const [corretorNome, setCorretorNome] = useState("");
  const [formData, setFormData] = useState({
    nome: "",
    cpf: "",
    whatsapp: "",
    empreendimento: "",
  });

  const empreendimentos = [
    "Residencial Park View",
    "Condomínio Jardins",
    "Torres do Atlântico",
    "Villa Sunset",
    "Golden Tower"
  ];

  useEffect(() => {
    // Pegar o nome do corretor da URL
    const corretor = searchParams.get('corretor');
    if (corretor) {
      setCorretorNome(decodeURIComponent(corretor));
    }
  }, [searchParams]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.nome || !formData.cpf || !formData.whatsapp) {
      toast({
        title: "Campos obrigatórios",
        description: "Por favor, preencha todos os campos obrigatórios.",
        variant: "destructive",
      });
      return;
    }

    // Simular envio bem-sucedido já que não temos mais tabela de agendamentos
    toast({
      title: "Dados enviados!",
      description: "Seus dados foram enviados com sucesso. Aguarde o contato da nossa equipe.",
    });

    // Limpar formulário
    setFormData({
      nome: "",
      cpf: "",
      whatsapp: "",
      empreendimento: "",
    });
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        {/* Header */}
        <div className="text-center mb-8">
          <div className="w-16 h-16 bg-blue-600 rounded-2xl flex items-center justify-center mx-auto mb-4">
            <span className="text-white text-2xl">🛎️</span>
          </div>
          <h1 className="text-2xl font-bold text-slate-900 mb-2">
            Confirme sua Visita
          </h1>
          {corretorNome && (
            <p className="text-slate-600">
              Indicação de <strong>{corretorNome}</strong>
            </p>
          )}
        </div>

        <Card className="shadow-xl border-0">
          <CardHeader className="text-center pb-4">
            <CardTitle className="flex items-center justify-center gap-2 text-slate-900">
              <UserCheck className="h-5 w-5" />
              Seus Dados
            </CardTitle>
          </CardHeader>
          
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="nome" className="text-slate-700">
                  Nome Completo *
                </Label>
                <Input
                  id="nome"
                  placeholder="Digite seu nome completo"
                  value={formData.nome}
                  onChange={(e) => setFormData(prev => ({ ...prev, nome: e.target.value }))}
                  required
                  className="h-12"
                />
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="cpf" className="text-slate-700">
                  CPF *
                </Label>
                <Input
                  id="cpf"
                  placeholder="000.000.000-00"
                  value={formData.cpf}
                  onChange={(e) => setFormData(prev => ({ ...prev, cpf: e.target.value }))}
                  required
                  className="h-12"
                />
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="whatsapp" className="text-slate-700">
                  WhatsApp *
                </Label>
                <div className="relative">
                  <Phone className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-slate-400" />
                  <Input
                    id="whatsapp"
                    placeholder="(00) 00000-0000"
                    value={formData.whatsapp}
                    onChange={(e) => setFormData(prev => ({ ...prev, whatsapp: e.target.value }))}
                    required
                    className="h-12 pl-10"
                  />
                </div>
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="empreendimento" className="text-slate-700">
                  Empreendimento de Interesse
                </Label>
                <Select onValueChange={(value) => setFormData(prev => ({ ...prev, empreendimento: value }))}>
                  <SelectTrigger className="h-12">
                    <div className="flex items-center gap-2">
                      <Building2 className="h-4 w-4 text-slate-400" />
                      <SelectValue placeholder="Selecione um empreendimento" />
                    </div>
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

              {corretorNome && (
                <div className="bg-blue-50 p-4 rounded-lg border border-blue-200">
                  <div className="flex items-center gap-2 text-blue-800">
                    <UserCheck className="h-4 w-4" />
                    <span className="text-sm font-medium">
                      Corretor: {corretorNome}
                    </span>
                  </div>
                </div>
              )}
              
              <Button 
                type="submit" 
                className="w-full h-12 bg-blue-600 hover:bg-blue-700 text-lg font-semibold"
              >
                Confirmar Visita
              </Button>
              
              <p className="text-xs text-slate-500 text-center">
                Ao confirmar, você autoriza o contato via WhatsApp para agendamento da visita.
              </p>
            </form>
          </CardContent>
        </Card>

        <div className="text-center mt-6">
          <p className="text-sm text-slate-500">
            © 2024 Front Desk System
          </p>
        </div>
      </div>
    </div>
  );
};

export default Cliente;
