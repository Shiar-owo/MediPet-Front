import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Eye, EyeOff } from 'lucide-react';
import { AuthLayout } from '@/shared/components/layout/AuthLayout';
import { Input, Button } from '@/shared/components/ui';
import { useToast } from '@/shared/components/shared/Toast';
import { useAuthStore } from '../store/useAuthStore';
import { authService } from '../services/authService';
import { getApiErrorMessage } from '@/shared/lib/errors';

const loginSchema = z.object({
  email: z.string().email('Email inválido'),
  password: z.string().min(1, 'La contraseña es requerida'),
});

type LoginFormData = z.infer<typeof loginSchema>;

export function LoginPage() {
  const [error, setError] = useState<string | null>(null);
  const [showPassword, setShowPassword] = useState(false);
  const navigate = useNavigate();
  const login = useAuthStore((state) => state.login);
  const toast = useToast();

  useEffect(() => {
    if (localStorage.getItem('sessionExpired') === 'true') {
      localStorage.removeItem('sessionExpired');
      toast.warning('Sesión expirada', 'Tu sesión ha expirado. Por favor, inicia sesión de nuevo.');
    }
  }, [toast]);

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<LoginFormData>({
    resolver: zodResolver(loginSchema),
  });

  const onSubmit = async (data: LoginFormData) => {
    setError(null);
    try {
      const response = await authService.login(data);
      if (response.success) {
        const { userId, email, role, accessToken, refreshToken } = response.data;
        login(userId, email, role, accessToken, refreshToken);
        navigate('/dashboard');
      } else {
        setError(response.error?.message || 'Error al iniciar sesión');
      }
    } catch (err) {
      const { message } = getApiErrorMessage(err, 'Login');
      setError(message);
    }
  };

  return (
    <AuthLayout title="Inicia sesión en tu cuenta">
      <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
        {error && (
          <div className="rounded-lg bg-destructive/10 p-3 text-sm text-destructive">
            {error}
          </div>
        )}
        <Input
          label="Email"
          type="email"
          placeholder="admin@medipet.com"
          error={errors.email?.message}
          {...register('email')}
        />
        <Input
          label="Contraseña"
          type={showPassword ? 'text' : 'password'}
          placeholder="••••••••"
          error={errors.password?.message}
          endIcon={
            <button
              type="button"
              onClick={() => setShowPassword(!showPassword)}
              className="hover:text-foreground"
            >
              {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
            </button>
          }
          {...register('password')}
        />
        <Button type="submit" className="w-full" isLoading={isSubmitting}>
          Iniciar sesión
        </Button>
      </form>
    </AuthLayout>
  );
}
