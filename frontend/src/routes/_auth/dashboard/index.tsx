import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useState } from "react";
// import { useQuery } from "@tanstack/react-query";

import type { Event } from "@/types/Event";
import type { CalendarEvent } from "@/components/event-calendar";
import mockData from "@/data/mock.json";
import { CalendarTable } from "@/components/calender-table";
import { Card, CardContent } from "@/components/ui/card";

export const Route = createFileRoute("/_auth/dashboard/")({
  component: RouteComponent,
});

function RouteComponent() {
  const [calendarEvents, setCalendarEvents] = useState<Array<CalendarEvent>>([]);

  // TODO: Uncomment when backend endpoint is ready
  // Fetch events 
  // const { data: eventsData } = useQuery({
  //   queryKey: ['events'],
  //   queryFn: async () => {
  //     const API_BASE = import.meta.env.VITE_API_URL || 'http://localhost:5143';
  //     const response = await fetch(`${API_BASE}/api/events`, {
  //       mode: 'cors',
  //       credentials: 'include',
  //     });
  //     if (!response.ok) throw new Error('Failed to fetch events');
  //     return response.json();
  //   },
  // });

  useEffect(() => {
    // TODO: Uncomment when backend endpoint is ready and using useQuery above
    // if (eventsData) {
    //   const convertedEvents: Array<CalendarEvent> = eventsData.map((event: Event) => ({
    //     id: event.eventId.toString(),
    //     title: event.title,
    //     description: event.description,
    //     start: new Date(event.eventDate + 'T' + event.startTime),
    //     end: new Date(event.eventDate + 'T' + event.endTime),
    //     allDay: false,
    //     color: 'sky' as const,
    //   }));
    //   setCalendarEvents(convertedEvents);
    // }

    // Convert Event type to CalendarEvent type for the calendar component
    const convertedEvents: Array<CalendarEvent> = (mockData.events as Array<Event>).map(event => ({
      id: event.eventId.toString(),
      title: event.title,
      description: event.description,
      start: new Date(event.eventDate + 'T' + event.startTime),
      end: new Date(event.eventDate + 'T' + event.endTime),
      allDay: false,
      color: 'sky' as const,
    }));
    setCalendarEvents(convertedEvents);
  }, []);

  return (
    <div className="container mx-auto p-6">
      <div className="mb-6">
        <h1 className="text-3xl font-bold mb-2">Dashboard</h1>
        <p className="text-muted-foreground">
          Welkom! Bekijk hieronder uw aankomende evenementen.
        </p>
      </div>
      <Card>
        <CardContent className="mt-7">
          <CalendarTable.Header events={calendarEvents} />
        </CardContent>
      </Card>
    </div>
  );
}
