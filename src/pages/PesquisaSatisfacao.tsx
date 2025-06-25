
import React, { useState } from 'react';
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { AutoSuggest } from "@/components/AutoSuggest";
import { supabase } from "@/integrations/supabase/client";
import { useCpfValidation } from "@/hooks/useCpfValidation";
import { useToast } from "@/hooks/use-toast";
import { useQuery } from "@tanstack/react-query";

interface Empreendimento {
  id: string;
  nome: string;
}

interface ClienteInfo {
  nome: string;
  corretor_nome?: string;
}

const PesquisaSatisfacao = () => {
  const { toast } = useToast();
  const { formatCpf } = useCpfValidation();
  
  // Estados do formulário
  const [step, setStep] = useState(1);
  const [loading, setLoading] = useState(false);
  const [codigoValidacao, setCodigoValidacao] = useState('');
  
  // Dados básicos
  const [nomeCompleto, setNomeCompleto] = useState('');
  const [cpf, setCpf] = useState('');
  const [email, setEmail] = useState('');
  
  // Dados do cliente encontrado
  const [clienteInfo, setClienteInfo] = useState<ClienteInfo | null>(null);
  
  // Dados da pesquisa
  const [corretorNome, setCorretorNome] = useState('');
  const [ondeConheceu, setOndeConheceu] = useState('');
  const [empreendimentoInteresse, setEmpreendimentoInteresse] = useState('');
  const [comprouEmpreendimento, setComprouEmpreendimento] = useState('');
  const [empreendimentoAdquirido, setEmpreendimentoAdquirido] = useState('');
  const [notaConsultor, setNotaConsultor] = useState('');
  const [avaliacaoExperiencia, setAvaliacaoExperiencia] = useState('');
  const [dicasSugestoes, setDicasSugestoes] = useState('');

  // Buscar empreendimentos
  const { data: empreendimentos = [] } = useQuery({
    queryKey: ['empreendimentos'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('empreendimentos')
        .select('id, nome')
        .order('nome');
      
      if (error) throw error;
      return data as Empreendimento[];
    }
  });

  const handleCpfChange = (value: string) => {
    setCpf(formatCpf(value));
  };

  const buscarDadosCliente = async () => {
    if (!nomeCompleto || !cpf || !email) {
      toast({
        title: "Campos obrigatórios",
        description: "Por favor, preencha todos os campos básicos.",
        variant: "destructive"
      });
      return;
    }

    setLoading(true);
    
    try {
      const cpfLimpo = cpf.replace(/[.-]/g, '');
      
      // Buscar nas visitas
      const { data: visitasData, error: visitasError } = await supabase
        .from('visits')
        .select('cliente_nome, corretor_nome')
        .eq('cliente_cpf', cpfLimpo)
        .order('created_at', { ascending: false })
        .limit(1);

      if (visitasError) throw visitasError;

      let corretor = '';
      let nomeEncontrado = '';

      if (visitasData && visitasData.length > 0) {
        nomeEncontrado = visitasData[0].cliente_nome;
        corretor = visitasData[0].corretor_nome;
      } else {
        // Buscar na lista de espera se não encontrou nas visitas
        const { data: listaEsperaData, error: listaEsperaError } = await supabase
          .from('lista_espera')
          .select('cliente_nome, corretor_nome')
          .eq('cliente_cpf', cpfLimpo)
          .order('created_at', { ascending: false })
          .limit(1);

        if (listaEsperaError) throw listaEsperaError;

        if (listaEsperaData && listaEsperaData.length > 0) {
          nomeEncontrado = listaEsperaData[0].cliente_nome;
          corretor = listaEsperaData[0].corretor_nome || '';
        }
      }

      setClienteInfo({ nome: nomeEncontrado, corretor_nome: corretor });
      setCorretorNome(corretor);
      setStep(2);

    } catch (error) {
      console.error('Erro ao buscar dados do cliente:', error);
      toast({
        title: "Erro",
        description: "Erro ao buscar dados. Você pode continuar com a pesquisa.",
        variant: "destructive"
      });
      setStep(2);
    } finally {
      setLoading(false);
    }
  };

  const gerarCodigoValidacao = () => {
    return Math.floor(1000 + Math.random() * 9000).toString();
  };

  const handleSubmitPesquisa = async () => {
    setLoading(true);
    
    try {
      const codigo = gerarCodigoValidacao();
      
      const { error } = await supabase
        .from('pesquisas_satisfacao')
        .insert({
          nome_completo: nomeCompleto,
          cpf: cpf.replace(/[.-]/g, ''),
          email,
          corretor_nome: corretorNome,
          onde_conheceu: ondeConheceu,
          empreendimento_interesse: empreendimentoInteresse,
          comprou_empreendimento: comprouEmpreendimento === 'sim',
          empreendimento_adquirido: comprouEmpreendimento === 'sim' ? empreendimentoAdquirido : null,
          nota_consultor: notaConsultor ? parseInt(notaConsultor) : null,
          avaliacao_experiencia: avaliacaoExperiencia,
          dicas_sugestoes: dicasSugestoes,
          codigo_validacao: codigo
        });

      if (error) throw error;

      setCodigoValidacao(codigo);
      setStep(3);
      
      toast({
        title: "Pesquisa enviada!",
        description: "Obrigado pela sua participação!"
      });

    } catch (error) {
      console.error('Erro ao salvar pesquisa:', error);
      toast({
        title: "Erro",
        description: "Erro ao enviar pesquisa. Tente novamente.",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  if (step === 3) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
        <Card className="w-full max-w-md">
          <CardHeader className="text-center">
            <CardTitle className="text-2xl text-green-600">Pesquisa Concluída!</CardTitle>
          </CardHeader>
          <CardContent className="text-center space-y-4">
            <p>Obrigado por participar da nossa pesquisa de satisfação!</p>
            <div className="bg-blue-50 p-4 rounded-lg">
              <p className="text-sm text-gray-600 mb-2">Seu código de validação:</p>
              <p className="text-3xl font-bold text-blue-600">{codigoValidacao}</p>
            </div>
            <p className="text-sm text-gray-500">
              Guarde este código, ele poderá ser usado para retirar seu brinde!
            </p>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 p-4">
      <div className="max-w-2xl mx-auto">
        <Card>
          <CardHeader>
            <CardTitle className="text-2xl text-center">
              {step === 1 ? 'Pesquisa de Satisfação - Dados Básicos' : 'Pesquisa de Satisfação'}
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-6">
            {step === 1 && (
              <>
                <div className="space-y-2">
                  <Label htmlFor="nome">Nome Completo *</Label>
                  <Input
                    id="nome"
                    value={nomeCompleto}
                    onChange={(e) => setNomeCompleto(e.target.value)}
                    placeholder="Digite seu nome completo"
                    required
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="cpf">CPF *</Label>
                  <Input
                    id="cpf"
                    value={cpf}
                    onChange={(e) => handleCpfChange(e.target.value)}
                    placeholder="000.000.000-00"
                    maxLength={14}
                    required
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="email">E-mail *</Label>
                  <Input
                    id="email"
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="seuemail@exemplo.com"
                    required
                  />
                </div>

                <Button 
                  onClick={buscarDadosCliente} 
                  disabled={loading}
                  className="w-full"
                >
                  {loading ? "Buscando..." : "Continuar"}
                </Button>
              </>
            )}

            {step === 2 && (
              <>
                {clienteInfo?.nome && (
                  <div className="bg-green-50 p-4 rounded-lg">
                    <p className="text-sm text-green-700">
                      Encontramos seus dados! Nome: <strong>{clienteInfo.nome}</strong>
                    </p>
                  </div>
                )}

                <div className="space-y-2">
                  <Label htmlFor="corretor">Corretor</Label>
                  <Input
                    id="corretor"
                    value={corretorNome}
                    readOnly
                    className="bg-gray-100"
                    placeholder="Não informado"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="onde_conheceu">Onde conheceu a Construtora Metrocasa?</Label>
                  <Input
                    id="onde_conheceu"
                    value={ondeConheceu}
                    onChange={(e) => setOndeConheceu(e.target.value)}
                    placeholder="Ex: redes sociais, indicação, etc."
                  />
                </div>

                <AutoSuggest
                  label="Qual empreendimento/bairro de interesse?"
                  placeholder="Digite para buscar empreendimentos"
                  options={empreendimentos.map(emp => ({ id: emp.id, name: emp.nome }))}
                  value={empreendimentoInteresse}
                  onValueChange={setEmpreendimentoInteresse}
                />

                <div className="space-y-3">
                  <Label>Você comprou algum empreendimento conosco?</Label>
                  <RadioGroup value={comprouEmpreendimento} onValueChange={setComprouEmpreendimento}>
                    <div className="flex items-center space-x-2">
                      <RadioGroupItem value="sim" id="comprou_sim" />
                      <Label htmlFor="comprou_sim">Sim</Label>
                    </div>
                    <div className="flex items-center space-x-2">
                      <RadioGroupItem value="nao" id="comprou_nao" />
                      <Label htmlFor="comprou_nao">Não</Label>
                    </div>
                  </RadioGroup>
                </div>

                {comprouEmpreendimento === 'sim' && (
                  <AutoSuggest
                    label="Qual empreendimento você adquiriu conosco?"
                    placeholder="Digite para buscar empreendimentos"
                    options={empreendimentos.map(emp => ({ id: emp.id, name: emp.nome }))}
                    value={empreendimentoAdquirido}
                    onValueChange={setEmpreendimentoAdquirido}
                  />
                )}

                <div className="space-y-2">
                  <Label htmlFor="nota">De 0 a 10, qual a nota para o consultor que te atendeu?</Label>
                  <Input
                    id="nota"
                    type="number"
                    min="0"
                    max="10"
                    value={notaConsultor}
                    onChange={(e) => setNotaConsultor(e.target.value)}
                    placeholder="Digite uma nota de 0 a 10"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="experiencia">Como você avalia sua experiência aqui em nossa sede?</Label>
                  <Textarea
                    id="experiencia"
                    value={avaliacaoExperiencia}
                    onChange={(e) => setAvaliacaoExperiencia(e.target.value)}
                    placeholder="Conte-nos sobre sua experiência..."
                    rows={3}
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="sugestoes">Alguma dica ou sugestão que podemos adotar para melhorar a sua experiência?</Label>
                  <Textarea
                    id="sugestoes"
                    value={dicasSugestoes}
                    onChange={(e) => setDicasSugestoes(e.target.value)}
                    placeholder="Suas sugestões são muito importantes para nós..."
                    rows={3}
                  />
                </div>

                <div className="flex gap-4">
                  <Button 
                    variant="outline" 
                    onClick={() => setStep(1)}
                    className="flex-1"
                  >
                    Voltar
                  </Button>
                  <Button 
                    onClick={handleSubmitPesquisa} 
                    disabled={loading}
                    className="flex-1"
                  >
                    {loading ? "Enviando..." : "Enviar Pesquisa"}
                  </Button>
                </div>
              </>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default PesquisaSatisfacao;
