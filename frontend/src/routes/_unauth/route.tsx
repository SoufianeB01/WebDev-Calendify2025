import { Outlet, createFileRoute, redirect } from '@tanstack/react-router';

const API_BASE = import.meta.env.VITE_API_URL || 'http://localhost:5143';

export const Route = createFileRoute('/_unauth')({
  component: RouteComponent,
  beforeLoad: async ({ context }) => {
    const authData = await context.queryClient.ensureQueryData({
      queryKey: ['auth', 'me'],
      queryFn: async () => {
        try {
          const response = await fetch(`${API_BASE}/api/auth/me`, {
            credentials: 'include',
          });
          if (!response.ok) return null;
          return response.json();
        } catch (err) {
          console.error('Auth check failed:', err);
          return null;
        }
      },
      staleTime: 5 * 60 * 1000,
    });

    if (authData) {
      throw redirect({
        to: '/events',
      });
    }
  },
});

function RouteComponent() {
  return (
    <main className="flex justify-center items-center w-full px-4 py-8 min-h-screen">
      <Outlet />
    </main>
  );
}