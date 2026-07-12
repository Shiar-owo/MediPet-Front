import { useNavigate, useParams } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { Edit, ArrowLeft, User } from 'lucide-react';
import { Layout } from '@/shared/components/layout/Layout';
import { LoadingSpinner } from '@/shared/components/shared/LoadingSpinner';
import { Button } from '@/shared/components/ui/Button';
import { userService } from '../services/userService';
import { format } from 'date-fns';

export function UserDetailPage() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();

  const { data: userData, isLoading } = useQuery({
    queryKey: ['user', id],
    queryFn: () => userService.getById(id!),
    enabled: Boolean(id),
  });

  const user = userData?.data;

  if (isLoading) {
    return (
      <Layout>
        <LoadingSpinner className="py-12" />
      </Layout>
    );
  }

  if (!user) {
    return (
      <Layout>
        <div className="py-12 text-center text-muted-foreground">
          Usuario no encontrado
        </div>
      </Layout>
    );
  }

  return (
    <Layout>
      <div className="space-y-6">
        <div className="flex items-center gap-4">
          <Button variant="ghost" onClick={() => navigate('/users')}>
            <ArrowLeft size={16} className="mr-2" />
            Volver
          </Button>
          <div className="flex h-12 w-12 items-center justify-center overflow-hidden rounded-full border bg-muted">
            {user.avatar ? (
              <img src={user.avatar} alt={`${user.firstName} ${user.lastName}`} className="h-full w-full object-cover" />
            ) : (
              <User size={24} className="text-muted-foreground" />
            )}
          </div>
          <div className="flex-1">
            <h1 className="text-2xl font-bold text-foreground">
              {user.firstName} {user.lastName}
            </h1>
            <p className="text-muted-foreground">{user.email}</p>
          </div>
          <Button onClick={() => navigate(`/users/${id}/edit`)}>
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
                  {user.email}
                </dd>
              </div>
              <div>
                <dt className="text-sm text-muted-foreground">Nombre</dt>
                <dd className="text-sm font-medium text-foreground">
                  {user.firstName}
                </dd>
              </div>
              <div>
                <dt className="text-sm text-muted-foreground">Apellido</dt>
                <dd className="text-sm font-medium text-foreground">
                  {user.lastName}
                </dd>
              </div>
              <div>
                <dt className="text-sm text-muted-foreground">Teléfono</dt>
                <dd className="text-sm font-medium text-foreground">
                  {user.phone || 'No especificado'}
                </dd>
              </div>
              <div>
                <dt className="text-sm text-muted-foreground">Dirección</dt>
                <dd className="text-sm font-medium text-foreground">
                  {user.address || 'No especificada'}
                </dd>
              </div>
              <div>
                <dt className="text-sm text-muted-foreground">Fecha de nacimiento</dt>
                <dd className="text-sm font-medium text-foreground">
                  {user.dateOfBirth
                    ? format(new Date(user.dateOfBirth), 'dd/MM/yyyy')
                    : 'No especificada'}
                </dd>
              </div>
              <div>
                <dt className="text-sm text-muted-foreground">Avatar</dt>
                <dd>
                  {user.avatar ? (
                    <img
                      src={user.avatar}
                      alt={`${user.firstName} ${user.lastName}`}
                      className="h-16 w-16 rounded-full object-cover"
                    />
                  ) : (
                    <span className="text-sm text-muted-foreground">No especificado</span>
                  )}
                </dd>
              </div>
            </dl>
          </div>

          <div className="rounded-lg border bg-white p-6 shadow-sm">
            <h2 className="mb-4 text-lg font-semibold text-foreground">
              Cuenta
            </h2>
            <dl className="space-y-3">
              <div>
                <dt className="text-sm text-muted-foreground">Rol</dt>
                <dd>
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
                </dd>
              </div>
              <div>
                <dt className="text-sm text-muted-foreground">Estado</dt>
                <dd>
                  <span
                    className={`inline-flex rounded-full px-2 py-1 text-xs font-medium ${
                      user.active
                        ? 'bg-green-100 text-green-800'
                        : 'bg-red-100 text-red-800'
                    }`}
                  >
                    {user.active ? 'Activo' : 'Inactivo'}
                  </span>
                </dd>
              </div>
              <div>
                <dt className="text-sm text-muted-foreground">Último ingreso</dt>
                <dd className="text-sm font-medium text-foreground">
                  {user.lastLoginAt
                    ? format(new Date(user.lastLoginAt), "dd/MM/yyyy HH:mm")
                    : 'Nunca'}
                </dd>
              </div>
              <div>
                <dt className="text-sm text-muted-foreground">ID del usuario</dt>
                <dd className="text-sm font-medium text-foreground break-all">
                  {user.id}
                </dd>
              </div>
            </dl>
          </div>
        </div>
      </div>
    </Layout>
  );
}
