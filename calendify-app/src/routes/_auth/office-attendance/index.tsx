import { createFileRoute } from '@tanstack/react-router'

export const Route = createFileRoute('/_auth/office-attendance/')({
  component: RouteComponent,
})

function RouteComponent() {
  return <div>Hello "/_auth/office-attendance/"!</div>
}
