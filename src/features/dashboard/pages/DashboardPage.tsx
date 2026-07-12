import { Link, useNavigate } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { useAuth } from '@/shared/context/AuthContext';
import { Layout } from '@/shared/components/layout/Layout';
import { LoadingSpinner } from '@/shared/components/shared';
import { dashboardService } from '../services/dashboardService';
import { PawPrint, Users, Calendar, UserCog, Stethoscope } from 'lucide-react';
import { format } from 'date-fns';

export function DashboardPage() {
  const { user } = useAuth();
  const navigate = useNavigate();

  const { data: statsData, isLoading } = useQuery({
    queryKey: ['dashboard', 'stats'],
    queryFn: () => dashboardService.getStats(),
  });

  const stats = statsData?.data;

  if (isLoading) {
    return (
      <Layout>
        <LoadingSpinner className="py-12" />
      </Layout>
    );
  }

  return (
    <Layout>
      <div className="space-y-6">
        <div>
          <h1 className="text-2xl font-bold text-foreground">
            Bienvenido, {user?.email}
          </h1>
          <p className="text-muted-foreground">
            Panel de control de MediPet
          </p>
        </div>

        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
          <div className="rounded-lg border bg-white p-6 shadow-sm">
            <div className="flex items-center gap-4">
              <div className="rounded-full bg-primary/10 p-3">
                <PawPrint className="h-6 w-6 text-primary" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Mascotas</p>
                <p className="text-2xl font-bold text-foreground">{stats?.totalPets ?? 0}</p>
              </div>
            </div>
          </div>

          <div className="rounded-lg border bg-white p-6 shadow-sm">
            <div className="flex items-center gap-4">
              <div className="rounded-full bg-primary/10 p-3">
                <Users className="h-6 w-6 text-primary" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Clientes</p>
                <p className="text-2xl font-bold text-foreground">{stats?.totalClients ?? 0}</p>
              </div>
            </div>
          </div>

          <div className="rounded-lg border bg-white p-6 shadow-sm">
            <div className="flex items-center gap-4">
              <div className="rounded-full bg-primary/10 p-3">
                <Calendar className="h-6 w-6 text-primary" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Turnos hoy</p>
                <p className="text-2xl font-bold text-foreground">{stats?.appointmentsToday ?? 0}</p>
              </div>
            </div>
          </div>

          <div className="rounded-lg border bg-white p-6 shadow-sm">
            <div className="flex items-center gap-4">
              <div className="rounded-full bg-primary/10 p-3">
                <Calendar className="h-6 w-6 text-primary" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Turnos este mes</p>
                <p className="text-2xl font-bold text-foreground">{stats?.appointmentsThisMonth ?? 0}</p>
              </div>
            </div>
          </div>
        </div>

        {stats?.upcomingAppointments && stats.upcomingAppointments.length > 0 && (
          <div className="rounded-lg border bg-white p-6 shadow-sm">
            <h2 className="mb-4 text-lg font-semibold text-foreground">
              Próximos turnos (7 días)
            </h2>
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b bg-muted/50">
                    <th className="px-4 py-3 text-left text-sm font-medium text-muted-foreground">Fecha</th>
                    <th className="px-4 py-3 text-left text-sm font-medium text-muted-foreground">Horario</th>
                    <th className="px-4 py-3 text-left text-sm font-medium text-muted-foreground">Mascota</th>
                    <th className="px-4 py-3 text-left text-sm font-medium text-muted-foreground">Cliente</th>
                    <th className="px-4 py-3 text-left text-sm font-medium text-muted-foreground">Veterinario</th>
                    <th className="px-4 py-3 text-left text-sm font-medium text-muted-foreground">Estado</th>
                  </tr>
                </thead>
                <tbody>
                  {stats.upcomingAppointments.map((a) => (
                    <tr
                      key={a.id}
                      className="border-b last:border-b-0 hover:bg-muted/30 cursor-pointer"
                      onClick={() => navigate(`/appointments/${a.id}`)}
                    >
                      <td className="px-4 py-3 text-sm text-foreground">
                        {format(new Date(a.date), 'dd/MM/yyyy')}
                      </td>
                      <td className="px-4 py-3 text-sm text-muted-foreground">
                        {a.startTime} - {a.endTime}
                      </td>
                      <td className="px-4 py-3 text-sm font-medium text-foreground">
                        {a.petName}
                      </td>
                      <td className="px-4 py-3 text-sm text-muted-foreground">
                        {a.clientName}
                      </td>
                      <td className="px-4 py-3 text-sm text-muted-foreground">
                        {a.veterinarianName}
                      </td>
                      <td className="px-4 py-3">
                        <span
                          className={`inline-flex rounded-full px-2 py-1 text-xs font-medium ${
                            a.status === 'PENDIENTE'
                              ? 'bg-yellow-100 text-yellow-800'
                              : a.status === 'CONFIRMADA'
                              ? 'bg-green-100 text-green-800'
                              : a.status === 'CANCELADA'
                              ? 'bg-red-100 text-red-800'
                              : 'bg-blue-100 text-blue-800'
                          }`}
                        >
                          {a.status}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        <div className="rounded-lg border bg-white p-6 shadow-sm">
          <h2 className="mb-4 text-lg font-semibold text-foreground">
            Accesos rápidos
          </h2>
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
            <Link
              to="/clients/new"
              className="flex items-center gap-3 rounded-lg border p-4 hover:bg-muted/50"
            >
              <Users className="h-5 w-5 text-muted-foreground" />
              <span className="text-sm font-medium">Nuevo Cliente</span>
            </Link>
            <Link
              to="/pets/new"
              className="flex items-center gap-3 rounded-lg border p-4 hover:bg-muted/50"
            >
              <PawPrint className="h-5 w-5 text-muted-foreground" />
              <span className="text-sm font-medium">Nueva Mascota</span>
            </Link>
            <Link
              to="/appointments/new"
              className="flex items-center gap-3 rounded-lg border p-4 hover:bg-muted/50"
            >
              <Calendar className="h-5 w-5 text-muted-foreground" />
              <span className="text-sm font-medium">Nuevo Turno</span>
            </Link>
            <Link
              to="/consultations"
              className="flex items-center gap-3 rounded-lg border p-4 hover:bg-muted/50"
            >
              <Stethoscope className="h-5 w-5 text-muted-foreground" />
              <span className="text-sm font-medium">Consultas</span>
            </Link>
            {user?.role === 'ADMIN' && (
              <Link
                to="/users/new"
                className="flex items-center gap-3 rounded-lg border p-4 hover:bg-muted/50"
              >
                <UserCog className="h-5 w-5 text-muted-foreground" />
                <span className="text-sm font-medium">Nuevo Usuario</span>
              </Link>
            )}
          </div>
        </div>
      </div>
    </Layout>
  );
}
