
import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { useAuth } from '@/contexts/AuthContext';
import { useToast } from '@/hooks/use-toast';
import { useCpfValidation } from '@/hooks/useCpfValidation';
import { CheckCircle, XCircle } from 'lucide-react';

export default function Auth() {
  const [isLogin, setIsLogin] = useState(true);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [cpf, setCpf] = useState('');
  const [cpfValid, setCpfValid] = useState<boolean | null>(null);
  const [loading, setLoading] = useState(false);
  const { signIn, signUp, user, loading: authLoading } = useAuth();
  const { toast } = useToast();
  const navigate = useNavigate();
  const { validateCpf, formatCpf, isValidating } = useCpfValidation();

  // Navega quando realmente autenticado e contexto finalizou
  useEffect(() => {
    if (!authLoading && user) {
      navigate('/');
    }
  }, [authLoading, user, navigate]);
  const handleCpfChange = async (value: string) => {
    const formattedCpf = formatCpf(value);
    setCpf(formattedCpf);
    
    // Se tem 14 caracteres (XXX.XXX.XXX-XX), validar
    if (formattedCpf.length === 14) {
      const result = await validateCpf(formattedCpf);
      setCpfValid(result.isValid);
    } else {
      setCpfValid(null);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!isLogin && cpfValid !== true) {
      toast({
        title: "Erro",
        description: "Por favor, insira um CPF válido cadastrado no sistema.",
        variant: "destructive"
      });
      return;
    }
    
    setLoading(true);

    try {
      let result;
      if (isLogin) {
        result = await signIn(email, password);
      } else {
        result = await signUp(email, password, cpf);
      }

      if (result.error) {
        toast({
          title: "Erro",
          description: result.error.message,
          variant: "destructive"
        });
      } else {
        if (isLogin) {
          // Navegação será realizada automaticamente quando a sessão estiver pronta
        } else {
          toast({
            title: "Cadastro realizado",
            description: "Verifique seu email para confirmar a conta."
          });
          setIsLogin(true);
        }
      }
    } catch (error) {
      toast({
        title: "Erro",
        description: "Ocorreu um erro inesperado",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-slate-50 to-blue-50 p-4">
      <Card className="w-full max-w-md">
        <CardHeader className="text-center">
          <div className="mx-auto w-16 h-16 bg-gradient-to-r from-blue-600 to-blue-700 rounded-lg flex items-center justify-center mb-4">
            <span className="text-white text-2xl">🛎️</span>
          </div>
          <CardTitle className="text-2xl">Front Desk</CardTitle>
          <CardDescription>
            {isLogin ? 'Entre na sua conta' : 'Crie sua conta'}
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="email">Email</Label>
              <Input
                id="email"
                type="email"
                placeholder="seu@email.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
              />
            </div>
            
            {!isLogin && (
              <div className="space-y-2">
                <Label htmlFor="cpf">CPF</Label>
                <div className="relative">
                  <Input
                    id="cpf"
                    type="text"
                    placeholder="000.000.000-00"
                    value={cpf}
                    onChange={(e) => handleCpfChange(e.target.value)}
                    maxLength={14}
                    required
                    className={
                      cpf.length === 14 
                        ? cpfValid === true 
                          ? 'border-green-500 pr-10' 
                          : cpfValid === false 
                          ? 'border-red-500 pr-10' 
                          : 'pr-10'
                        : ''
                    }
                  />
                  {cpf.length === 14 && !isValidating && (
                    <div className="absolute right-3 top-1/2 transform -translate-y-1/2">
                      {cpfValid === true ? (
                        <CheckCircle className="h-5 w-5 text-green-500" />
                      ) : (
                        <XCircle className="h-5 w-5 text-red-500" />
                      )}
                    </div>
                  )}
                </div>
                {cpf.length === 14 && cpfValid === false && (
                  <p className="text-sm text-red-600">
                    CPF não encontrado no sistema. Entre em contato com o administrador.
                  </p>
                )}
                {cpf.length === 14 && cpfValid === true && (
                  <p className="text-sm text-green-600">
                    CPF válido e autorizado para cadastro.
                  </p>
                )}
              </div>
            )}
            
            <div className="space-y-2">
              <Label htmlFor="password">Senha</Label>
              <Input
                id="password"
                type="password"
                placeholder="********"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
              />
            </div>
            
            <Button 
              type="submit" 
              className="w-full" 
              disabled={loading || (!isLogin && cpfValid !== true)}
            >
              {loading ? 'Processando...' : (isLogin ? 'Entrar' : 'Cadastrar')}
            </Button>
          </form>
          
          <div className="mt-4 text-center">
            <button
              type="button"
              onClick={() => {
                setIsLogin(!isLogin);
                setCpf('');
                setCpfValid(null);
              }}
              className="text-sm text-blue-600 hover:underline"
            >
              {isLogin ? 'Não tem uma conta? Cadastre-se' : 'Já tem uma conta? Entre'}
            </button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
