import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { Plus, Edit, Eye } from 'lucide-react';
import { Layout } from '@/shared/components/layout/Layout';
import { LoadingSpinner, EmptyState, Pagination, SearchInput } from '@/shared/components/shared';
import { Button } from '@/shared/components/ui';
import { clientService } from '../services/clientService';

export function ClientListPage() {
  const [page, setPage] = useState(0);
  const [search, setSearch] = useState('');
  const navigate = useNavigate();

  const { data, isLoading } = useQuery({
    queryKey: ['clients', page, search],
    queryFn: () => clientService.getAll({ page, size: 10, q: search || undefined }),
  });

  const clients = data?.data?.content ?? [];
  const totalPages = data?.data?.totalPages ?? 0;

  return (
    <Layout>
      <div className="space-y-6">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h1 className="text-2xl font-bold text-foreground">Clientes</h1>
            <p className="text-muted-foreground">Gestiona los clientes de la clínica</p>
          </div>
          <Link to="/clients/new">
            <Button>
              <Plus size={16} className="mr-2" />
              Nuevo Cliente
            </Button>
          </Link>
        </div>

        <div className="w-full max-w-sm">
          <SearchInput
            placeholder="Buscar por nombre..."
            value={search}
            onChange={(value) => {
              setSearch(value);
              setPage(0);
            }}
          />
        </div>

        {isLoading ? (
          <LoadingSpinner className="py-12" />
        ) : clients.length === 0 ? (
          <EmptyState
            title="No hay clientes"
            description="No se encontraron clientes. Crea uno nuevo para comenzar."
          />
        ) : (
          <div className="rounded-lg border bg-white shadow-sm">
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b bg-muted/50">
                    <th className="px-4 py-3 text-left text-sm font-medium text-muted-foreground">
                      Nombre
                    </th>
                    <th className="px-4 py-3 text-left text-sm font-medium text-muted-foreground">
                      DNI
                    </th>
                    <th className="px-4 py-3 text-left text-sm font-medium text-muted-foreground">
                      Email
                    </th>
                    <th className="px-4 py-3 text-left text-sm font-medium text-muted-foreground">
                      Teléfono
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
                  {clients.map((client) => (
                    <tr key={client.id} className="border-b last:border-b-0 hover:bg-muted/30">
                      <td className="px-4 py-3 text-sm font-medium text-foreground">
                        {client.name}
                      </td>
                      <td className="px-4 py-3 text-sm text-muted-foreground">
                        {client.dni}
                      </td>
                      <td className="px-4 py-3 text-sm text-muted-foreground">
                        {client.email || '-'}
                      </td>
                      <td className="px-4 py-3 text-sm text-muted-foreground">
                        {client.phone || '-'}
                      </td>
                      <td className="px-4 py-3">
                        <span
                          className={`inline-flex rounded-full px-2 py-1 text-xs font-medium ${
                            client.active
                              ? 'bg-green-100 text-green-800'
                              : 'bg-red-100 text-red-800'
                          }`}
                        >
                          {client.active ? 'Activo' : 'Inactivo'}
                        </span>
                      </td>
                      <td className="px-4 py-3 text-right">
                        <div className="flex items-center justify-end gap-2">
                          <button
                            onClick={() => navigate(`/clients/${client.id}`)}
                            className="rounded-md p-1 text-muted-foreground hover:bg-muted hover:text-foreground"
                          >
                            <Eye size={16} />
                          </button>
                          <button
                            onClick={() => navigate(`/clients/${client.id}/edit`)}
                            className="rounded-md p-1 text-muted-foreground hover:bg-muted hover:text-foreground"
                          >
                            <Edit size={16} />
                          </button>
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
      </div>
    </Layout>
  );
}
