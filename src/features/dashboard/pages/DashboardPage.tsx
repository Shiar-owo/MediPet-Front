import { Link } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { useAuth } from '@/shared/context/AuthContext';
import { Layout } from '@/shared/components/layout/Layout';
import { clientService } from '@/features/clients/services/clientService';
import { petService } from '@/features/pets/services/petService';
import { appointmentService } from '@/features/appointments/services/appointmentService';
import { PawPrint, Users, Calendar, UserCog } from 'lucide-react';

export function DashboardPage() {
  const { user } = useAuth();

  const { data: clientsData } = useQuery({
    queryKey: ['clients', 'count'],
    queryFn: () => clientService.getAll({ page: 0, size: 1 }),
  });

  const { data: petsData } = useQuery({
    queryKey: ['pets', 'count'],
    queryFn: () => petService.getAll({ page: 0, size: 1 }),
  });

  const { data: appointmentsData } = useQuery({
    queryKey: ['appointments', 'count'],
    queryFn: () => appointmentService.getAll({ page: 0, size: 1 }),
  });

  const totalClients = clientsData?.data?.totalElements ?? 0;
  const totalPets = petsData?.data?.totalElements ?? 0;
  const totalAppointments = appointmentsData?.data?.totalElements ?? 0;

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
                <p className="text-2xl font-bold text-foreground">{totalPets}</p>
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
                <p className="text-2xl font-bold text-foreground">{totalClients}</p>
              </div>
            </div>
          </div>

          <div className="rounded-lg border bg-white p-6 shadow-sm">
            <div className="flex items-center gap-4">
              <div className="rounded-full bg-primary/10 p-3">
                <Calendar className="h-6 w-6 text-primary" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Turnos</p>
                <p className="text-2xl font-bold text-foreground">{totalAppointments}</p>
              </div>
            </div>
          </div>

          <div className="rounded-lg border bg-white p-6 shadow-sm">
            <div className="flex items-center gap-4">
              <div className="rounded-full bg-primary/10 p-3">
                <UserCog className="h-6 w-6 text-primary" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Tu rol</p>
                <p className="text-2xl font-bold text-foreground">{user?.role}</p>
              </div>
            </div>
          </div>
        </div>

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
