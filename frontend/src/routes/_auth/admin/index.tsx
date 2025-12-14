import { createFileRoute } from "@tanstack/react-router";
// import { useMutation, useQueryClient } from "@tanstack/react-query";
import { useState } from "react";
import { CalendarIcon, ClockIcon, MapPinIcon, PencilIcon, PlusIcon, TrashIcon, UsersIcon } from "lucide-react";
import { toast } from "sonner";
import type { Event } from "@/types/Event";
import mockData from "@/data/mock.json";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Textarea } from "@/components/ui/textarea";

export const Route = createFileRoute("/_auth/admin/")({
  component: RouteComponent,
});

function RouteComponent() {
  // Mock events data from JSON
  const [events, setEvents] = useState<Array<Event>>(mockData.events as Array<Event>);
  // const queryClient = useQueryClient();

  const [selectedEvent, setSelectedEvent] = useState<Event | null>(null);
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [isAttendeesDialogOpen, setIsAttendeesDialogOpen] = useState(false);
  const [attendees, setAttendees] = useState<Array<string>>([]);

  const [formData, setFormData] = useState<Partial<Event>>({
    title: "",
    description: "",
    eventDate: "",
    startTime: "",
    endTime: "",
    location: "",
  });

  // const addEventMutation = useMutation({
  //   mutationFn: async (data: Partial<Event>) => {
  //     const API_BASE = import.meta.env.VITE_API_URL || 'http://localhost:5143';
  //     const response = await fetch(`${API_BASE}/api/events`, {
  //       method: 'POST',
  //       mode: 'cors',
  //       credentials: 'include',
  //       headers: { 'Content-Type': 'application/json' },
  //       body: JSON.stringify(data),
  //     });
  //     if (!response.ok) throw new Error('Failed to create event');
  //     return response.json();
  //   },
  // });

  // const updateEventMutation = useMutation({
  //   mutationFn: async ({ eventId, data }: { eventId: number; data: Partial<Event> }) => {
  //     const API_BASE = import.meta.env.VITE_API_URL || 'http://localhost:5143';
  //     const response = await fetch(`${API_BASE}/api/events/${eventId}`, {
  //       method: 'PUT',
  //       mode: 'cors',
  //       credentials: 'include',
  //       headers: { 'Content-Type': 'application/json' },
  //       body: JSON.stringify(data),
  //     });
  //     if (!response.ok) throw new Error('Failed to update event');
  //     return response.json();
  //   },
  // });

  // const deleteEventMutation = useMutation({
  //   mutationFn: async (eventId: number) => {
  //     const API_BASE = import.meta.env.VITE_API_URL || 'http://localhost:5143';
  //     const response = await fetch(`${API_BASE}/api/events/${eventId}`, {
  //       method: 'DELETE',
  //       mode: 'cors',
  //       credentials: 'include',
  //     });
  //     if (!response.ok) throw new Error('Failed to delete event');
  //     return eventId;
  //   },
  // });

  const handleAddEvent = (e: React.FormEvent) => {
    e.preventDefault();

    // TODO: Uncomment when backend endpoint is ready
    // addEventMutation.mutate(formData, {
    //   onSuccess: (newEvent) => {
    //     setEvents([...events, newEvent]);
    //     setIsAddDialogOpen(false);
    //     setFormData({});
    //     toast.success("Evenement succesvol aangemaakt");
    //   },
    //   onError: (error) => {
    //     console.error('Error creating event:', error);
    //     toast.error("Fout bij het aanmaken van evenement");
    //   },
    //   onSettled: () => {
    //     queryClient.invalidateQueries({ queryKey: ['events'] });
    //   },
    // });
    // return;

    // Mock add
    const newEvent: Event = {
      ...formData as Event,
      eventId: Math.max(...events.map((evt) => evt.eventId)) + 1,
      createdBy: 1,
    };
    setEvents([...events, newEvent]);
    toast.success("Evenement succesvol aangemaakt (demo)");

    setIsAddDialogOpen(false);
    setFormData({});
  };

  const handleUpdateEvent = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedEvent) return;

    // TODO: Uncomment when backend endpoint is ready
    // updateEventMutation.mutate({ eventId: selectedEvent.eventId, data: formData }, {
    //   onSuccess: (updated) => {
    //     setEvents(events.map(e => e.eventId === selectedEvent.eventId ? updated : e));
    //     setIsEditDialogOpen(false);
    //     setSelectedEvent(null);
    //     setFormData({});
    //     toast.success("Evenement succesvol bijgewerkt");
    //   },
    //   onError: (error) => {
    //     console.error('Error updating event:', error);
    //     toast.error("Fout bij het bijwerken van evenement");
    //   },
    //   onSettled: () => {
    //     queryClient.invalidateQueries({ queryKey: ['events'] });
    //   },
    // });
    // return;

    // Mock update
    setEvents(
      events.map((evt) =>
        evt.eventId === selectedEvent.eventId ? { ...evt, ...formData } : evt
      )
    );
    toast.success("Evenement succesvol bijgewerkt (demo)");

    setIsEditDialogOpen(false);
    setSelectedEvent(null);
    setFormData({});
  };

  const handleDeleteEvent = (eventId: number, eventTitle: string) => {
    if (!confirm(`Weet u zeker dat u "${eventTitle}" wilt verwijderen?`)) return;

    // TODO: Uncomment when backend endpoint is ready
    // deleteEventMutation.mutate(eventId, {
    //   onSuccess: (deletedEventId) => {
    //     setEvents(events.filter(e => e.eventId !== deletedEventId));
    //     toast.success("Evenement succesvol verwijderd");
    //   },
    //   onError: (error) => {
    //     console.error('Error deleting event:', error);
    //     toast.error("Fout bij het verwijderen van evenement");
    //   },
    //   onSettled: () => {
    //     queryClient.invalidateQueries({ queryKey: ['events'] });
    //   },
    // });
    // return;

    // Mock delete
    setEvents(events.filter((e) => e.eventId !== eventId));
    toast.success("Evenement succesvol verwijderd (demo)");
  };

  const handleViewAttendees = () => {
    // TODO: Uncomment when backend endpoint is ready
    // const API_BASE = import.meta.env.VITE_API_URL || 'http://localhost:5143';
    // try {
    //   const response = await fetch(`${API_BASE}/api/events/${eventId}/attendees`, {
    //     method: 'GET',
    //     credentials: 'include',
    //   });
    //   if (!response.ok) throw new Error('Failed to fetch attendees');
    //   const data = await response.json();
    //   setAttendees(data);
    //   setIsAttendeesDialogOpen(true);
    // } catch (error) {
    //   toast.error("Fout bij het ophalen van deelnemers");
    // }

    // Mock attendees from JSON
    const eventAttendees = mockData.attendees
      .filter((a) => a.eventId === 1) // Filter for current event
      .map((a) => `${a.userName} (${a.email})`);
    setAttendees(eventAttendees);
    setIsAttendeesDialogOpen(true);
  };

  return (
    <div className="container mx-auto p-6">
      <div className="flex justify-between items-center mb-6">
        <div>
          <h1 className="text-3xl font-bold">Admin Dashboard</h1>
          <p className="text-muted-foreground">Beheer alle evenementen in het systeem</p>
        </div>
        <Dialog open={isAddDialogOpen} onOpenChange={setIsAddDialogOpen}>
          <DialogTrigger asChild>
            <Button>
              <PlusIcon className="h-4 w-4 mr-2" />
              Nieuw Evenement
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-2xl">
            <form onSubmit={handleAddEvent}>
              <DialogHeader>
                <DialogTitle>Nieuw Evenement Aanmaken</DialogTitle>
                <DialogDescription>
                  Vul de gegevens in voor het nieuwe evenement
                </DialogDescription>
              </DialogHeader>
              <div className="grid gap-4 py-4">
                <div>
                  <Label htmlFor="title">Titel</Label>
                  <Input
                    id="title"
                    value={formData.title || ""}
                    onChange={(e) =>
                      setFormData({ ...formData, title: e.target.value })
                    }
                    required
                  />
                </div>
                <div>
                  <Label htmlFor="description">Beschrijving</Label>
                  <Textarea
                    id="description"
                    value={formData.description || ""}
                    onChange={(e) =>
                      setFormData({ ...formData, description: e.target.value })
                    }
                    required
                  />
                </div>
                <div className="grid grid-cols-3 gap-4">
                  <div>
                    <Label htmlFor="eventDate">Datum</Label>
                    <Input
                      id="eventDate"
                      type="date"
                      value={formData.eventDate || ""}
                      onChange={(e) =>
                        setFormData({ ...formData, eventDate: e.target.value })
                      }
                      required
                    />
                  </div>
                  <div>
                    <Label htmlFor="startTime">Starttijd</Label>
                    <Input
                      id="startTime"
                      type="time"
                      value={formData.startTime || ""}
                      onChange={(e) =>
                        setFormData({ ...formData, startTime: e.target.value })
                      }
                      required
                    />
                  </div>
                  <div>
                    <Label htmlFor="endTime">Eindtijd</Label>
                    <Input
                      id="endTime"
                      type="time"
                      value={formData.endTime || ""}
                      onChange={(e) =>
                        setFormData({ ...formData, endTime: e.target.value })
                      }
                      required
                    />
                  </div>
                </div>
                <div>
                  <Label htmlFor="location">Locatie</Label>
                  <Input
                    id="location"
                    value={formData.location || ""}
                    onChange={(e) =>
                      setFormData({ ...formData, location: e.target.value })
                    }
                    required
                  />
                </div>
              </div>
              <DialogFooter>
                <Button type="submit">Aanmaken</Button>
              </DialogFooter>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Evenementen Overzicht</CardTitle>
          <CardDescription>
            Beheer alle evenementen vanuit deze centrale tabel
          </CardDescription>
        </CardHeader>
        <CardContent>
          {events.length === 0 ? (
            <p className="text-muted-foreground text-center py-8">
              Geen evenementen gevonden
            </p>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Titel</TableHead>
                  <TableHead>Datum</TableHead>
                  <TableHead>Tijd</TableHead>
                  <TableHead>Locatie</TableHead>
                  <TableHead className="text-right">Acties</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {events.map((event) => (
                  <TableRow key={event.eventId}>
                    <TableCell className="font-medium">
                      <div>
                        <div>{event.title}</div>
                        <div className="text-sm text-muted-foreground">
                          {event.description}
                        </div>
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center gap-2">
                        <CalendarIcon className="h-4 w-4 text-muted-foreground" />
                        {new Date(event.eventDate).toLocaleDateString("nl-NL")}
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center gap-2">
                        <ClockIcon className="h-4 w-4 text-muted-foreground" />
                        {event.startTime} - {event.endTime}
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center gap-2">
                        <MapPinIcon className="h-4 w-4 text-muted-foreground" />
                        {event.location}
                      </div>
                    </TableCell>
                    <TableCell className="text-right">
                      <div className="flex gap-2 justify-end">
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={handleViewAttendees}
                        >
                          <UsersIcon className="h-4 w-4 mr-1" />
                          Deelnemers
                        </Button>
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => {
                            setSelectedEvent(event);
                            setFormData(event);
                            setIsEditDialogOpen(true);
                          }}
                        >
                          <PencilIcon className="h-4 w-4" />
                        </Button>
                        <Button
                          size="sm"
                          variant="destructive"
                          onClick={() =>
                            handleDeleteEvent(event.eventId, event.title)
                          }
                        >
                          <TrashIcon className="h-4 w-4" />
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>

      {/* Edit Dialog */}
      <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
        <DialogContent className="max-w-2xl">
          <form onSubmit={handleUpdateEvent}>
            <DialogHeader>
              <DialogTitle>Evenement Bewerken</DialogTitle>
            </DialogHeader>
            <div className="grid gap-4 py-4">
              <div>
                <Label htmlFor="edit-title">Titel</Label>
                <Input
                  id="edit-title"
                  value={formData.title || ""}
                  onChange={(e) =>
                    setFormData({ ...formData, title: e.target.value })
                  }
                  required
                />
              </div>
              <div>
                <Label htmlFor="edit-description">Beschrijving</Label>
                <Textarea
                  id="edit-description"
                  value={formData.description || ""}
                  onChange={(e) =>
                    setFormData({ ...formData, description: e.target.value })
                  }
                  required
                />
              </div>
              <div className="grid grid-cols-3 gap-4">
                <div>
                  <Label htmlFor="edit-eventDate">Datum</Label>
                  <Input
                    id="edit-eventDate"
                    type="date"
                    value={formData.eventDate || ""}
                    onChange={(e) =>
                      setFormData({ ...formData, eventDate: e.target.value })
                    }
                    required
                  />
                </div>
                <div>
                  <Label htmlFor="edit-startTime">Starttijd</Label>
                  <Input
                    id="edit-startTime"
                    type="time"
                    value={formData.startTime || ""}
                    onChange={(e) =>
                      setFormData({ ...formData, startTime: e.target.value })
                    }
                    required
                  />
                </div>
                <div>
                  <Label htmlFor="edit-endTime">Eindtijd</Label>
                  <Input
                    id="edit-endTime"
                    type="time"
                    value={formData.endTime || ""}
                    onChange={(e) =>
                      setFormData({ ...formData, endTime: e.target.value })
                    }
                    required
                  />
                </div>
              </div>
              <div>
                <Label htmlFor="edit-location">Locatie</Label>
                <Input
                  id="edit-location"
                  value={formData.location || ""}
                  onChange={(e) =>
                    setFormData({ ...formData, location: e.target.value })
                  }
                  required
                />
              </div>
            </div>
            <DialogFooter>
              <Button type="submit">Opslaan</Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      {/* Attendees Dialog */}
      <Dialog open={isAttendeesDialogOpen} onOpenChange={setIsAttendeesDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Deelnemers</DialogTitle>
            <DialogDescription>
              Overzicht van alle ingeschreven deelnemers voor dit evenement
            </DialogDescription>
          </DialogHeader>
          <div className="py-4">
            {attendees.length === 0 ? (
              <p className="text-muted-foreground text-center py-4">
                Geen deelnemers ingeschreven
              </p>
            ) : (
              <ul className="space-y-2">
                {attendees.map((attendee, index) => (
                  <li
                    key={index}
                    className="flex items-center gap-2 p-2 rounded bg-muted"
                  >
                    <UsersIcon className="h-4 w-4 text-muted-foreground" />
                    {attendee}
                  </li>
                ))}
              </ul>
            )}
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
