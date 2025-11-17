import { createFileRoute } from '@tanstack/react-router';
import Dashboard from '@/components/Dashboard';

export const Route = createFileRoute(
  '/_auth/dashboard/',
)({
  component: RouteComponent,
});

function RouteComponent() {
  return (
    <div className="flex flex-col max-sm:flex-wrap gap-8 justify-start">
      <Dashboard />
    </div>
  );
}
