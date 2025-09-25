import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useCpfValidation } from '@/hooks/useCpfValidation';
import { supabase } from '@/integrations/supabase/client';
import { PersonaForm } from '@/components/persona/PersonaForm';
import { toast } from '@/hooks/use-toast';

export default function Persona() {
  const [step, setStep] = useState<'cpf' | 'form' | 'success'>('cpf');
  const [cpf, setCpf] = useState('');
  const [userData, setUserData] = useState<any>(null);
  const [error, setError] = useState<string>('');
  const [isLoading, setIsLoading] = useState(false);
  
  const { formatCpf, isValidating } = useCpfValidation();

  const handleCpfSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError('');

    try {
      const cleanCpf = cpf.replace(/[.-]/g, '');
      
      // Check if user exists
      const { data: user, error: userError } = await supabase
        .from('users')
        .select('id, name, cpf, apelido')
        .eq('cpf', cleanCpf)
        .single();

      if (userError || !user) {
        setError('Usuário não é um corretor cadastrado.');
        setIsLoading(false);
        return;
      }

      // Check if already responded
      const { data: existingResponse, error: responseError } = await supabase
        .from('persona_respostas')
        .select('id')
        .eq('cpf', cleanCpf)
        .single();

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
      const { error } = await supabase
        .from('persona_respostas')
        .insert({
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

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <div className="bg-primary p-4">
        <div className="max-w-4xl mx-auto">
          <img 
            src="/lovable-uploads/c1c1d076-9abb-4f71-b95c-abfbb74f4d43.png" 
            alt="Metrocasa" 
            className="h-12 mx-auto"
          />
        </div>
      </div>

      {/* Content */}
      <div className="max-w-4xl mx-auto p-6">
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-foreground mb-2">
            Questionário de Persona Metrocasa
          </h1>
          <p className="text-muted-foreground">
            Ajude-nos a conhecer melhor nossos corretores
          </p>
        </div>

        {step === 'cpf' && (
          <div className="max-w-md mx-auto">
            <form onSubmit={handleCpfSubmit} className="space-y-4">
              <div>
                <Label htmlFor="cpf">CPF do Corretor</Label>
                <Input
                  id="cpf"
                  type="text"
                  value={cpf}
                  onChange={(e) => setCpf(formatCpf(e.target.value))}
                  placeholder="000.000.000-00"
                  maxLength={14}
                  required
                />
              </div>
              
              {error && (
                <div className={`p-3 rounded-md text-sm ${
                  error.includes('cadastrado') 
                    ? 'bg-destructive/10 text-destructive border border-destructive/20' 
                    : 'bg-blue-50 text-blue-700 border border-blue-200'
                }`}>
                  {error}
                </div>
              )}
              
              <Button 
                type="submit" 
                className="w-full"
                disabled={isLoading || isValidating || cpf.length < 14}
              >
                {isLoading ? 'Validando...' : 'Continuar'}
              </Button>
            </form>
          </div>
        )}

        {step === 'form' && userData && (
          <PersonaForm 
            userData={userData} 
            onSubmit={handleFormSubmit}
          />
        )}

        {step === 'success' && (
          <div className="max-w-md mx-auto text-center">
            <div className="bg-green-50 text-green-700 border border-green-200 p-6 rounded-md">
              <h2 className="text-xl font-semibold mb-2">Obrigado!</h2>
              <p>Suas respostas foram registradas com sucesso.</p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}