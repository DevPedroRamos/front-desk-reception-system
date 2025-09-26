import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useCpfValidation } from '@/hooks/useCpfValidation';
import { supabase } from '@/integrations/supabase/client';
import { PersonaForm } from '@/components/persona/PersonaForm';
import { HeroSection } from '@/components/persona/HeroSection';
import { Footer } from '@/components/persona/Footer';
import { toast } from '@/hooks/use-toast';
import { User, MessageCircle, CheckCircle } from 'lucide-react';
export default function Persona() {
  const [step, setStep] = useState<'cpf' | 'form' | 'success'>('cpf');
  const [cpf, setCpf] = useState('');
  const [userData, setUserData] = useState<any>(null);
  const [error, setError] = useState<string>('');
  const [isLoading, setIsLoading] = useState(false);
  const {
    formatCpf,
    isValidating
  } = useCpfValidation();
  const handleCpfSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError('');
    try {
      const cleanCpf = cpf.replace(/[.-]/g, '');

      // Check if user exists
      const {
        data: user,
        error: userError
      } = await supabase.from('users').select('id, name, cpf, apelido').eq('cpf', cleanCpf).single();
      if (userError || !user) {
        setError('Usuário não é um corretor cadastrado.');
        setIsLoading(false);
        return;
      }

      // Check if already responded
      const {
        data: existingResponse,
        error: responseError
      } = await supabase.from('persona_respostas').select('id').eq('cpf', cleanCpf).single();
      if (existingResponse) {
        setError('Você já respondeu o questionário. Só é permitido uma vez por corretor.');
        setIsLoading(false);
        return;
      }
      setUserData(user);
      setStep('form');
    } catch (error) {
      console.error('Error validating CPF:', error);
      setError('Erro ao validar CPF. Tente novamente.');
    } finally {
      setIsLoading(false);
    }
  };
  const handleFormSubmit = async (respostas: any) => {
    try {
      const {
        error
      } = await supabase.from('persona_respostas').insert({
        cpf: cpf.replace(/[.-]/g, ''),
        respostas: respostas
      });
      if (error) {
        toast({
          title: "Erro",
          description: "Erro ao salvar respostas. Tente novamente.",
          variant: "destructive"
        });
        return;
      }
      setStep('success');
    } catch (error) {
      console.error('Error submitting form:', error);
      toast({
        title: "Erro",
        description: "Erro ao enviar questionário. Tente novamente.",
        variant: "destructive"
      });
    }
  };
  return <div className="min-h-screen bg-background flex flex-col">
      {/* Header */}
      <header className="bg-metrocasa-red py-4 px-6 shadow-lg">
        <div className="max-w-4xl mx-auto flex items-center justify-between">
          <img src="/lovable-uploads/vc-perto-branco.png" alt="VC Perto" className="h-10 md:h-12" />
          
        </div>
      </header>

      {/* Content */}
      <main className="flex-1">
        {step === 'cpf' && <>
            <HeroSection />
            <div className="py-16 px-6">
              <div className="max-w-lg mx-auto">
                <div className="bg-card rounded-lg shadow-lg overflow-hidden">
                  <div className="bg-metrocasa-red p-6 text-center">
                    <div className="w-16 h-16 bg-white/20 rounded-full flex items-center justify-center mx-auto mb-4">
                      <User className="w-8 h-8 text-white" />
                    </div>
                    <h2 className="text-2xl font-bold text-white mb-2">
                      Identificação
                    </h2>
                    <p className="text-white/90">
                      Digite seu CPF para começar
                    </p>
                  </div>
                  
                  <form onSubmit={handleCpfSubmit} className="p-6 space-y-6">
                    <div>
                      <Label htmlFor="cpf" className="text-base font-medium">
                        CPF do Corretor
                      </Label>
                      <Input id="cpf" type="text" value={cpf} onChange={e => setCpf(formatCpf(e.target.value))} placeholder="000.000.000-00" maxLength={14} required className="mt-2 h-12 text-lg" />
                    </div>
                    
                    {error && <div className={`p-4 rounded-lg text-sm ${error.includes('cadastrado') ? 'bg-destructive/10 text-destructive border border-destructive/20' : 'bg-blue-50 text-blue-700 border border-blue-200'}`}>
                        {error}
                      </div>}
                    
                    <Button type="submit" className="w-full h-12 text-lg bg-metrocasa-red hover:bg-metrocasa-red-dark" disabled={isLoading || isValidating || cpf.length < 14}>
                      {isLoading ? 'Validando...' : 'Continuar'}
                    </Button>
                  </form>
                </div>
              </div>
            </div>
          </>}

        {step === 'form' && userData && <div className="py-8">
            <PersonaForm userData={userData} onSubmit={handleFormSubmit} />
          </div>}

        {step === 'success' && <div className="py-16 px-6">
            <div className="max-w-lg mx-auto">
              <div className="bg-card rounded-lg shadow-lg overflow-hidden">
                <div className="bg-green-600 p-6 text-center">
                  <div className="w-16 h-16 bg-white/20 rounded-full flex items-center justify-center mx-auto mb-4">
                    <CheckCircle className="w-8 h-8 text-white" />
                  </div>
                  <h2 className="text-2xl font-bold text-white mb-2">
                    Questionário Concluído!
                  </h2>
                  <p className="text-white/90">
                    Obrigado pela sua participação
                  </p>
                </div>
                
                <div className="p-6 text-center">
                  <p className="text-muted-foreground mb-6">
                    Suas respostas foram registradas com sucesso. 
                    Em breve você receberá conteúdos personalizados 
                    baseados no seu perfil.
                  </p>
                  <Button onClick={() => window.location.href = '/'} className="bg-metrocasa-red hover:bg-metrocasa-red-dark">
                    Voltar ao Início
                  </Button>
                </div>
              </div>
            </div>
          </div>}
      </main>

      <Footer />
    </div>;
}