import { useEffect, useRef, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { Camera } from 'lucide-react';
import { Layout } from '@/shared/components/layout/Layout';
import { Input, Select, Button } from '@/shared/components/ui';
import { useToast } from '@/shared/components/shared/Toast';
import { userService } from '../services/userService';
import { getApiErrorMessage } from '@/shared/lib/errors';
import type { UserRole } from '@/shared/types';

const userSchema = z.object({
  email: z.string().email('Email inválido').optional(),
  password: z.string().min(6, 'La contraseña debe tener al menos 6 caracteres').optional().or(z.literal('')),
  firstName: z.string().optional(),
  lastName: z.string().optional(),
  phone: z.string().optional(),
  address: z.string().optional(),
  dateOfBirth: z.string().optional(),
  role: z.enum(['ADMIN', 'VETERINARIO', 'RECEPCIONISTA']).optional(),
});

type UserFormData = z.infer<typeof userSchema>;

export function UserFormPage() {
  const { id } = useParams<{ id: string }>();
  const isEditing = Boolean(id);
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const toast = useToast();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [avatarPreview, setAvatarPreview] = useState<string | null>(null);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);

  const { data: userData, isLoading: loadingUser } = useQuery({
    queryKey: ['user', id],
    queryFn: () => userService.getById(id!),
    enabled: isEditing,
  });

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors, isSubmitting },
  } = useForm<UserFormData>({
    resolver: zodResolver(userSchema),
  });

  useEffect(() => {
    if (userData?.data) {
      reset({
        email: userData.data.email,
        firstName: userData.data.firstName || '',
        lastName: userData.data.lastName || '',
        phone: userData.data.phone || '',
        address: userData.data.address || '',
        dateOfBirth: userData.data.dateOfBirth || '',
        role: userData.data.role,
      });
      if (userData.data.avatar) {
        setAvatarPreview(userData.data.avatar);
      }
    }
  }, [userData, reset]);

  const createMutation = useMutation({
    mutationFn: (data: UserFormData) =>
      userService.create({
        email: data.email!,
        password: data.password!,
        firstName: data.firstName,
        lastName: data.lastName,
        phone: data.phone,
        address: data.address,
        dateOfBirth: data.dateOfBirth || undefined,
        role: data.role as UserRole,
      }),
    onSuccess: () => {
      toast.success('Usuario creado', 'El usuario se registró correctamente.');
      queryClient.invalidateQueries({ queryKey: ['users'] });
      navigate('/users');
    },
    onError: (error) => {
      const { title, message } = getApiErrorMessage(error, 'Usuario');
      toast.error(title, message);
    },
  });

  const updateMutation = useMutation({
    mutationFn: (data: UserFormData) =>
      userService.update(id!, {
        firstName: data.firstName,
        lastName: data.lastName,
        phone: data.phone,
        address: data.address,
        role: data.role as UserRole,
      }),
    onSuccess: () => {
      if (selectedFile && id) {
        avatarMutation.mutate({ id, file: selectedFile });
      } else {
        toast.success('Usuario actualizado', 'Los datos se guardaron correctamente.');
        queryClient.invalidateQueries({ queryKey: ['users'] });
        queryClient.invalidateQueries({ queryKey: ['user', id] });
        navigate('/users');
      }
    },
    onError: (error) => {
      const { title, message } = getApiErrorMessage(error, 'Usuario');
      toast.error(title, message);
    },
  });

  const avatarMutation = useMutation({
    mutationFn: ({ id, file }: { id: string; file: File }) =>
      userService.uploadAvatar(id, file),
    onSuccess: () => {
      toast.success('Avatar actualizado', 'La foto de perfil se actualizó correctamente.');
      queryClient.invalidateQueries({ queryKey: ['users'] });
      queryClient.invalidateQueries({ queryKey: ['user', id] });
      navigate('/users');
    },
    onError: (error) => {
      const { title, message } = getApiErrorMessage(error, 'Avatar');
      toast.error(title, message);
      queryClient.invalidateQueries({ queryKey: ['users'] });
      queryClient.invalidateQueries({ queryKey: ['user', id] });
      navigate('/users');
    },
  });

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (file.size > 5 * 1024 * 1024) {
      toast.error('Archivo muy grande', 'El avatar debe ser menor a 5MB.');
      return;
    }

    setSelectedFile(file);
    const reader = new FileReader();
    reader.onloadend = () => setAvatarPreview(reader.result as string);
    reader.readAsDataURL(file);
  };

  const onSubmit = (data: UserFormData) => {
    if (isEditing) {
      updateMutation.mutate(data);
    } else {
      if (!data.email || !data.password) return;
      createMutation.mutate(data);
    }
  };

  const isLoading = isSubmitting || createMutation.isPending || updateMutation.isPending || avatarMutation.isPending;

  return (
    <Layout>
      <div className="mx-auto max-w-2xl space-y-6">
        <div>
          <h1 className="text-2xl font-bold text-foreground">
            {isEditing ? 'Editar Usuario' : 'Nuevo Usuario'}
          </h1>
          <p className="text-muted-foreground">
            {isEditing ? 'Actualiza los datos del usuario' : 'Registra un nuevo usuario en el sistema'}
          </p>
        </div>

        {isEditing && loadingUser ? (
          <div className="py-12 text-center text-muted-foreground">Cargando...</div>
        ) : (
          <>
            {isEditing && (
              <div className="rounded-lg border bg-white p-6 shadow-sm">
                <h2 className="mb-4 text-lg font-semibold text-foreground">Foto de perfil</h2>
                <div className="flex items-center gap-6">
                  <div
                    className="flex h-24 w-24 items-center justify-center overflow-hidden rounded-full border bg-muted"
                    onClick={() => fileInputRef.current?.click()}
                  >
                    {avatarPreview ? (
                      <img src={avatarPreview} alt="Avatar" className="h-full w-full object-cover" />
                    ) : (
                      <Camera size={32} className="text-muted-foreground" />
                    )}
                  </div>
                  <div>
                    <Button
                      type="button"
                      variant="outline"
                      size="sm"
                      onClick={() => fileInputRef.current?.click()}
                    >
                      <Camera size={16} className="mr-2" />
                      Cambiar foto
                    </Button>
                    <p className="mt-1 text-xs text-muted-foreground">
                      JPEG, PNG, GIF o WebP. Máximo 5MB.
                    </p>
                    <input
                      ref={fileInputRef}
                      type="file"
                      accept="image/jpeg,image/png,image/gif,image/webp"
                      className="hidden"
                      onChange={handleFileChange}
                    />
                  </div>
                </div>
              </div>
            )}

            <form onSubmit={handleSubmit(onSubmit)} className="space-y-4 rounded-lg border bg-white p-6 shadow-sm">
              {!isEditing && (
                <>
                  <Input
                    label="Email"
                    type="email"
                    placeholder="usuario@medipet.com"
                    error={errors.email?.message}
                    {...register('email')}
                  />
                  <Input
                    label="Contraseña"
                    type="password"
                    placeholder="••••••••"
                    error={errors.password?.message}
                    {...register('password')}
                  />
                </>
              )}
              <div className="grid gap-4 sm:grid-cols-2">
                <Input
                  label="Nombre"
                  placeholder="María"
                  error={errors.firstName?.message}
                  {...register('firstName')}
                />
                <Input
                  label="Apellido"
                  placeholder="García"
                  error={errors.lastName?.message}
                  {...register('lastName')}
                />
              </div>
              <Input
                label="Teléfono"
                placeholder="+54 9 11 5555 1234"
                error={errors.phone?.message}
                {...register('phone')}
              />
              <Input
                label="Dirección"
                placeholder="Av. Corrientes 1234"
                error={errors.address?.message}
                {...register('address')}
              />
              <Input
                label="Fecha de nacimiento"
                type="date"
                error={errors.dateOfBirth?.message}
                {...register('dateOfBirth')}
              />
              <Select
                label="Rol"
                placeholder="Seleccionar rol"
                options={[
                  { value: 'ADMIN', label: 'Administrador' },
                  { value: 'VETERINARIO', label: 'Veterinario' },
                  { value: 'RECEPCIONISTA', label: 'Recepcionista' },
                ]}
                error={errors.role?.message}
                {...register('role')}
              />
              <div className="flex justify-end gap-3 pt-4">
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => navigate('/users')}
                >
                  Cancelar
                </Button>
                <Button type="submit" isLoading={isLoading}>
                  {isEditing ? 'Guardar Cambios' : 'Crear Usuario'}
                </Button>
              </div>
            </form>
          </>
        )}
      </div>
    </Layout>
  );
}
