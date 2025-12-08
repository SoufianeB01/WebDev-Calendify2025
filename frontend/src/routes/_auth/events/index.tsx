import React from 'react'
import { createFileRoute } from '@tanstack/react-router'

export const Route = createFileRoute('/_auth/events/')({
  component: RouteComponent,
})

interface State {
  events: Array<any>
  loading: boolean
  error: string | null
}

const API_BASE = 'http://localhost:5143'

class EventsPage extends React.Component<{}, State> {
  state: State = { events: [], loading: true, error: null }

  componentDidMount() {
    fetch(`${API_BASE}/api/events`, {
      credentials: 'include',
    })
      .then(res =>
        res.json().then(body => ({ ok: res.ok, body })).catch(() => ({ ok: res.ok, body: null })),
      )
      .then(({ ok, body }) => {
        if (!ok) {
          this.setState({ error: body?.message || 'Failed to load events', loading: false })
          return
        }

        const events = Array.isArray(body)
          ? body
          : Array.isArray(body?.events)
          ? body.events
          : []

        this.setState({ events, loading: false })
      })
      .catch(e => this.setState({ error: e.message, loading: false }))
  }

  render() {
    const { loading, error, events } = this.state

    return (
      <div className="p-6">
        <h1 className="text-2xl font-semibold text-teal-700 mb-6">Events</h1>

        {loading && <div>Loading...</div>}
        {error && <div className="text-red-600">{error}</div>}

        {!loading && !error && (
          <table className="w-full border text-left">
            <thead className="bg-gray-100">
              <tr>
                <th className="p-2 border">ID</th>
                <th className="p-2 border">Title</th>
                <th className="p-2 border">Description</th>
                <th className="p-2 border">Date</th>
                <th className="p-2 border">CreatedBy</th>
              </tr>
            </thead>
            <tbody>
              {events.map((e: any) => (
                <tr key={e.eventId}>
                  <td className="p-2 border">{e.eventId}</td>
                  <td className="p-2 border">{e.title}</td>
                  <td className="p-2 border">{e.description}</td>
                  <td className="p-2 border">{e.eventDate}</td>
                  <td className="p-2 border">{e.createdBy}</td>
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
  return <EventsPage />
}