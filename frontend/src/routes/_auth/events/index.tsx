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
         <table className="w-full bg-white text-teal-800">
          <thead className="bg-teal-100">
            <tr>
              <th className="p-2">ID</th>
              <th className="p-2">Title</th>
              <th className="p-2">Description</th>
              <th className="p-2">Date</th>
              <th className="p-2">Created By</th>
            </tr>
          </thead>

          {events.map((e: any) => (
            <tr key={e.eventId} className="even:bg-gray-50">
              <td className="p-2">{e.eventId}</td>
              <td className="p-2">{e.title}</td>
              <td className="p-2">{e.description}</td>
              <td className="p-2">{e.eventDate}</td>
              <td className="p-2">{e.createdBy}</td>
            </tr>
          ))}
        </table>
        )}
      </div>
    )
  }
}

function RouteComponent() {
  return <EventsPage />
}