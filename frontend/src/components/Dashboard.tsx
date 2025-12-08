import React from 'react'
import { EventCalendar, type CalendarEvent } from '@/components/event-calendar'


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

interface DashboardProps {}
interface DashboardState {
  loading: boolean
  error: string | null
  events: Array<CalendarEvent>
  userId: number | null
}

export default class Dashboard extends React.Component<DashboardProps, DashboardState> {
  constructor(props: DashboardProps) {
    super(props)
    this.state = { loading: false, error: null, events: [], userId: null }
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
          .then(body => ({ ok: res.ok, status: res.status, body }))
          .catch(() => ({ ok: res.ok, status: res.status, body: null }))
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
          .then(body => ({ ok: res.ok, status: res.status, body }))
          .catch(() => ({ ok: res.ok, status: res.status, body: [] }))
      )
      .then(({ ok, body }) => {
        if (!ok) {
          this.setState({ error: 'Failed to load events', loading: false })
          return
        }
        const items: EventItem[] = Array.isArray(body?.events) ? body.events : Array.isArray(body) ? body : []
        const toDate = (dateStr?: string, timeStr?: string) => {
          if (!dateStr) return new Date()
          if (!timeStr) return new Date(dateStr)
          return new Date(`${dateStr}T${timeStr}`)
        }
        const events: Array<CalendarEvent> = items.map(e => ({
          id: String(e.eventId),
          title: e.title,
          description: e.description,
          start: toDate(e.eventDate, e.startTime),
          end: toDate(e.eventDate, e.endTime),
          color: 'violet' as EventColor
        }))
        this.setState({ events, loading: false })
      })
      .catch(err => this.setState({ error: err.message || 'Server error', loading: false }))
  }

  addEvent = (payload: Omit<EventItem, 'eventId'>) => {
    fetch(`${API_BASE}/api/events`, {
      method: 'POST',
      mode: 'cors',
      credentials: 'include',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload)
    })
      .then(res =>
        res
          .json()
          .then(body => ({ ok: res.ok, status: res.status, body }))
          .catch(() => ({ ok: res.ok, status: res.status, body: null }))
      )
      .then(({ ok }) => {
        if (!ok) return
        this.loadEvents()
      })
      .catch(() => {})
  }

  updateEvent = (id: number, payload: EventItem) => {
    fetch(`${API_BASE}/api/events/${id}`, {
      method: 'PUT',
      mode: 'cors',
      credentials: 'include',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload)
    })
      .then(res => res.json().catch(() => null))
      .then(() => this.loadEvents())
      .catch(() => {})
  }

  deleteEvent = (id: number) => {
    fetch(`${API_BASE}/api/events/${id}`, { method: 'DELETE', mode: 'cors', credentials: 'include' })
      .then(res => res.json().catch(() => null))
      .then(() => this.loadEvents())
      .catch(() => {})
  }

  handleEventAdd = () => {
    const { userId } = this.state
    if (!userId) return
    const now = new Date()
    const startIso = now.toISOString().slice(0, 19) + 'Z'
    const payload: Omit<EventItem, 'eventId'> = {
      title: 'New Event',
      description: 'Details',
      eventDate: startIso,
      startTime: undefined,
      endTime: undefined,
      location: 'Office',
      createdBy: userId
    }
    this.addEvent(payload)
  }

  handleEventUpdate = (ev: CalendarEvent) => {
    const { userId } = this.state
    if (!userId) return
    const payload: EventItem = {
      eventId: Number(ev.id),
      title: ev.title,
      description: ev.description,
      eventDate: ev.start.toISOString(),
      startTime: undefined,
      endTime: undefined,
      location: 'Office',
      createdBy: userId
    }
    this.updateEvent(Number(ev.id), payload)
  }

  handleEventDelete = (ev: CalendarEvent) => {
    this.deleteEvent(Number(ev.id))
  }

  render() {
    const { events, loading, error } = this.state
    return (
      <div className="p-6">
        <div className="mb-4 flex items-center justify-between">
          <h1 className="text-xl font-semibold text-foreground">Dashboard</h1>
          <button
            type="button"
            onClick={this.handleEventAdd}
            className="fixed bottom-6 right-6 bg-emerald-700 hover:bg-emerald-800 text-white px-5 py-3 rounded-full shadow border-2 border-emerald-900"
          >
            +
          </button>
        </div>
        {loading && <div className="text-muted-foreground">Loading...</div>}
        {error && <div className="text-destructive">{error}</div>}
        <EventCalendar
          events={events}
          onEventAdd={(event: CalendarEvent) => {
            this.handleEventAdd()
          }}
          onEventUpdate={(event: CalendarEvent) => {
            this.handleEventUpdate(event)
          }}
          onEventDelete={this.handleEventDelete as any}
        />
      </div>
    )
  }
}
