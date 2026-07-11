import { useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { Layout } from '@/shared/components/layout/Layout';
import { Input, Button } from '@/shared/components/ui';
import { useToast } from '@/shared/components/shared/Toast';
import { clientService } from '../services/clientService';
import { getApiErrorMessage } from '@/shared/lib/errors';

const clientSchema = z.object({
  name: z.string().min(1, 'El nombre es requerido'),
  dni: z.string().min(1, 'El DNI es requerido'),
  phone: z.string().optional(),
  email: z.string().email('Email inválido').optional().or(z.literal('')),
  address: z.string().optional(),
});

type ClientFormData = z.infer<typeof clientSchema>;

export function ClientFormPage() {
  const { id } = useParams<{ id: string }>();
  const isEditing = Boolean(id);
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const toast = useToast();

  const { data: clientData, isLoading: loadingClient } = useQuery({
    queryKey: ['client', id],
    queryFn: () => clientService.getById(id!),
    enabled: isEditing,
  });

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors, isSubmitting },
  } = useForm<ClientFormData>({
    resolver: zodResolver(clientSchema),
  });

  useEffect(() => {
    if (clientData?.data) {
      reset({
        name: clientData.data.name,
        dni: clientData.data.dni,
        phone: clientData.data.phone || '',
        email: clientData.data.email || '',
        address: clientData.data.address || '',
      });
    }
  }, [clientData, reset]);

  const createMutation = useMutation({
    mutationFn: clientService.create,
    onSuccess: () => {
      toast.success('Cliente creado', 'El cliente se registró correctamente.');
      queryClient.invalidateQueries({ queryKey: ['clients'] });
      navigate('/clients');
    },
    onError: (error) => {
      const { title, message } = getApiErrorMessage(error, 'Cliente');
      toast.error(title, message);
    },
  });

  const updateMutation = useMutation({
    mutationFn: (data: ClientFormData) => clientService.update(id!, data),
    onSuccess: () => {
      toast.success('Cliente actualizado', 'Los datos se guardaron correctamente.');
      queryClient.invalidateQueries({ queryKey: ['clients'] });
      queryClient.invalidateQueries({ queryKey: ['client', id] });
      navigate('/clients');
    },
    onError: (error) => {
      const { title, message } = getApiErrorMessage(error, 'Cliente');
      toast.error(title, message);
    },
  });

  const onSubmit = (data: ClientFormData) => {
    if (isEditing) {
      updateMutation.mutate(data);
    } else {
      createMutation.mutate(data);
    }
  };

  const isLoading = isSubmitting || createMutation.isPending || updateMutation.isPending;

  return (
    <Layout>
      <div className="mx-auto max-w-2xl space-y-6">
        <div>
          <h1 className="text-2xl font-bold text-foreground">
            {isEditing ? 'Editar Cliente' : 'Nuevo Cliente'}
          </h1>
          <p className="text-muted-foreground">
            {isEditing ? 'Actualiza los datos del cliente' : 'Registra un nuevo cliente en el sistema'}
          </p>
        </div>

        {isEditing && loadingClient ? (
          <div className="py-12 text-center text-muted-foreground">Cargando...</div>
        ) : (
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-4 rounded-lg border bg-white p-6 shadow-sm">
            <Input
              label="Nombre completo"
              placeholder="María García"
              error={errors.name?.message}
              {...register('name')}
            />
            <Input
              label="DNI"
              placeholder="12345678"
              error={errors.dni?.message}
              {...register('dni')}
            />
            <Input
              label="Teléfono"
              placeholder="+54 9 11 5555 1234"
              error={errors.phone?.message}
              {...register('phone')}
            />
            <Input
              label="Email"
              type="email"
              placeholder="maria@ejemplo.com"
              error={errors.email?.message}
              {...register('email')}
            />
            <Input
              label="Dirección"
              placeholder="Av. Corrientes 1234"
              error={errors.address?.message}
              {...register('address')}
            />
            <div className="flex justify-end gap-3 pt-4">
              <Button
                type="button"
                variant="outline"
                onClick={() => navigate('/clients')}
              >
                Cancelar
              </Button>
              <Button type="submit" isLoading={isLoading}>
                {isEditing ? 'Guardar Cambios' : 'Crear Cliente'}
              </Button>
            </div>
          </form>
        )}
      </div>
    </Layout>
  );
}
