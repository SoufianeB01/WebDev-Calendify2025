import { createFileRoute } from '@tanstack/react-router'

export const Route = createFileRoute('/_unauth/password-reset/')({
  component: RouteComponent,
})

function RouteComponent() {
  return <div>Hello "/_unauth/password-reset/"!</div>
}
