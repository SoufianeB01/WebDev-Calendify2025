import { createFileRoute } from '@tanstack/react-router'

export const Route = createFileRoute('/_auth/dashboard/room/')({
  component: RouteComponent,
})

function RouteComponent() {
  return <div>boek een meeting
    overzicht beschikbare kamers

    booking_date
    start_time
    end_time
    description
    room_booking
    room_capacity
    location
  </div>
}
