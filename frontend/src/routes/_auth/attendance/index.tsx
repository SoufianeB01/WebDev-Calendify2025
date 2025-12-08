import React from 'react'
import { createFileRoute } from '@tanstack/react-router'

export const Route = createFileRoute('/_auth/attendance/')({
  component: RouteComponent,
})

interface State {
  attendance: Array<any>
  loading: boolean
  error: string | null
}

const API_BASE = 'http://localhost:5143'

class AttendancePage extends React.Component<{}, State> {
  state: State = { attendance: [], loading: true, error: null }

  componentDidMount() {
    fetch(`${API_BASE}/api/attendance`, { credentials: 'include' })
      .then(res => res.json().then(body => ({ ok: res.ok, body })).catch(() => ({ ok: res.ok, body: null })))
      .then(({ ok, body }) => {
        if (!ok) {
          this.setState({ error: body?.message || 'Failed to load attendance', loading: false })
          return
        }
        this.setState({ attendance: body, loading: false })
      })
      .catch(e => this.setState({ error: e.message, loading: false }))
  }

  render() {
    const { loading, error, attendance } = this.state

    return (
      <div className="p-6">
        <h1 className="text-2xl font-semibold text-teal-700 mb-6">Attendance</h1>

        {loading && <div>Loading...</div>}
        {error && <div className="text-red-600">{error}</div>}

        {!loading && !error && (
          <table className="w-full border text-left">
            <thead className="bg-gray-100">
              <tr>
                <th className="p-2 border">ID</th>
                <th className="p-2 border">UserId</th>
                <th className="p-2 border">Date</th>
                <th className="p-2 border">Status</th>
              </tr>
            </thead>
            <tbody>
              {attendance.map((a: any) => (
                <tr key={a.attendanceId}>
                  <td className="p-2 border">{a.attendanceId}</td>
                  <td className="p-2 border">{a.userId}</td>
                  <td className="p-2 border">{a.date}</td>
                  <td className="p-2 border">{a.status}</td>
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
  return <AttendancePage />
}
