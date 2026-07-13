import { useNavigate, useParams } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { Edit, ArrowLeft, ImageIcon } from 'lucide-react';
import { Layout } from '@/shared/components/layout/Layout';
import { LoadingSpinner } from '@/shared/components/shared/LoadingSpinner';
import { Button } from '@/shared/components/ui/Button';
import { petService } from '../services/petService';
import { appointmentService } from '@/features/appointments/services/appointmentService';
import { format } from 'date-fns';

export function PetDetailPage() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();

  const { data: petData, isLoading: loadingPet } = useQuery({
    queryKey: ['pet', id],
    queryFn: () => petService.getById(id!),
    enabled: Boolean(id),
  });

  const { data: appointmentsData, isLoading: loadingAppointments } = useQuery({
    queryKey: ['appointments', 'pet', id],
    queryFn: () => appointmentService.getByPetId(id!, { page: 0, size: 100 }),
    enabled: Boolean(id),
  });

  const pet = petData?.data;
  const appointments = appointmentsData?.data?.content ?? [];

  if (loadingPet) {
    return (
      <Layout>
        <LoadingSpinner className="py-12" />
      </Layout>
    );
  }

  if (!pet) {
    return (
      <Layout>
        <div className="py-12 text-center text-muted-foreground">
          Mascota no encontrada
        </div>
      </Layout>
    );
  }

  return (
    <Layout>
      <div className="space-y-6">
        <div className="flex items-center gap-4">
          <Button variant="ghost" onClick={() => navigate('/pets')}>
            <ArrowLeft size={16} className="mr-2" />
            Volver
          </Button>
          <div className="flex-1">
            <h1 className="text-2xl font-bold text-foreground">{pet.name}</h1>
            <p className="text-muted-foreground">
              {pet.species} - {pet.breed || 'Sin raza'}
            </p>
          </div>
          <Button onClick={() => navigate(`/pets/${id}/edit`)}>
            <Edit size={16} className="mr-2" />
            Editar
          </Button>
        </div>

        <div className="grid gap-6 md:grid-cols-2">
          <div className="rounded-lg border bg-white p-6 shadow-sm">
            <h2 className="mb-4 text-lg font-semibold text-foreground">
              Información de la Mascota
            </h2>
            {pet.photoUrl && (
              <div className="mb-4">
                <img
                  src={pet.photoUrl}
                  alt={pet.name}
                  className="mx-auto h-48 w-48 rounded-lg object-cover"
                />
              </div>
            )}
            {!pet.photoUrl && (
              <div className="mb-4 mx-auto flex h-48 w-48 items-center justify-center rounded-lg bg-muted">
                <ImageIcon size={32} className="text-muted-foreground/50" />
              </div>
            )}
            <dl className="space-y-3">
              <div>
                <dt className="text-sm text-muted-foreground">Sexo</dt>
                <dd className="text-sm font-medium text-foreground">
                  {pet.sex === 'MALE' ? 'Macho' : pet.sex === 'FEMALE' ? 'Hembra' : '-'}
                </dd>
              </div>
              <div>
                <dt className="text-sm text-muted-foreground">Fecha de nacimiento</dt>
                <dd className="text-sm font-medium text-foreground">
                  {pet.dateOfBirth
                    ? format(new Date(pet.dateOfBirth), 'dd/MM/yyyy')
                    : '-'}
                </dd>
              </div>
              <div>
                <dt className="text-sm text-muted-foreground">Color</dt>
                <dd className="text-sm font-medium text-foreground">
                  {pet.color || '-'}
                </dd>
              </div>
              <div>
                <dt className="text-sm text-muted-foreground">Peso</dt>
                <dd className="text-sm font-medium text-foreground">
                  {pet.weight ? `${pet.weight} kg` : '-'}
                </dd>
              </div>
              <div>
                <dt className="text-sm text-muted-foreground">Microchip</dt>
                <dd className="text-sm font-medium text-foreground">
                  {pet.microchipId || '-'}
                </dd>
              </div>
              <div>
                <dt className="text-sm text-muted-foreground">Tatuaje</dt>
                <dd className="text-sm font-medium text-foreground">
                  {pet.tattooNumber || '-'}
                </dd>
              </div>
              <div>
                <dt className="text-sm text-muted-foreground">Estado</dt>
                <dd>
                  <span
                    className={`inline-flex rounded-full px-2 py-1 text-xs font-medium ${
                      pet.active
                        ? 'bg-green-100 text-green-800'
                        : 'bg-red-100 text-red-800'
                    }`}
                  >
                    {pet.active ? 'Activo' : 'Inactivo'}
                  </span>
                </dd>
              </div>
            </dl>
          </div>

          <div className="rounded-lg border bg-white p-6 shadow-sm">
            <div className="mb-4 flex items-center justify-between">
              <h2 className="text-lg font-semibold text-foreground">
                Historial de Turnos ({appointments.length})
              </h2>
            </div>
            {loadingAppointments ? (
              <LoadingSpinner className="py-8" />
            ) : appointments.length === 0 ? (
              <p className="py-8 text-center text-sm text-muted-foreground">
                No tiene turnos registrados
              </p>
            ) : (
              <div className="space-y-3">
                {appointments.map((appointment) => (
                  <div
                    key={appointment.id}
                    className="flex items-center justify-between rounded-lg border p-3"
                  >
                    <div>
                      <p className="font-medium text-foreground">
                        {format(new Date(appointment.date), 'dd/MM/yyyy')} - {appointment.startTime}
                      </p>
                      <p className="text-sm text-muted-foreground">
                        {appointment.reason || 'Sin motivo'}
                      </p>
                    </div>
                    <span
                      className={`rounded-full px-2 py-1 text-xs font-medium ${
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
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </Layout>
  );
}
