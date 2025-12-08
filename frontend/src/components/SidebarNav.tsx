import React from 'react'
import { Link } from '@tanstack/react-router'

export default class SidebarNav extends React.Component {
  render() {
    return (
      <div className="w-64 border-r bg-card text-foreground">
        <nav className="flex flex-col p-4 gap-2">
          <Link to="/_auth/dashboard/" className="px-3 py-2 rounded hover:bg-muted">Dashboard</Link>
          <Link to="/_auth/events/" className="px-3 py-2 rounded hover:bg-muted">Evenementen</Link>
          <Link to="/_auth/attendance/" className="px-3 py-2 rounded hover:bg-muted">Kantoor aanwezigheid</Link>
          <Link to="/_auth/rooms/" className="px-3 py-2 rounded hover:bg-muted">Kamers</Link>
          <Link to="/_auth/users/" className="px-3 py-2 rounded hover:bg-muted">Gebruikers</Link>
          <Link to="/_auth/admin/" className="px-3 py-2 rounded hover:bg-muted">Admin</Link>
        </nav>
      </div>
    )
  }
}
