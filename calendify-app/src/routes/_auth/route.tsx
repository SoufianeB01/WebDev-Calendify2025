import { Outlet, createFileRoute, redirect } from '@tanstack/react-router';
import { Button } from '@/components/ui/button';

export const Route = createFileRoute('/_auth')({
    component: RouteComponent,
    beforeLoad: ({ location }) => {
        if (!(localStorage.getItem('isAuthenticated') === 'true')) {
            throw redirect({
                to: '/login',
                search: {
                    redirectPath: location.href,
                },
            });
        }
    },
});

function RouteComponent() {

    const navigate = Route.useNavigate();
    return (<>
        <Button
            onClick={() => {
                localStorage.removeItem('isAuthenticated');
                navigate({ to: '/' });
            }}
            children="Logout"
        />
          <Button
            onClick={() => {
                navigate({ to: '/test' });
            }}
            children="Test"
        />
        <Outlet />
    </>);
}
