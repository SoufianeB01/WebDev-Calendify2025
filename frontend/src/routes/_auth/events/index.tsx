import { createFileRoute } from '@tanstack/react-router'

export const Route = createFileRoute('/_auth/events/')({
  component: RouteComponent,
})

function RouteComponent() {
  return <div>Hello "/_auth/events/"!</div>
}
