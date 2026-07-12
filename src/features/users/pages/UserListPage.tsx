import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Plus, Edit, Eye, UserCheck, UserX } from 'lucide-react';
import { Layout } from '@/shared/components/layout/Layout';
import { LoadingSpinner, EmptyState, Pagination, ConfirmDialog, useToast } from '@/shared/components/shared';
import { Button } from '@/shared/components/ui/Button';
import { userService } from '../services/userService';
import { getApiErrorMessage } from '@/shared/lib/errors';

export function UserListPage() {
  const [page, setPage] = useState(0);
  const [toggleId, setToggleId] = useState<string | null>(null);
  const [toggleActive, setToggleActive] = useState(false);
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const toast = useToast();

  const { data, isLoading } = useQuery({
    queryKey: ['users', page],
    queryFn: () => userService.getAll({ page, size: 10 }),
  });

  const toggleMutation = useMutation({
    mutationFn: (id: string) =>
      toggleActive ? userService.deactivate(id) : userService.activate(id),
    onSuccess: () => {
      const action = toggleActive ? 'desactivado' : 'activado';
      toast.success(`Usuario ${action}`, `El usuario se ${action} correctamente.`);
      queryClient.invalidateQueries({ queryKey: ['users'] });
      setToggleId(null);
    },
    onError: (error) => {
      const { title, message } = getApiErrorMessage(error, 'Usuario');
      toast.error(title, message);
      setToggleId(null);
    },
  });

  const users = data?.data?.content ?? [];
  const totalPages = data?.data?.totalPages ?? 0;

  return (
    <Layout>
      <div className="space-y-6">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h1 className="text-2xl font-bold text-foreground">Usuarios</h1>
            <p className="text-muted-foreground">Gestiona los usuarios del sistema</p>
          </div>
          <Link to="/users/new">
            <Button>
              <Plus size={16} className="mr-2" />
              Nuevo Usuario
            </Button>
          </Link>
        </div>

        {isLoading ? (
          <LoadingSpinner className="py-12" />
        ) : users.length === 0 ? (
          <EmptyState
            title="No hay usuarios"
            description="No se encontraron usuarios. Crea uno nuevo para comenzar."
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
                      Email
                    </th>
                    <th className="px-4 py-3 text-left text-sm font-medium text-muted-foreground">
                      Rol
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
                  {users.map((user) => (
                    <tr key={user.id} className="border-b last:border-b-0 hover:bg-muted/30">
                      <td className="px-4 py-3 text-sm font-medium text-foreground">
                        {user.firstName} {user.lastName}
                      </td>
                      <td className="px-4 py-3 text-sm text-muted-foreground">
                        {user.email}
                      </td>
                      <td className="px-4 py-3">
                        <span
                          className={`inline-flex rounded-full px-2 py-1 text-xs font-medium ${
                            user.role === 'ADMIN'
                              ? 'bg-purple-100 text-purple-800'
                              : user.role === 'VETERINARIO'
                              ? 'bg-blue-100 text-blue-800'
                              : 'bg-green-100 text-green-800'
                          }`}
                        >
                          {user.role}
                        </span>
                      </td>
                      <td className="px-4 py-3">
                        <span
                          className={`inline-flex rounded-full px-2 py-1 text-xs font-medium ${
                            user.active
                              ? 'bg-green-100 text-green-800'
                              : 'bg-red-100 text-red-800'
                          }`}
                        >
                          {user.active ? 'Activo' : 'Inactivo'}
                        </span>
                      </td>
                      <td className="px-4 py-3 text-right">
                        <div className="flex items-center justify-end gap-2">
                          <button
                            onClick={() => navigate(`/users/${user.id}`)}
                            className="rounded-md p-1 text-muted-foreground hover:bg-muted hover:text-foreground"
                          >
                            <Eye size={16} />
                          </button>
                          <button
                            onClick={() => navigate(`/users/${user.id}/edit`)}
                            className="rounded-md p-1 text-muted-foreground hover:bg-muted hover:text-foreground"
                          >
                            <Edit size={16} />
                          </button>
                          <button
                            onClick={() => {
                              setToggleId(user.id);
                              setToggleActive(user.active);
                            }}
                            className="rounded-md p-1 text-muted-foreground hover:bg-muted hover:text-foreground"
                          >
                            {user.active ? <UserX size={16} /> : <UserCheck size={16} />}
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

        <ConfirmDialog
          isOpen={Boolean(toggleId)}
          title={toggleActive ? 'Desactivar Usuario' : 'Activar Usuario'}
          message={
            toggleActive
              ? '¿Estás seguro de que deseas desactivar este usuario? No podrá iniciar sesión.'
              : '¿Estás seguro de que deseas activar este usuario?'
          }
          confirmLabel={toggleActive ? 'Desactivar' : 'Activar'}
          variant={toggleActive ? 'destructive' : 'default'}
          onConfirm={() => {
            if (toggleId) toggleMutation.mutate(toggleId);
          }}
          onCancel={() => setToggleId(null)}
        />
      </div>
    </Layout>
  );
}
