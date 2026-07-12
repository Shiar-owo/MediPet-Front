import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { Layout } from '@/shared/components/layout/Layout';
import { LoadingSpinner, EmptyState, Pagination } from '@/shared/components/shared';
import { Input } from '@/shared/components/ui';
import { consultationService } from '../services/consultationService';
import { petService } from '@/features/pets/services/petService';
import { format } from 'date-fns';

export function ConsultationListPage() {
  const navigate = useNavigate();
  const [page, setPage] = useState(0);
  const [petSearch, setPetSearch] = useState('');
  const [selectedPetId, setSelectedPetId] = useState<string | null>(null);

  const { data: petsData, isLoading: loadingPets } = useQuery({
    queryKey: ['pets', 'search', petSearch],
    queryFn: () => petService.getAll({ q: petSearch || undefined, size: 20 }),
    enabled: petSearch.length >= 0,
  });

  const pets = petsData?.data?.content ?? [];

  const { data: consultationsData, isLoading: loadingConsultations } = useQuery({
    queryKey: ['consultations', 'pet', selectedPetId, page],
    queryFn: () =>
      consultationService.getByPetId(selectedPetId!, { page, size: 10 }),
    enabled: Boolean(selectedPetId),
  });

  const consultations = consultationsData?.data?.content ?? [];
  const totalPages = consultationsData?.data?.totalPages ?? 0;

  return (
    <Layout>
      <div className="space-y-6">
        <div>
          <h1 className="text-2xl font-bold text-foreground">Consultas</h1>
          <p className="text-muted-foreground">
            Historial de consultas médicas por mascota
          </p>
        </div>

        <div className="rounded-lg border bg-white p-6 shadow-sm">
          <h2 className="mb-4 text-lg font-semibold text-foreground">Seleccionar mascota</h2>
          <Input
            placeholder="Buscar mascota por nombre..."
            value={petSearch}
            onChange={(e) => {
              setPetSearch(e.target.value);
              setSelectedPetId(null);
              setPage(0);
            }}
          />
          {loadingPets && <p className="mt-2 text-sm text-muted-foreground">Buscando...</p>}
          {pets.length > 0 && !selectedPetId && (
            <div className="mt-2 max-h-48 overflow-y-auto rounded-lg border">
              {pets.map((pet) => (
                <button
                  key={pet.id}
                  className="flex w-full items-center gap-3 border-b px-4 py-2 text-left hover:bg-muted/50 last:border-b-0"
                  onClick={() => {
                    setSelectedPetId(pet.id);
                    setPetSearch(pet.name);
                  }}
                >
                  <span className="text-sm font-medium text-foreground">{pet.name}</span>
                  <span className="text-xs text-muted-foreground">{pet.species}</span>
                </button>
              ))}
            </div>
          )}
        </div>

        {selectedPetId && (
          <>
            {loadingConsultations ? (
              <LoadingSpinner className="py-12" />
            ) : consultations.length === 0 ? (
              <EmptyState
                title="Sin consultas"
                description="Esta mascota no tiene consultas registradas."
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
                          Veterinario
                        </th>
                        <th className="px-4 py-3 text-left text-sm font-medium text-muted-foreground">
                          Diagnóstico
                        </th>
                        <th className="px-4 py-3 text-left text-sm font-medium text-muted-foreground">
                          Peso
                        </th>
                        <th className="px-4 py-3 text-left text-sm font-medium text-muted-foreground">
                          Temp.
                        </th>
                      </tr>
                    </thead>
                    <tbody>
                      {consultations.map((c) => (
                        <tr
                          key={c.id}
                          className="border-b last:border-b-0 hover:bg-muted/30 cursor-pointer"
                          onClick={() => navigate(`/appointments/${c.appointmentId}`)}
                        >
                          <td className="px-4 py-3 text-sm text-foreground">
                            {format(new Date(c.createdAt), 'dd/MM/yyyy')}
                          </td>
                          <td className="px-4 py-3 text-sm text-foreground">
                            {c.veterinarianName}
                          </td>
                          <td className="px-4 py-3 text-sm text-foreground">
                            {c.diagnosis || '-'}
                          </td>
                          <td className="px-4 py-3 text-sm text-foreground">
                            {c.weight ? `${c.weight} kg` : '-'}
                          </td>
                          <td className="px-4 py-3 text-sm text-foreground">
                            {c.temperature ? `${c.temperature}°C` : '-'}
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
          </>
        )}
      </div>
    </Layout>
  );
}
