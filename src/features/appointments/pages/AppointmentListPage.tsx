import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Plus, Edit, Eye, X, Check, User, Users } from 'lucide-react';
import { Layout } from '@/shared/components/layout/Layout';
import { LoadingSpinner, EmptyState, Pagination, ConfirmDialog, useToast } from '@/shared/components/shared';
import { Button, DatePicker } from '@/shared/components/ui';
import { useAuth } from '@/shared/context/AuthContext';
import { appointmentService } from '../services/appointmentService';
import { getApiErrorMessage } from '@/shared/lib/errors';
import { format } from 'date-fns';


export function AppointmentListPage() {
  const [page, setPage] = useState(0);
  const [date, setDate] = useState('');
  const [cancelId, setCancelId] = useState<string | null>(null);
  const [showMine, setShowMine] = useState(true);
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const toast = useToast();
  const { user } = useAuth();
  const isVet = user?.role === 'VETERINARIO';

  const { data, isLoading } = useQuery({
    queryKey: ['appointments', page, date, showMine, user?.id],
    queryFn: () => {
      if (isVet && showMine) {
        return appointmentService.getByVeterinarianId(user!.id, {
          page,
          size: 10,
          date: date || undefined,
        });
      }
      return appointmentService.getAll({
        page,
        size: 10,
        date: date || undefined,
      });
    },
  });

  const cancelMutation = useMutation({
    mutationFn: (id: string) => appointmentService.cancel(id),
    onSuccess: () => {
      toast.success('Turno cancelado', 'El turno se canceló correctamente.');
      queryClient.invalidateQueries({ queryKey: ['appointments'] });
      setCancelId(null);
    },
    onError: (error) => {
      const { title, message } = getApiErrorMessage(error, 'Turno');
      toast.error(title, message);
      setCancelId(null);
    },
  });

  const appointments = data?.data?.content ?? [];
  const totalPages = data?.data?.totalPages ?? 0;

  const canEdit = (veterinarianId: string) => {
    if (user?.role === 'ADMIN' || user?.role === 'RECEPCIONISTA') return true;
    return veterinarianId === user?.id;
  };

  const canComplete = (veterinarianId: string) => {
    if (user?.role === 'ADMIN') return true;
    return veterinarianId === user?.id;
  };

  return (
    <Layout>
      <div className="space-y-6">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h1 className="text-2xl font-bold text-foreground">
              {isVet && showMine ? 'Mis Turnos' : 'Turnos'}
            </h1>
            <p className="text-muted-foreground">
              {isVet && showMine
                ? 'Turnos asignados a ti'
                : 'Gestiona los turnos de la clínica'}
            </p>
          </div>
          <Link to="/appointments/new">
            <Button>
              <Plus size={16} className="mr-2" />
              Nuevo Turno
            </Button>
          </Link>
        </div>

        <div className="flex flex-col gap-4 sm:flex-row sm:items-center">
          {isVet && (
            <Button
              variant={showMine ? 'default' : 'outline'}
              size="sm"
              onClick={() => { setShowMine(true); setPage(0); }}
            >
              <User size={16} className="mr-2" />
              Mis turnos
            </Button>
          )}
          {isVet && (
            <Button
              variant={!showMine ? 'default' : 'outline'}
              size="sm"
              onClick={() => { setShowMine(false); setPage(0); }}
            >
              <Users size={16} className="mr-2" />
              Todos
            </Button>
          )}
          <div className="w-full max-w-xs">
            <DatePicker
              placeholder="Filtrar por fecha"
              value={date}
              onChange={(e) => {
                setDate(e.target.value);
                setPage(0);
              }}
            />
          </div>
          {date && (
            <Button
              variant="ghost"
              size="sm"
              onClick={() => {
                setDate('');
                setPage(0);
              }}
            >
              Limpiar filtro
            </Button>
          )}
        </div>

        {isLoading ? (
          <LoadingSpinner className="py-12" />
        ) : appointments.length === 0 ? (
          <EmptyState
            title={isVet && showMine ? 'No tienes turnos' : 'No hay turnos'}
            description={
              isVet && showMine
                ? 'No tienes turnos asignados. Crea uno nuevo para comenzar.'
                : 'No se encontraron turnos. Crea uno nuevo para comenzar.'
            }
          />
        ) : (
          <div className="rounded-lg border bg-white shadow-sm">
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b bg-muted/50">
                    <th className="px-4 py-3 text-left text-sm font-medium text-muted-foreground">
                      Fecha
                    </th>
                    <th className="px-4 py-3 text-left text-sm font-medium text-muted-foreground">
                      Horario
                    </th>
                    <th className="px-4 py-3 text-left text-sm font-medium text-muted-foreground">
                      Mascota
                    </th>
                    <th className="px-4 py-3 text-left text-sm font-medium text-muted-foreground">
                      Cliente
                    </th>
                    <th className="px-4 py-3 text-left text-sm font-medium text-muted-foreground">
                      Veterinario
                    </th>
                    <th className="px-4 py-3 text-left text-sm font-medium text-muted-foreground">
                      Estado
                    </th>
                    <th className="px-4 py-3 text-right text-sm font-medium text-muted-foreground">
                      Acciones
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {appointments.map((appointment) => (
                    <tr key={appointment.id} className="border-b last:border-b-0 hover:bg-muted/30">
                      <td className="px-4 py-3 text-sm text-foreground">
                        {format(new Date(appointment.date), 'dd/MM/yyyy')}
                      </td>
                      <td className="px-4 py-3 text-sm text-muted-foreground">
                        {appointment.startTime} - {appointment.endTime}
                      </td>
                      <td className="px-4 py-3 text-sm font-medium text-foreground">
                        {appointment.petName}
                      </td>
                      <td className="px-4 py-3 text-sm text-muted-foreground">
                        {appointment.clientName}
                      </td>
                      <td className="px-4 py-3 text-sm text-muted-foreground">
                        {appointment.veterinarianName}
                      </td>
                      <td className="px-4 py-3">
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
                      </td>
                      <td className="px-4 py-3 text-right">
                        <div className="flex items-center justify-end gap-2">
                          <button
                            onClick={() => navigate(`/appointments/${appointment.id}`)}
                            className="rounded-md p-1 text-muted-foreground hover:bg-muted hover:text-foreground"
                          >
                            <Eye size={16} />
                          </button>
                          {canEdit(appointment.veterinarianId) && appointment.status !== 'CANCELADA' && appointment.status !== 'COMPLETADA' && (
                            <button
                              onClick={() => navigate(`/appointments/${appointment.id}/edit`)}
                              className="rounded-md p-1 text-muted-foreground hover:bg-muted hover:text-foreground"
                            >
                              <Edit size={16} />
                            </button>
                          )}
                          {canComplete(appointment.veterinarianId) && appointment.status === 'PENDIENTE' && (
                            <button
                              onClick={() => navigate(`/appointments/${appointment.id}/consultation`)}
                              className="rounded-md p-1 text-muted-foreground hover:bg-green-50 hover:text-green-600"
                            >
                              <Check size={16} />
                            </button>
                          )}
                          {canEdit(appointment.veterinarianId) && appointment.status !== 'CANCELADA' && appointment.status !== 'COMPLETADA' && (
                            <button
                              onClick={() => setCancelId(appointment.id)}
                              className="rounded-md p-1 text-muted-foreground hover:bg-destructive/10 hover:text-destructive"
                            >
                              <X size={16} />
                            </button>
                          )}
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            <div className="border-t">
              <Pagination page={page} totalPages={totalPages} onPageChange={setPage} />
            </div>
          </div>
        )}

        <ConfirmDialog
          isOpen={Boolean(cancelId)}
          title="Cancelar Turno"
          message="¿Estás seguro de que deseas cancelar este turno? Esta acción no se puede deshacer."
          confirmLabel="Cancelar Turno"
          variant="destructive"
          onConfirm={() => {
            if (cancelId) cancelMutation.mutate(cancelId);
          }}
          onCancel={() => setCancelId(null)}
        />
      </div>
    </Layout>
  );
}
