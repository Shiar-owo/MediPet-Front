import { useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Edit, ArrowLeft, Check, X } from 'lucide-react';
import { Layout } from '@/shared/components/layout/Layout';
import { LoadingSpinner, ConfirmDialog, useToast } from '@/shared/components/shared';
import { Button } from '@/shared/components/ui/Button';
import { useAuth } from '@/shared/context/AuthContext';
import { appointmentService } from '../services/appointmentService';
import { consultationService } from '@/features/consultations/services/consultationService';
import { getApiErrorMessage } from '@/shared/lib/errors';
import { format } from 'date-fns';

export function AppointmentDetailPage() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { user } = useAuth();
  const toast = useToast();
  const queryClient = useQueryClient();
  const [cancelId, setCancelId] = useState(false);

  const { data: appointmentData, isLoading } = useQuery({
    queryKey: ['appointment', id],
    queryFn: () => appointmentService.getById(id!),
    enabled: Boolean(id),
  });

  const appointment = appointmentData?.data;

  const { data: consultationData } = useQuery({
    queryKey: ['consultation', 'appointment', id],
    queryFn: () => consultationService.getByAppointmentId(id!),
    enabled: Boolean(id) && appointment?.status === 'COMPLETADA',
  });

  const consultation = consultationData?.data;

  const canEdit = appointment
    ? user?.role === 'ADMIN' || user?.role === 'RECEPCIONISTA' || appointment.veterinarianId === user?.id
    : false;

  const canComplete = appointment
    ? user?.role === 'ADMIN' || appointment.veterinarianId === user?.id
    : false;

  const cancelMutation = useMutation({
    mutationFn: () => appointmentService.cancel(id!),
    onSuccess: () => {
      toast.success('Turno cancelado', 'El turno se canceló correctamente.');
      queryClient.invalidateQueries({ queryKey: ['appointment', id] });
      queryClient.invalidateQueries({ queryKey: ['appointments'] });
      setCancelId(false);
    },
    onError: (error) => {
      const { title, message } = getApiErrorMessage(error, 'Turno');
      toast.error(title, message);
      setCancelId(false);
    },
  });

  if (isLoading) {
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
      <div className="space-y-6">
        <div className="flex items-center gap-4">
          <Button variant="ghost" onClick={() => navigate('/appointments')}>
            <ArrowLeft size={16} className="mr-2" />
            Volver
          </Button>
          <div className="flex-1">
            <h1 className="text-2xl font-bold text-foreground">Detalle del Turno</h1>
            <p className="text-muted-foreground">
              {format(new Date(appointment.date), 'dd/MM/yyyy')} - {appointment.startTime} a {appointment.endTime}
            </p>
          </div>
          {canEdit && (
            <div className="flex gap-2">
              {canComplete && appointment.status === 'PENDIENTE' && (
                <Button
                  variant="default"
                  onClick={() => navigate(`/appointments/${id}/consultation`)}
                >
                  <Check size={16} className="mr-2" />
                  Completar
                </Button>
              )}
              {appointment.status !== 'CANCELADA' && appointment.status !== 'COMPLETADA' && (
                <Button
                  variant="destructive"
                  onClick={() => setCancelId(true)}
                >
                  <X size={16} className="mr-2" />
                  Cancelar
                </Button>
              )}
              {appointment.status === 'PENDIENTE' && (
                <Button onClick={() => navigate(`/appointments/${id}/edit`)}>
                  <Edit size={16} className="mr-2" />
                  Editar
                </Button>
              )}
            </div>
          )}
        </div>

        <div className="grid gap-6 md:grid-cols-2">
          <div className="rounded-lg border bg-white p-6 shadow-sm">
            <h2 className="mb-4 text-lg font-semibold text-foreground">
              Información del Turno
            </h2>
            <dl className="space-y-3">
              <div>
                <dt className="text-sm text-muted-foreground">Fecha</dt>
                <dd className="text-sm font-medium text-foreground">
                  {format(new Date(appointment.date), 'dd/MM/yyyy')}
                </dd>
              </div>
              <div>
                <dt className="text-sm text-muted-foreground">Horario</dt>
                <dd className="text-sm font-medium text-foreground">
                  {appointment.startTime} - {appointment.endTime}
                </dd>
              </div>
              <div>
                <dt className="text-sm text-muted-foreground">Motivo</dt>
                <dd className="text-sm font-medium text-foreground">
                  {appointment.reason || 'No especificado'}
                </dd>
              </div>
              <div>
                <dt className="text-sm text-muted-foreground">Estado</dt>
                <dd>
                  <span
                    className={`inline-flex rounded-full px-2 py-1 text-xs font-medium ${
                      appointment.status === 'PENDIENTE'
                        ? 'bg-yellow-100 text-yellow-800'
                        : appointment.status === 'CONFIRMADA'
                        ? 'bg-green-100 text-green-800'
                        : appointment.status === 'CANCELADA'
                        ? 'bg-red-100 text-red-800'
                        : 'bg-blue-100 text-blue-800'
                    }`}
                  >
                    {appointment.status}
                  </span>
                </dd>
              </div>
              {appointment.cancelReason && (
                <div>
                  <dt className="text-sm text-muted-foreground">Razón de cancelación</dt>
                  <dd className="text-sm font-medium text-foreground">
                    {appointment.cancelReason}
                  </dd>
                </div>
              )}
            </dl>
          </div>

          <div className="rounded-lg border bg-white p-6 shadow-sm">
            <h2 className="mb-4 text-lg font-semibold text-foreground">
              Participantes
            </h2>
            <dl className="space-y-3">
              <div>
                <dt className="text-sm text-muted-foreground">Mascota</dt>
                <dd className="text-sm font-medium text-foreground">
                  {appointment.petName}
                </dd>
              </div>
              <div>
                <dt className="text-sm text-muted-foreground">Cliente</dt>
                <dd className="text-sm font-medium text-foreground">
                  {appointment.clientName}
                </dd>
              </div>
              <div>
                <dt className="text-sm text-muted-foreground">Veterinario</dt>
                <dd className="text-sm font-medium text-foreground">
                  {appointment.veterinarianName}
                </dd>
              </div>
            </dl>
          </div>
        </div>

        {appointment.status === 'COMPLETADA' && consultation && (
          <div className="rounded-lg border bg-white p-6 shadow-sm">
            <h2 className="mb-4 text-lg font-semibold text-foreground">
              Consulta Médica
            </h2>
            <div className="grid gap-4 sm:grid-cols-2">
              {consultation.weight != null && (
                <div>
                  <dt className="text-sm text-muted-foreground">Peso</dt>
                  <dd className="text-sm font-medium text-foreground">{consultation.weight} kg</dd>
                </div>
              )}
              {consultation.temperature != null && (
                <div>
                  <dt className="text-sm text-muted-foreground">Temperatura</dt>
                  <dd className="text-sm font-medium text-foreground">{consultation.temperature}°C</dd>
                </div>
              )}
            </div>
            <dl className="mt-4 space-y-3">
              {consultation.symptoms && (
                <div>
                  <dt className="text-sm text-muted-foreground">Síntomas</dt>
                  <dd className="text-sm font-medium text-foreground">{consultation.symptoms}</dd>
                </div>
              )}
              {consultation.diagnosis && (
                <div>
                  <dt className="text-sm text-muted-foreground">Diagnóstico</dt>
                  <dd className="text-sm font-medium text-foreground">{consultation.diagnosis}</dd>
                </div>
              )}
              {consultation.treatment && (
                <div>
                  <dt className="text-sm text-muted-foreground">Tratamiento</dt>
                  <dd className="text-sm font-medium text-foreground">{consultation.treatment}</dd>
                </div>
              )}
              {consultation.notes && (
                <div>
                  <dt className="text-sm text-muted-foreground">Notas</dt>
                  <dd className="text-sm font-medium text-foreground">{consultation.notes}</dd>
                </div>
              )}
            </dl>
          </div>
        )}
      </div>

      <ConfirmDialog
        isOpen={cancelId}
        title="Cancelar Turno"
        message="¿Estás seguro de que deseas cancelar este turno? Esta acción no se puede deshacer."
        confirmLabel="Cancelar Turno"
        variant="destructive"
        onConfirm={() => cancelMutation.mutate()}
        onCancel={() => setCancelId(false)}
      />
    </Layout>
  );
}
