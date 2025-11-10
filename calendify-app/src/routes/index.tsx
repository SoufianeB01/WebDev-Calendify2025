import { createFileRoute } from '@tanstack/react-router'
import Login from '../components/Login'

export const Route = createFileRoute('/')({
  component: App,
})

function App() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-background">
      <Login />
    </div>
  )
}