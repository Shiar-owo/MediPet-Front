import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { AuthProvider } from '@/shared/context/AuthContext';
import { ToastProvider } from '@/shared/components/shared/Toast';
import { ProtectedRoute } from '@/shared/routes/ProtectedRoute';
import { LoginPage } from '@/features/auth';
import { DashboardPage } from '@/features/dashboard';
import { ClientListPage, ClientFormPage, ClientDetailPage } from '@/features/clients';
import { PetListPage, PetFormPage, PetDetailPage } from '@/features/pets';
import { AppointmentListPage, AppointmentFormPage, AppointmentDetailPage } from '@/features/appointments';
import { ConsultationListPage, ConsultationFormPage } from '@/features/consultations';
import { UserListPage, UserFormPage, UserDetailPage } from '@/features/users';

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      retry: 1,
      refetchOnWindowFocus: false,
    },
  },
});

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <ToastProvider>
        <AuthProvider>
          <BrowserRouter>
          <Routes>
            <Route path="/login" element={<LoginPage />} />

            <Route
              path="/dashboard"
              element={
                <ProtectedRoute>
                  <DashboardPage />
                </ProtectedRoute>
              }
            />

            <Route
              path="/clients"
              element={
                <ProtectedRoute>
                  <ClientListPage />
                </ProtectedRoute>
              }
            />
            <Route
              path="/clients/new"
              element={
                <ProtectedRoute>
                  <ClientFormPage />
                </ProtectedRoute>
              }
            />
            <Route
              path="/clients/:id"
              element={
                <ProtectedRoute>
                  <ClientDetailPage />
                </ProtectedRoute>
              }
            />
            <Route
              path="/clients/:id/edit"
              element={
                <ProtectedRoute>
                  <ClientFormPage />
                </ProtectedRoute>
              }
            />

            <Route
              path="/pets"
              element={
                <ProtectedRoute>
                  <PetListPage />
                </ProtectedRoute>
              }
            />
            <Route
              path="/pets/new"
              element={
                <ProtectedRoute>
                  <PetFormPage />
                </ProtectedRoute>
              }
            />
            <Route
              path="/pets/:id"
              element={
                <ProtectedRoute>
                  <PetDetailPage />
                </ProtectedRoute>
              }
            />
            <Route
              path="/pets/:id/edit"
              element={
                <ProtectedRoute>
                  <PetFormPage />
                </ProtectedRoute>
              }
            />

            <Route
              path="/appointments"
              element={
                <ProtectedRoute>
                  <AppointmentListPage />
                </ProtectedRoute>
              }
            />
            <Route
              path="/appointments/new"
              element={
                <ProtectedRoute>
                  <AppointmentFormPage />
                </ProtectedRoute>
              }
            />
            <Route
              path="/appointments/:id"
              element={
                <ProtectedRoute>
                  <AppointmentDetailPage />
                </ProtectedRoute>
              }
            />
            <Route
              path="/appointments/:id/edit"
              element={
                <ProtectedRoute>
                  <AppointmentFormPage />
                </ProtectedRoute>
              }
            />

            <Route
              path="/appointments/:appointmentId/consultation"
              element={
                <ProtectedRoute allowedRoles={['ADMIN', 'VETERINARIO']}>
                  <ConsultationFormPage />
                </ProtectedRoute>
              }
            />

            <Route
              path="/consultations"
              element={
                <ProtectedRoute>
                  <ConsultationListPage />
                </ProtectedRoute>
              }
            />

            <Route
              path="/users"
              element={
                <ProtectedRoute allowedRoles={['ADMIN']}>
                  <UserListPage />
                </ProtectedRoute>
              }
            />
            <Route
              path="/users/new"
              element={
                <ProtectedRoute allowedRoles={['ADMIN']}>
                  <UserFormPage />
                </ProtectedRoute>
              }
            />
            <Route
              path="/users/:id"
              element={
                <ProtectedRoute allowedRoles={['ADMIN']}>
                  <UserDetailPage />
                </ProtectedRoute>
              }
            />
            <Route
              path="/users/:id/edit"
              element={
                <ProtectedRoute allowedRoles={['ADMIN']}>
                  <UserFormPage />
                </ProtectedRoute>
              }
            />

            <Route path="/" element={<Navigate to="/dashboard" replace />} />
            <Route path="*" element={<Navigate to="/dashboard" replace />} />
          </Routes>
        </BrowserRouter>
      </AuthProvider>
      </ToastProvider>
    </QueryClientProvider>
  );
}

export default App;
