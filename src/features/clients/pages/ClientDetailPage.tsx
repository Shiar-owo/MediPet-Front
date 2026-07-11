import { useNavigate, useParams } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { Edit, ArrowLeft } from 'lucide-react';
import { Layout } from '@/shared/components/layout/Layout';
import { LoadingSpinner } from '@/shared/components/shared/LoadingSpinner';
import { Button } from '@/shared/components/ui/Button';
import { clientService } from '../services/clientService';
import { petService } from '@/features/pets/services/petService';

export function ClientDetailPage() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();

  const { data: clientData, isLoading: loadingClient } = useQuery({
    queryKey: ['client', id],
    queryFn: () => clientService.getById(id!),
    enabled: Boolean(id),
  });

  const { data: petsData, isLoading: loadingPets } = useQuery({
    queryKey: ['pets', 'client', id],
    queryFn: () => petService.getByClientId(id!, { page: 0, size: 100 }),
    enabled: Boolean(id),
  });

  const client = clientData?.data;
  const pets = petsData?.data?.content ?? [];

  if (loadingClient) {
    return (
      <Layout>
        <LoadingSpinner className="py-12" />
      </Layout>
    );
  }

  if (!client) {
    return (
      <Layout>
        <div className="py-12 text-center text-muted-foreground">
          Cliente no encontrado
        </div>
      </Layout>
    );
  }

  return (
    <Layout>
      <div className="space-y-6">
        <div className="flex items-center gap-4">
          <Button variant="ghost" onClick={() => navigate('/clients')}>
            <ArrowLeft size={16} className="mr-2" />
            Volver
          </Button>
          <div className="flex-1">
            <h1 className="text-2xl font-bold text-foreground">{client.name}</h1>
            <p className="text-muted-foreground">DNI: {client.dni}</p>
          </div>
          <Button onClick={() => navigate(`/clients/${id}/edit`)}>
            <Edit size={16} className="mr-2" />
            Editar
          </Button>
        </div>

        <div className="grid gap-6 md:grid-cols-2">
          <div className="rounded-lg border bg-white p-6 shadow-sm">
            <h2 className="mb-4 text-lg font-semibold text-foreground">
              Información Personal
            </h2>
            <dl className="space-y-3">
              <div>
                <dt className="text-sm text-muted-foreground">Email</dt>
                <dd className="text-sm font-medium text-foreground">
                  {client.email || '-'}
                </dd>
              </div>
              <div>
                <dt className="text-sm text-muted-foreground">Teléfono</dt>
                <dd className="text-sm font-medium text-foreground">
                  {client.phone || '-'}
                </dd>
              </div>
              <div>
                <dt className="text-sm text-muted-foreground">Dirección</dt>
                <dd className="text-sm font-medium text-foreground">
                  {client.address || '-'}
                </dd>
              </div>
              <div>
                <dt className="text-sm text-muted-foreground">Estado</dt>
                <dd>
                  <span
                    className={`inline-flex rounded-full px-2 py-1 text-xs font-medium ${
                      client.active
                        ? 'bg-green-100 text-green-800'
                        : 'bg-red-100 text-red-800'
                    }`}
                  >
                    {client.active ? 'Activo' : 'Inactivo'}
                  </span>
                </dd>
              </div>
            </dl>
          </div>

          <div className="rounded-lg border bg-white p-6 shadow-sm">
            <div className="mb-4 flex items-center justify-between">
              <h2 className="text-lg font-semibold text-foreground">
                Mascotas ({pets.length})
              </h2>
            </div>
            {loadingPets ? (
              <LoadingSpinner className="py-8" />
            ) : pets.length === 0 ? (
              <p className="py-8 text-center text-sm text-muted-foreground">
                No tiene mascotas registradas
              </p>
            ) : (
              <div className="space-y-3">
                {pets.map((pet) => (
                  <div
                    key={pet.id}
                    className="flex items-center justify-between rounded-lg border p-3"
                  >
                    <div>
                      <p className="font-medium text-foreground">{pet.name}</p>
                      <p className="text-sm text-muted-foreground">
                        {pet.species} - {pet.breed || 'Sin raza'}
                      </p>
                    </div>
                    <button
                      onClick={() => navigate(`/pets/${pet.id}`)}
                      className="text-sm text-primary hover:underline"
                    >
                      Ver detalle
                    </button>
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
