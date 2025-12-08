import React from 'react'
import { createFileRoute } from '@tanstack/react-router'

export const Route = createFileRoute('/_auth/admin/')({
  component: RouteComponent,
})

interface State {
  admins: Array<any>
  loading: boolean
  error: string | null
}

const API_BASE = 'http://localhost:5143'

class AdminPage extends React.Component<{}, State> {
  state: State = { admins: [], loading: true, error: null }

  componentDidMount() {
    fetch(`${API_BASE}/api/admin`, { credentials: 'include' })
      .then(res =>
        res.json().then(body => ({ ok: res.ok, status: res.status, body })).catch(() => ({ ok: res.ok, body: null })),
      )
      .then(({ ok, body }) => {
        if (!ok) {
          this.setState({ error: body?.message || 'Failed to load admins', loading: false })
          return
        }
        this.setState({ admins: body, loading: false })
      })
      .catch(e => this.setState({ error: e.message, loading: false }))
  }

  render() {
    const { loading, error, admins } = this.state

    return (
      <div className="p-6">
        <h1 className="text-2xl font-semibold text-teal-700 mb-6">Admins</h1>

        {loading && <div>Loading...</div>}
        {error && <div className="text-red-600">{error}</div>}

        {!loading && !error && (
          <table className="w-full border text-left">
            <thead className="bg-gray-100">
              <tr>
                <th className="p-2 border">AdminId</th>
                <th className="p-2 border">UserId</th>
                <th className="p-2 border">Permissions</th>
              </tr>
            </thead>
            <tbody>
              {admins.map((a: any) => (
                <tr key={a.adminId}>
                  <td className="p-2 border">{a.adminId}</td>
                  <td className="p-2 border">{a.userId}</td>
                  <td className="p-2 border">{a.permissions}</td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    )
  }
}

function RouteComponent() {
  return <AdminPage />
}
