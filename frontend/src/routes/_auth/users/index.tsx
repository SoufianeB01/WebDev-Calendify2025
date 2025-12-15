import React from 'react'
import { createFileRoute } from '@tanstack/react-router'

export const Route = createFileRoute('/_auth/users/')({
  component: RouteComponent,
})

interface State {
  users: Array<any>
  loading: boolean
  error: string | null
}

const API_BASE = 'http://localhost:5143'

class UsersPage extends React.Component<{}, State> {
  state: State = { users: [], loading: true, error: null }

  componentDidMount() {
    fetch(`${API_BASE}/api/users`, {
      credentials: 'include',
    })
      .then(res =>
        res
          .json()
          .then(body => ({ ok: res.ok, status: res.status, body }))
          .catch(() => ({ ok: res.ok, status: res.status, body: null })),
      )
      .then(({ ok, body }) => {
        if (!ok) {
          this.setState({ error: body?.message || 'Failed to load users', loading: false })
          return
        }
        this.setState({ users: body, loading: false })
      })
      .catch(e => this.setState({ error: e.message, loading: false }))
  }

  render() {
    const { loading, error, users } = this.state

    return (
      <div className="p-6">
        <h1 className="text-2xl font-semibold text-teal-700 mb-6">Users</h1>

        {loading && <div>Loading...</div>}
        {error && <div className="text-red-600">{error}</div>}

        {!loading && !error && (
              <table className="w-full bg-white text-teal-800">
      <thead className="bg-teal-100">
        <tr>
          <th className="p-2">ID</th>
          <th className="p-2">Email</th>
          <th className="p-2">Role</th>
        </tr>
      </thead>

      {users.map((u: any) => (
        <tr key={u.userId} className="even:bg-gray-50">
          <td className="p-2">{u.userId}</td>
          <td className="p-2">{u.email}</td>
          <td className="p-2">{u.role}</td>
        </tr>
      ))}
    </table>
        )}
      </div>
    )
  }
}

function RouteComponent() {
  return <UsersPage />
}
