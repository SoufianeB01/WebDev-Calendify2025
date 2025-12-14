import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useState } from "react";

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

  useEffect(() => {
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

  console.log(calendarEvents)

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
