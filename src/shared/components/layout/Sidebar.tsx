import { useState } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import {
  LayoutDashboard,
  Users,
  PawPrint,
  Calendar,
  Stethoscope,
  UserCog,
  LogOut,
  Menu,
  X,
} from 'lucide-react';
import { useAuth } from '@/shared/context/AuthContext';
import { useAuthStore } from '@/features/auth/store/useAuthStore';
import { authService } from '@/features/auth/services/authService';

const navItems = [
  { to: '/dashboard', label: 'Dashboard', icon: LayoutDashboard, roles: ['ADMIN', 'VETERINARIO', 'RECEPCIONISTA'] },
  { to: '/clients', label: 'Clientes', icon: Users, roles: ['ADMIN', 'VETERINARIO', 'RECEPCIONISTA'] },
  { to: '/pets', label: 'Mascotas', icon: PawPrint, roles: ['ADMIN', 'VETERINARIO', 'RECEPCIONISTA'] },
  { to: '/appointments', label: 'Turnos', icon: Calendar, roles: ['ADMIN', 'VETERINARIO', 'RECEPCIONISTA'] },
  { to: '/consultations', label: 'Consultas', icon: Stethoscope, roles: ['ADMIN', 'VETERINARIO', 'RECEPCIONISTA'] },
  { to: '/users', label: 'Usuarios', icon: UserCog, roles: ['ADMIN'] },
];

export function Sidebar() {
  const [isOpen, setIsOpen] = useState(false);
  const location = useLocation();
  const navigate = useNavigate();
  const { user } = useAuth();
  const logout = useAuthStore((state) => state.logout);

  const filteredNavItems = navItems.filter((item) =>
    user?.role ? item.roles.includes(user.role) : false
  );

  const handleLogout = async () => {
    const refreshToken = localStorage.getItem('refreshToken');
    if (refreshToken) {
      try {
        await authService.logout({ refreshToken });
      } catch {
        // Ignore error
      }
    }
    logout();
    navigate('/login');
  };

  return (
    <>
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="fixed top-4 left-4 z-50 rounded-lg bg-white p-2 shadow-md lg:hidden"
      >
        {isOpen ? <X size={20} /> : <Menu size={20} />}
      </button>

      {isOpen && (
        <div
          className="fixed inset-0 z-40 bg-black/50 lg:hidden"
          onClick={() => setIsOpen(false)}
        />
      )}

      <aside
        className={`fixed left-0 top-0 z-40 h-full w-64 bg-white shadow-md transition-transform lg:translate-x-0 ${
          isOpen ? 'translate-x-0' : '-translate-x-full'
        }`}
      >
        <div className="flex h-full flex-col">
          <div className="flex h-16 items-center justify-center border-b">
            <Link to="/dashboard" className="flex items-center gap-2">
              <PawPrint className="h-8 w-8 text-primary" />
              <span className="text-xl font-bold text-foreground">MediPet</span>
            </Link>
          </div>

          <nav className="flex-1 space-y-1 p-4">
            {filteredNavItems.map((item) => {
              const isActive = location.pathname === item.to;
              return (
                <Link
                  key={item.to}
                  to={item.to}
                  onClick={() => setIsOpen(false)}
                  className={`flex items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium transition-colors ${
                    isActive
                      ? 'bg-primary text-primary-foreground'
                      : 'text-muted-foreground hover:bg-muted hover:text-foreground'
                  }`}
                >
                  <item.icon size={18} />
                  {item.label}
                </Link>
              );
            })}
          </nav>

          <div className="border-t p-4">
            <div className="mb-3 text-sm">
              <p className="font-medium text-foreground">{user?.email}</p>
              <p className="text-muted-foreground">{user?.role}</p>
            </div>
            <button
              onClick={handleLogout}
              className="flex w-full items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium text-muted-foreground hover:bg-destructive/10 hover:text-destructive"
            >
              <LogOut size={18} />
              Cerrar sesión
            </button>
          </div>
        </div>
      </aside>
    </>
  );
}
