import React from 'react'

const API_BASE = 'http://localhost:5143'

interface ProfileBarProps {}
interface ProfileBarState {
  loading: boolean
  error: string | null
  name: string | null
  email: string | null
  role: string | null
}

export default class ProfileBar extends React.Component<ProfileBarProps, ProfileBarState> {
  constructor(props: ProfileBarProps) {
    super(props)
    this.state = { loading: false, error: null, name: null, email: null, role: null }
  }

  componentDidMount() {
    this.setState({ loading: true, error: null })
    fetch(`${API_BASE}/api/auth/me`, { method: 'GET', mode: 'cors', credentials: 'include' })
      .then(res =>
        res
          .json()
          .then(body => ({ ok: res.ok, body }))
          .catch(() => ({ ok: res.ok, body: null }))
      )
      .then(({ ok, body }) => {
        if (!ok || !body) {
          this.setState({ error: 'No session', loading: false })
          return
        }
        this.setState({ email: body.email || null, role: body.role || null, name: body.email || null, loading: false })
      })
      .catch(err => this.setState({ error: err.message || 'Server error', loading: false }))
  }

  render() {
    const { name, role } = this.state
    return (
      <div className="w-full bg-card p-4 border-b flex items-center gap-4">
        <div className="w-10 h-10 rounded-full bg-muted" />
        <div className="flex flex-col">
          <span className="text-foreground font-semibold">{name || 'Anoniem'}</span>
          <span className="text-muted-foreground text-sm">{role || '-'}</span>
        </div>
      </div>
    )
  }
}
