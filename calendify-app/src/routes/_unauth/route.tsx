import { Outlet, createFileRoute, redirect } from '@tanstack/react-router';

export const Route = createFileRoute('/_unauth')({
  component: RouteComponent,
  beforeLoad: ({ location }) => {
    if (localStorage.getItem('isAuthenticated') === 'true') {
      throw redirect({
        to: '/dashboard',
        search: {
          redirectPath: location.href,
        },
      });
    }
  },
});

function RouteComponent() {
  return <Outlet />;
}
