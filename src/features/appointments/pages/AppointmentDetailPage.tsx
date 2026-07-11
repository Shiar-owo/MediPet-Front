import { useNavigate, useParams } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { Edit, ArrowLeft } from 'lucide-react';
import { Layout } from '@/shared/components/layout/Layout';
import { LoadingSpinner } from '@/shared/components/shared/LoadingSpinner';
import { Button } from '@/shared/components/ui/Button';
import { appointmentService } from '../services/appointmentService';
import { format } from 'date-fns';

export function AppointmentDetailPage() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();

  const { data: appointmentData, isLoading } = useQuery({
    queryKey: ['appointment', id],
    queryFn: () => appointmentService.getById(id!),
    enabled: Boolean(id),
  });

  const appointment = appointmentData?.data;

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
          <Button onClick={() => navigate(`/appointments/${id}/edit`)}>
            <Edit size={16} className="mr-2" />
            Editar
          </Button>
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
              IDs de Referencia
            </h2>
            <dl className="space-y-3">
              <div>
                <dt className="text-sm text-muted-foreground">ID del Turno</dt>
                <dd className="text-sm font-medium text-foreground break-all">
                  {appointment.id}
                </dd>
              </div>
              <div>
                <dt className="text-sm text-muted-foreground">ID del Cliente</dt>
                <dd className="text-sm font-medium text-foreground break-all">
                  {appointment.clientId}
                </dd>
              </div>
              <div>
                <dt className="text-sm text-muted-foreground">ID de la Mascota</dt>
                <dd className="text-sm font-medium text-foreground break-all">
                  {appointment.petId}
                </dd>
              </div>
              <div>
                <dt className="text-sm text-muted-foreground">ID del Veterinario</dt>
                <dd className="text-sm font-medium text-foreground break-all">
                  {appointment.veterinarianId}
                </dd>
              </div>
            </dl>
          </div>
        </div>
      </div>
    </Layout>
  );
}
