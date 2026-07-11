import { type ReactNode } from 'react';
import { PawPrint } from 'lucide-react';

interface AuthLayoutProps {
  children: ReactNode;
  title?: string;
}

export function AuthLayout({ children, title }: AuthLayoutProps) {
  return (
    <div className="flex min-h-screen items-center justify-center bg-background p-4">
      <div className="w-full max-w-md">
        <div className="mb-8 text-center">
          <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-primary/10">
            <PawPrint className="h-8 w-8 text-primary" />
          </div>
          <h1 className="text-2xl font-bold text-foreground">MediPet</h1>
          {title && <p className="mt-1 text-muted-foreground">{title}</p>}
        </div>
        <div className="rounded-lg border bg-white p-6 shadow-sm">
          {children}
        </div>
      </div>
    </div>
  );
}
