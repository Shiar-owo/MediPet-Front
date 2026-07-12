import { useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { Layout } from '@/shared/components/layout/Layout';
import { Input, Select, DatePicker, TimeInput, Button } from '@/shared/components/ui';
import { useToast } from '@/shared/components/shared/Toast';
import { useAuth } from '@/shared/context/AuthContext';
import { appointmentService } from '../services/appointmentService';
import { clientService } from '@/features/clients/services/clientService';
import { petService } from '@/features/pets/services/petService';
import { userService } from '@/features/users/services/userService';
import { getApiErrorMessage } from '@/shared/lib/errors';

const appointmentSchema = z.object({
  date: z.string().min(1, 'La fecha es requerida'),
  startTime: z.string().min(1, 'La hora de inicio es requerida'),
  endTime: z.string().min(1, 'La hora de fin es requerida'),
  reason: z.string().optional(),
  petId: z.string().min(1, 'La mascota es requerida'),
  clientId: z.string().min(1, 'El cliente es requerido'),
  veterinarianId: z.string().min(1, 'El veterinario es requerido'),
});

type AppointmentFormData = z.infer<typeof appointmentSchema>;

export function AppointmentFormPage() {
  const { id } = useParams<{ id: string }>();
  const isEditing = Boolean(id);
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const toast = useToast();
  const { user } = useAuth();
  const isVet = user?.role === 'VETERINARIO';

  const { data: appointmentData, isLoading: loadingAppointment } = useQuery({
    queryKey: ['appointment', id],
    queryFn: () => appointmentService.getById(id!),
    enabled: isEditing,
  });

  const { data: clientsData } = useQuery({
    queryKey: ['clients', 'all'],
    queryFn: () => clientService.getAll({ page: 0, size: 100 }),
  });

  const { data: vetsData } = useQuery({
    queryKey: ['users', 'vets'],
    queryFn: () => userService.getVeterinarians({ page: 0, size: 100 }),
    enabled: !isVet,
  });

  const {
    register,
    handleSubmit,
    reset,
    watch,
    formState: { errors, isSubmitting },
  } = useForm<AppointmentFormData>({
    resolver: zodResolver(appointmentSchema),
    defaultValues: {
      clientId: '',
      petId: '',
      veterinarianId: isVet ? user?.id : '',
    },
  });

  const selectedClientId = watch('clientId');

  const { data: petsData } = useQuery({
    queryKey: ['pets', 'client', selectedClientId],
    queryFn: () => petService.getByClientId(selectedClientId, { page: 0, size: 100 }),
    enabled: Boolean(selectedClientId),
  });

  useEffect(() => {
    if (appointmentData?.data) {
      reset({
        date: appointmentData.data.date,
        startTime: appointmentData.data.startTime,
        endTime: appointmentData.data.endTime,
        reason: appointmentData.data.reason || '',
        petId: appointmentData.data.petId,
        clientId: appointmentData.data.clientId,
        veterinarianId: appointmentData.data.veterinarianId,
      });
    }
  }, [appointmentData, reset]);

  const createMutation = useMutation({
    mutationFn: appointmentService.create,
    onSuccess: () => {
      toast.success('Turno creado', 'El turno se programó correctamente.');
      queryClient.invalidateQueries({ queryKey: ['appointments'] });
      navigate('/appointments');
    },
    onError: (error) => {
      const { title, message } = getApiErrorMessage(error, 'Turno');
      toast.error(title, message);
    },
  });

  const updateMutation = useMutation({
    mutationFn: (data: AppointmentFormData) => appointmentService.update(id!, data),
    onSuccess: () => {
      toast.success('Turno actualizado', 'Los datos se guardaron correctamente.');
      queryClient.invalidateQueries({ queryKey: ['appointments'] });
      queryClient.invalidateQueries({ queryKey: ['appointment', id] });
      navigate('/appointments');
    },
    onError: (error) => {
      const { title, message } = getApiErrorMessage(error, 'Turno');
      toast.error(title, message);
    },
  });

  const onSubmit = (data: AppointmentFormData) => {
    const payload = isVet ? { ...data, veterinarianId: user!.id } : data;
    if (isEditing) {
      updateMutation.mutate(payload);
    } else {
      createMutation.mutate(payload);
    }
  };

  const isLoading = isSubmitting || createMutation.isPending || updateMutation.isPending;
  const clients = clientsData?.data?.content ?? [];
  const pets = petsData?.data?.content ?? [];
  const vets = (vetsData?.data?.content ?? []).filter((v) => v.active);

  const currentVet = isVet
    ? vetsData?.data?.content?.find((v) => v.id === user?.id)
    : null;

  return (
    <Layout>
      <div className="mx-auto max-w-2xl space-y-6">
        <div>
          <h1 className="text-2xl font-bold text-foreground">
            {isEditing ? 'Editar Turno' : 'Nuevo Turno'}
          </h1>
          <p className="text-muted-foreground">
            {isEditing ? 'Actualiza los datos del turno' : 'Programa un nuevo turno en el sistema'}
          </p>
        </div>

        {isEditing && loadingAppointment ? (
          <div className="py-12 text-center text-muted-foreground">Cargando...</div>
        ) : (
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-4 rounded-lg border bg-white p-6 shadow-sm">
            <DatePicker
              label="Fecha"
              error={errors.date?.message}
              {...register('date')}
            />
            <div className="grid gap-4 sm:grid-cols-2">
              <TimeInput
                label="Hora de inicio"
                error={errors.startTime?.message}
                {...register('startTime')}
              />
              <TimeInput
                label="Hora de fin"
                error={errors.endTime?.message}
                {...register('endTime')}
              />
            </div>
            <Select
              label="Cliente"
              placeholder="Seleccionar cliente"
              options={clients.map((c) => ({ value: c.id, label: c.name }))}
              error={errors.clientId?.message}
              {...register('clientId')}
            />
            <Select
              label="Mascota"
              placeholder={selectedClientId ? 'Seleccionar mascota' : 'Primero selecciona un cliente'}
              options={pets.map((p) => ({ value: p.id, label: p.name }))}
              error={errors.petId?.message}
              disabled={!selectedClientId}
              {...register('petId')}
            />
            {isVet ? (
              <Input
                label="Veterinario"
                value={currentVet ? `${currentVet.firstName} ${currentVet.lastName}` : user?.email || ''}
                disabled
              />
            ) : (
              <Select
                label="Veterinario"
                placeholder="Seleccionar veterinario"
                options={vets.map((v) => ({
                  value: v.id,
                  label: `${v.firstName} ${v.lastName}`,
                }))}
                error={errors.veterinarianId?.message}
                {...register('veterinarianId')}
              />
            )}
            <Input
              label="Motivo"
              placeholder="Consulta anual"
              error={errors.reason?.message}
              {...register('reason')}
            />
            <div className="flex justify-end gap-3 pt-4">
              <Button
                type="button"
                variant="outline"
                onClick={() => navigate('/appointments')}
              >
                Cancelar
              </Button>
              <Button type="submit" isLoading={isLoading}>
                {isEditing ? 'Guardar Cambios' : 'Crear Turno'}
              </Button>
            </div>
          </form>
        )}
      </div>
    </Layout>
  );
}
