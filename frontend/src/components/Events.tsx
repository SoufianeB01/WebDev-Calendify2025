import React from 'react'

const API_BASE = 'http://localhost:5143'

type EventItem = {
  eventId: number
  title: string
  description?: string
  eventDate: string
  startTime?: string
  endTime?: string
  location?: string
  createdBy: number
}

interface EventsProps {}
interface EventsState {
  loading: boolean
  error: string | null
  items: EventItem[]
  userId: number | null
}

export default class Events extends React.Component<EventsProps, EventsState> {
  constructor(props: EventsProps) {
    super(props)
    this.state = { loading: false, error: null, items: [], userId: null }
  }

  componentDidMount() {
    this.fetchMe().then(() => this.loadEvents())
  }

  fetchMe = () => {
    this.setState({ loading: true, error: null })
    return fetch(`${API_BASE}/api/auth/me`, { method: 'GET', mode: 'cors', credentials: 'include' })
      .then(res =>
        res
          .json()
          .then(body => ({ ok: res.ok, body }))
          .catch(() => ({ ok: res.ok, body: null }))
      )
      .then(({ ok, body }) => {
        if (!ok || !body?.userId) {
          this.setState({ error: 'No session', loading: false })
          return
        }
        this.setState({ userId: body.userId, loading: false })
      })
      .catch(err => this.setState({ error: err.message || 'Server error', loading: false }))
  }

  loadEvents = () => {
    const { userId } = this.state
    if (!userId) return
    this.setState({ loading: true, error: null })
    fetch(`${API_BASE}/api/events/user/${userId}`, { method: 'GET', mode: 'cors', credentials: 'include' })
      .then(res =>
        res
          .json()
          .then(body => ({ ok: res.ok, body }))
          .catch(() => ({ ok: res.ok, body: [] }))
      )
      .then(({ ok, body }) => {
        if (!ok) {
          this.setState({ error: 'Failed to load events', loading: false })
          return
        }
        const items: EventItem[] = Array.isArray(body?.events) ? body.events : Array.isArray(body) ? body : []
        this.setState({ items, loading: false })
      })
      .catch(err => this.setState({ error: err.message || 'Server error', loading: false }))
  }

  deleteEvent = (id: number) => {
    fetch(`${API_BASE}/api/events/${id}`, { method: 'DELETE', mode: 'cors', credentials: 'include' })
      .then(res => res.json().catch(() => null))
      .then(() => this.loadEvents())
      .catch(() => {})
  }

  render() {
    const { loading, error, items } = this.state
    return (
      <div className="p-6">
        <h2 className="text-xl font-semibold mb-4">Evenementen</h2>
        {loading && <div className="text-muted-foreground">Loading...</div>}
        {error && <div className="text-destructive">{error}</div>}
        <div className="rounded-2xl border overflow-hidden">
          <table className="w-full">
            <thead className="bg-background">
              <tr>
                <th className="text-left p-3">Titel</th>
                <th className="text-left p-3">Datum</th>
                <th className="text-left p-3">Locatie</th>
                <th className="text-left p-3">Acties</th>
              </tr>
            </thead>
            <tbody>
              {items.map(e => (
                <tr key={e.eventId} className="border-t">
                  <td className="p-3">{e.title}</td>
                  <td className="p-3">{new Date(e.eventDate).toLocaleString()}</td>
                  <td className="p-3">{e.location || '-'}</td>
                  <td className="p-3">
                    <button
                      className="px-3 py-1 mr-2 rounded border bg-emerald-700 text-white"
                      onClick={() => {}}
                    >
                      Bekijken
                    </button>
                    <button
                      className="px-3 py-1 mr-2 rounded border bg-indigo-700 text-white"
                      onClick={() => {}}
                    >
                      Bewerken
                    </button>
                    <button
                      className="px-3 py-1 rounded border bg-red-700 text-white"
                      onClick={() => this.deleteEvent(e.eventId)}
                    >
                      Verwijderen
                    </button>
                  </td>
                </tr>
              ))}
              {items.length === 0 && (
                <tr>
                  <td className="p-3 text-muted-foreground" colSpan={4}>Geen evenementen</td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    )
  }
}
