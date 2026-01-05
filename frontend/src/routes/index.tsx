import { createFileRoute, redirect } from "@tanstack/react-router";

const API_BASE = import.meta.env.VITE_API_URL || 'http://localhost:5143';

export const Route = createFileRoute("/")({
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

    throw redirect({ to: authData ? "/events" : "/login" });
  },
});
