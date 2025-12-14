import { Outlet, createFileRoute, redirect } from '@tanstack/react-router';

export const Route = createFileRoute('/_unauth')({
  component: RouteComponent,
  beforeLoad: ({ location }) => {
    if (localStorage.getItem('isAuthenticated') === 'true') {
      throw redirect({
        to: '/events',
        search: {
          redirectPath: location.href,
        },
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