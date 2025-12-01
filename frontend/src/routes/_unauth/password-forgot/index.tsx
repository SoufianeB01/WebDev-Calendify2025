import { createFileRoute } from '@tanstack/react-router'

export const Route = createFileRoute('/_unauth/password-forgot/')({
  component: RouteComponent,
})

function RouteComponent() {
  return <div>Hello "/_unauth/password-forgot/"!</div>
}
