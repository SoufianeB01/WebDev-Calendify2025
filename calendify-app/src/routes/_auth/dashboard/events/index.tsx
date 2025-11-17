import { createFileRoute } from '@tanstack/react-router'

export const Route = createFileRoute('/_auth/dashboard/events/')({
  component: RouteComponent,
})

function RouteComponent() {
  return <div> overview all events, form to submit a new calender event, delete events, list of attendees signed up events
    <p> event title 
      description
      event_date
      created_by
      
      </p> </div>
}
