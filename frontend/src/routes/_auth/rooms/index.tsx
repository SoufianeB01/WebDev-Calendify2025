import React from 'react'
import { createFileRoute } from '@tanstack/react-router'

export const Route = createFileRoute('/_auth/rooms/')({
  component: RouteComponent,
})

interface State {
  rooms: Array<any>
  loading: boolean
  error: string | null
}

const API_BASE = 'http://localhost:5143'

class RoomsPage extends React.Component<{}, State> {
  state: State = { rooms: [], loading: true, error: null }

  componentDidMount() {
    fetch(`${API_BASE}/api/rooms`, { credentials: 'include' })
      .then(res =>
        res.json().then(body => ({ ok: res.ok, body })).catch(() => ({ ok: res.ok, body: null })),
      )
      .then(({ ok, body }) => {
        if (!ok) {
          this.setState({ error: body?.message || 'Failed to load rooms', loading: false })
          return
        }
        this.setState({ rooms: body, loading: false })
      })
      .catch(e => this.setState({ error: e.message, loading: false }))
  }

  render() {
    const { loading, error, rooms } = this.state

    return (
      <div className="p-6">
        <h1 className="text-2xl font-semibold text-teal-700 mb-6">Rooms</h1>

        {loading && <div>Loading...</div>}
        {error && <div className="text-red-600">{error}</div>}

        {!loading && !error && (
          <table className="w-full border text-left">
            <thead className="bg-gray-100">
              <tr>
                <th className="p-2 border">RoomId</th>
                <th className="p-2 border">Name</th>
                <th className="p-2 border">Capacity</th>
              </tr>
            </thead>
            <tbody>
              {rooms.map((r: any) => (
                <tr key={r.roomId}>
                  <td className="p-2 border">{r.roomId}</td>
                  <td className="p-2 border">{r.name}</td>
                  <td className="p-2 border">{r.capacity}</td>
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
  return <RoomsPage />
}
