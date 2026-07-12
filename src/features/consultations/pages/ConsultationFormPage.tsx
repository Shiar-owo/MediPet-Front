import { useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { Layout } from '@/shared/components/layout/Layout';
import { Input, Button } from '@/shared/components/ui';
import { LoadingSpinner } from '@/shared/components/shared';
import { useToast } from '@/shared/components/shared/Toast';
import { appointmentService } from '@/features/appointments/services/appointmentService';
import { consultationService } from '../services/consultationService';
import { getApiErrorMessage } from '@/shared/lib/errors';

const consultationSchema = z.object({
  weight: z.string().optional().refine((val) => !val || (Number(val) > 0), 'El peso debe ser mayor a 0'),
  temperature: z.string().optional().refine((val) => !val || (Number(val) >= 35 && Number(val) <= 45), 'Temperatura entre 35°C y 45°C'),
  symptoms: z.string().optional(),
  diagnosis: z.string().optional(),
  treatment: z.string().optional(),
  notes: z.string().optional(),
});

type ConsultationFormData = z.infer<typeof consultationSchema>;

export function ConsultationFormPage() {
  const { appointmentId } = useParams<{ appointmentId: string }>();
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const toast = useToast();

  const { data: appointmentData, isLoading: loadingAppointment } = useQuery({
    queryKey: ['appointment', appointmentId],
    queryFn: () => appointmentService.getById(appointmentId!),
    enabled: Boolean(appointmentId),
  });

  const { data: existingConsultation } = useQuery({
    queryKey: ['consultation', 'appointment', appointmentId],
    queryFn: () => consultationService.getByAppointmentId(appointmentId!),
    enabled: Boolean(appointmentId),
  });

  const appointment = appointmentData?.data;

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<ConsultationFormData>({
    resolver: zodResolver(consultationSchema),
  });

  useEffect(() => {
    if (existingConsultation?.data) {
      toast.info('Consulta existente', 'Este turno ya tiene una consulta registrada.');
      navigate(`/appointments/${appointmentId}`);
    }
  }, [existingConsultation, navigate, appointmentId, toast]);

  const createMutation = useMutation({
    mutationFn: async (data: ConsultationFormData) => {
      await appointmentService.complete(appointmentId!);
      return consultationService.create({
        appointmentId: appointmentId!,
        petId: appointment!.petId,
        clientId: appointment!.clientId,
        veterinarianId: appointment!.veterinarianId,
        weight: data.weight ? Number(data.weight) : undefined,
        temperature: data.temperature ? Number(data.temperature) : undefined,
        symptoms: data.symptoms || undefined,
        diagnosis: data.diagnosis || undefined,
        treatment: data.treatment || undefined,
        notes: data.notes || undefined,
      });
    },
    onSuccess: () => {
      toast.success('Consulta creada', 'La consulta se registró y el turno se marcó como completado.');
      queryClient.invalidateQueries({ queryKey: ['appointment', appointmentId] });
      queryClient.invalidateQueries({ queryKey: ['appointments'] });
      queryClient.invalidateQueries({ queryKey: ['consultation', 'appointment', appointmentId] });
      navigate(`/appointments/${appointmentId}`);
    },
    onError: (error) => {
      const { title, message } = getApiErrorMessage(error, 'Consulta');
      toast.error(title, message);
    },
  });

  const onSubmit = (data: ConsultationFormData) => {
    if (!appointment) return;
    createMutation.mutate(data);
  };

  const isLoading = isSubmitting || loadingAppointment || createMutation.isPending;

  if (loadingAppointment) {
    return (
      <Layout>
        <LoadingSpinner className="py-12" />
      </Layout>
    );
  }

  if (!appointment) {
    return (
      <Layout>
        <div className="py-12 text-center text-muted-foreground">
          Turno no encontrado
        </div>
      </Layout>
    );
  }

  return (
    <Layout>
      <div className="mx-auto max-w-2xl space-y-6">
        <div>
          <h1 className="text-2xl font-bold text-foreground">Registrar Consulta</h1>
          <p className="text-muted-foreground">
            Turno de {appointment.petName} - {appointment.clientName}
          </p>
        </div>

        <div className="rounded-lg border bg-white p-6 shadow-sm">
          <h2 className="mb-4 text-lg font-semibold text-foreground">Datos de la consulta</h2>
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
            <div className="grid gap-4 sm:grid-cols-2">
              <Input
                label="Peso (kg)"
                type="number"
                step="0.1"
                placeholder="5.5"
                error={errors.weight?.message}
                {...register('weight')}
              />
              <Input
                label="Temperatura (°C)"
                type="number"
                step="0.1"
                placeholder="38.5"
                error={errors.temperature?.message}
                {...register('temperature')}
              />
            </div>
            <div className="space-y-1">
              <label className="block text-sm font-medium text-foreground">
                Síntomas
              </label>
              <textarea
                className="w-full rounded-lg border bg-white px-3 py-2 text-sm text-foreground placeholder:text-muted-foreground focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary"
                rows={3}
                placeholder="Describa los síntomas observados..."
                {...register('symptoms')}
              />
            </div>
            <div className="space-y-1">
              <label className="block text-sm font-medium text-foreground">
                Diagnóstico
              </label>
              <textarea
                className="w-full rounded-lg border bg-white px-3 py-2 text-sm text-foreground placeholder:text-muted-foreground focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary"
                rows={3}
                placeholder="Diagnóstico del paciente..."
                {...register('diagnosis')}
              />
            </div>
            <div className="space-y-1">
              <label className="block text-sm font-medium text-foreground">
                Tratamiento
              </label>
              <textarea
                className="w-full rounded-lg border bg-white px-3 py-2 text-sm text-foreground placeholder:text-muted-foreground focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary"
                rows={3}
                placeholder="Tratamiento indicado..."
                {...register('treatment')}
              />
            </div>
            <div className="space-y-1">
              <label className="block text-sm font-medium text-foreground">
                Notas adicionales
              </label>
              <textarea
                className="w-full rounded-lg border bg-white px-3 py-2 text-sm text-foreground placeholder:text-muted-foreground focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary"
                rows={2}
                placeholder="Observaciones adicionales..."
                {...register('notes')}
              />
            </div>
            <div className="flex justify-end gap-3 pt-4">
              <Button
                type="button"
                variant="outline"
                onClick={() => navigate(`/appointments/${appointmentId}`)}
              >
                Cancelar
              </Button>
              <Button type="submit" isLoading={isLoading}>
                Registrar Consulta
              </Button>
            </div>
          </form>
        </div>
      </div>
    </Layout>
  );
}
