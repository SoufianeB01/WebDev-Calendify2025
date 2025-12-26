import { createFileRoute, useNavigate, useSearch } from "@tanstack/react-router";
import { z } from "zod";
// import { useMutation, useQueryClient } from "@tanstack/react-query";
import { useState, useEffect } from "react";
import { CalendarIcon, ClockIcon, MapPinIcon, PencilIcon, PlusIcon, StarIcon, TrashIcon } from "lucide-react";
import { toast } from "sonner";

import type { Event } from "@/types/Event";
import { createEventSchema, rateEventSchema } from "@/types/Event";
import mockData from "@/data/mock.json";
import { useAppForm } from "@/hooks/use-app-form";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

const eventsSearchSchema = z.object({
  status: z.enum(["upcoming", "past"]).optional(),
  location: z.string().optional(),
});

export const Route = createFileRoute(
  '/_auth/events/',
)({
  component: RouteComponent,
  validateSearch: eventsSearchSchema,
});

function RouteComponent() {
  const navigate = useNavigate();
  const search = Route.useSearch();
  // Mock events data from JSON
  const [events, setEvents] = useState<Array<Event>>(mockData.events as Array<Event>);
  // const queryClient = useQueryClient();

  const [isAdmin] = useState(true); // Mock admin status
  const [selectedEvent, setSelectedEvent] = useState<Event | null>(null);
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [isViewDialogOpen, setIsViewDialogOpen] = useState(false);
  const [isRatingDialogOpen, setIsRatingDialogOpen] = useState(false);

  const now = new Date();
  let filteredEvents = events;
  
  if (search.status === "upcoming") {
    filteredEvents = events.filter(e => new Date(e.eventDate) >= now);
  } else if (search.status === "past") {
    filteredEvents = events.filter(e => new Date(e.eventDate) < now);
  }
  
  if (search.location) {
    filteredEvents = filteredEvents.filter(e => 
      e.location.toLowerCase().includes(search.location!.toLowerCase())
    );
  }

  const upcomingEvents = events.filter(e => new Date(e.eventDate) >= now);
  const pastEvents = events.filter(e => new Date(e.eventDate) < now);
  
  useEffect(() => {
    if (search.status) {
    }
  }, [search.status]);

  const addEventForm = useAppForm({
    defaultValues: {
      title: "",
      description: "",
      eventDate: "",
      startTime: "",
      endTime: "",
      location: "",
    },
    onSubmit: ({ value }) => {
      // TODO: Uncomment when backend endpoint is ready
      // addEventMutation.mutate(value, {
      //   onSuccess: (newEvent) => {
      //     setEvents([...events, newEvent]);
      //     setIsAddDialogOpen(false);
      //     addEventForm.reset();
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
        ...value as Event,
        eventId: crypto.randomUUID(),
        createdBy: crypto.randomUUID(),
        adminApproval: false,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
        participants: {},
      };
      setEvents([...events, newEvent]);
      toast.success("Evenement succesvol aangemaakt (demo)");

      setIsAddDialogOpen(false);
      addEventForm.reset();
    },
    validators: {
      onSubmit: createEventSchema,
    },
  });

  const editEventForm = useAppForm({
    defaultValues: {
      title: "",
      description: "",
      eventDate: "",
      startTime: "",
      endTime: "",
      location: "",
    },
    onSubmit: ({ value }) => {
      if (!selectedEvent) return;

      // TODO: Uncomment when backend endpoint is ready
      // updateEventMutation.mutate({ eventId: selectedEvent.eventId, data: value }, {
      //   onSuccess: (updated) => {
      //     setEvents(events.map(e => e.eventId === selectedEvent.eventId ? updated : e));
      //     setIsEditDialogOpen(false);
      //     setSelectedEvent(null);
      //     editEventForm.reset();
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
      setEvents(events.map(evt =>
        evt.eventId === selectedEvent.eventId ? { ...evt, ...value } : evt
      ));
      toast.success("Evenement succesvol bijgewerkt (demo)");

      setIsEditDialogOpen(false);
      setSelectedEvent(null);
      editEventForm.reset();
    },
    validators: {
      onSubmit: createEventSchema,
    },
  });

  const rateEventForm = useAppForm({
    defaultValues: {
      rating: 0,
    },
    onSubmit: ({ value }) => {
      if (!selectedEvent) return;

      // TODO: Uncomment when backend endpoint is ready
      // rateEventMutation.mutate({ eventId: selectedEvent.eventId, rating: value.rating }, {
      //   onSuccess: ({ eventId: ratedEventId, rating: newRating }) => {
      //     setEvents(events.map(e => 
      //       e.eventId === ratedEventId ? { ...e, rating: newRating } : e
      //     ));
      //     setIsRatingDialogOpen(false);
      //     setSelectedEvent(null);
      //     rateEventForm.reset();
      //     toast.success("Evenement succesvol beoordeeld");
      //   },
      //   onError: (error) => {
      //     console.error('Error rating event:', error);
      //     toast.error("Fout bij beoordelen van evenement");
      //   },
      //   onSettled: () => {
      //     queryClient.invalidateQueries({ queryKey: ['events'] });
      //   },
      // });
      // return;

      // Mock rating
      setEvents(events.map(evt =>
        evt.eventId === selectedEvent.eventId ? { ...evt, rating: value.rating } : evt
      ));
      toast.success("Evenement succesvol beoordeeld (demo)");

      setIsRatingDialogOpen(false);
      setSelectedEvent(null);
      rateEventForm.reset();
    },
    validators: {
      onSubmit: rateEventSchema,
    },
  });

  // TanStack Query mutations
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

  // const registerEventMutation = useMutation({
  //   mutationFn: async (eventId: number) => {
  //     const API_BASE = import.meta.env.VITE_API_URL || 'http://localhost:5143';
  //     const response = await fetch(`${API_BASE}/api/events/${eventId}/attend`, {
  //       method: 'POST',
  //       mode: 'cors',
  //       credentials: 'include',
  //     });
  //     if (!response.ok) throw new Error('Failed to register for event');
  //     return eventId;
  //   },
  // });

  // const unregisterEventMutation = useMutation({
  //   mutationFn: async (eventId: number) => {
  //     const API_BASE = import.meta.env.VITE_API_URL || 'http://localhost:5143';
  //     const response = await fetch(`${API_BASE}/api/events/${eventId}/attend`, {
  //       method: 'DELETE',
  //       mode: 'cors',
  //       credentials: 'include',
  //     });
  //     if (!response.ok) throw new Error('Failed to unregister from event');
  //     return eventId;
  //   },
  // });

  // const rateEventMutation = useMutation({
  //   mutationFn: async ({ eventId, rating }: { eventId: number; rating: number }) => {
  //     const API_BASE = import.meta.env.VITE_API_URL || 'http://localhost:5143';
  //     const response = await fetch(`${API_BASE}/api/events/${eventId}/rate`, {
  //       method: 'POST',
  //       mode: 'cors',
  //       credentials: 'include',
  //       headers: { 'Content-Type': 'application/json' },
  //       body: JSON.stringify({ rating }),
  //     });
  //     if (!response.ok) throw new Error('Failed to rate event');
  //     return { eventId, rating };
  //   },
  // });



  const handleDeleteEvent = (eventId: number) => {
    if (!confirm("Weet u zeker dat u dit evenement wilt verwijderen?")) return;

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
    setEvents(events.filter(e => e.eventId !== eventId));
    toast.success("Evenement succesvol verwijderd (demo)");
  };

  const handleRegisterEvent = (eventId: number) => {
    // TODO: Uncomment when backend endpoint is ready
    // registerEventMutation.mutate(eventId, {
    //   onSuccess: (registeredEventId) => {
    //     setEvents(events.map(e => 
    //       e.eventId === registeredEventId ? { ...e, isRegistered: true } : e
    //     ));
    //     toast.success("Succesvol ingeschreven voor evenement");
    //   },
    //   onError: (error) => {
    //     console.error('Error registering for event:', error);
    //     toast.error("Fout bij inschrijven voor evenement");
    //   },
    //   onSettled: () => {
    //     queryClient.invalidateQueries({ queryKey: ['events'] });
    //   },
    // });
    // return;

    // Mock register
    setEvents(events.map(evt =>
      evt.eventId === eventId ? { ...evt, isRegistered: true } : evt
    ));
    toast.success("Succesvol ingeschreven voor evenement (demo)");
  };

  const handleUnregisterEvent = (eventId: number) => {
    // TODO: Uncomment when backend endpoint is ready
    // unregisterEventMutation.mutate(eventId, {
    //   onSuccess: (unregisteredEventId) => {
    //     setEvents(events.map(e => 
    //       e.eventId === unregisteredEventId ? { ...e, isRegistered: false } : e
    //     ));
    //     toast.success("Uitgeschreven van evenement");
    //   },
    //   onError: (error) => {
    //     console.error('Error unregistering from event:', error);
    //     toast.error("Fout bij uitschrijven van evenement");
    //   },
    //   onSettled: () => {
    //     queryClient.invalidateQueries({ queryKey: ['events'] });
    //   },
    // });
    // return;

    // Mock unregister
    setEvents(events.map(e =>
      e.eventId === eventId ? { ...e, isRegistered: false } : e
    ));
    toast.success("Uitgeschreven van evenement (demo)");
  };



  const EventCard = ({ event, isPast }: { event: Event; isPast: boolean }) => (
    <Card className="hover:shadow-lg transition-shadow">
      <CardHeader>
        <div className="flex justify-between items-start">
          <CardTitle>{event.title}</CardTitle>
          {event.isRegistered && (
            <Badge variant="default">Ingeschreven</Badge>
          )}
        </div>
        <CardDescription>{event.description}</CardDescription>
      </CardHeader>
      <CardContent className="space-y-2">
        <div className="flex items-center gap-2 text-sm">
          <CalendarIcon className="h-4 w-4 text-muted-foreground" />
          <span>{new Date(event.eventDate).toLocaleDateString('nl-NL')}</span>
        </div>
        <div className="flex items-center gap-2 text-sm">
          <ClockIcon className="h-4 w-4 text-muted-foreground" />
          <span>{event.startTime} - {event.endTime}</span>
        </div>
        <div className="flex items-center gap-2 text-sm">
          <MapPinIcon className="h-4 w-4 text-muted-foreground" />
          <span>{event.location}</span>
        </div>
        {event.rating && (
          <div className="flex items-center gap-2 text-sm">
            <StarIcon className="h-4 w-4 text-yellow-500 fill-yellow-500" />
            <span>{event.rating} / 5</span>
          </div>
        )}
      </CardContent>
      <CardFooter className="flex gap-2 flex-wrap">
        <Button
          size="sm"
          variant="outline"
          onClick={() => navigate({ to: `/events/${event.eventId}` })}
        >
          Details
        </Button>

        {!isPast && !event.isRegistered && (
          <Button size="sm" onClick={() => handleRegisterEvent(event.eventId)}>
            Inschrijven
          </Button>
        )}

        {!isPast && event.isRegistered && (
          <Button size="sm" variant="destructive" onClick={() => handleUnregisterEvent(event.eventId)}>
            Uitschrijven
          </Button>
        )}

        {isPast && event.isRegistered && !event.rating && (
          <Button size="sm" onClick={() => {
            setSelectedEvent(event);
            rateEventForm.setFieldValue("rating", 0);
            setIsRatingDialogOpen(true);
          }}>
            Beoordelen
          </Button>
        )}

        {isAdmin && (
          <>
            <Button
              size="sm"
              variant="outline"
              onClick={() => {
                setSelectedEvent(event);
                editEventForm.setFieldValue("title", event.title);
                editEventForm.setFieldValue("description", event.description);
                editEventForm.setFieldValue("eventDate", event.eventDate);
                editEventForm.setFieldValue("startTime", event.startTime);
                editEventForm.setFieldValue("endTime", event.endTime);
                editEventForm.setFieldValue("location", event.location);
                setIsEditDialogOpen(true);
              }}
            >
              <PencilIcon className="h-4 w-4" />
            </Button>
            <Button
              size="sm"
              variant="destructive"
              onClick={() => handleDeleteEvent(event.eventId)}
            >
              <TrashIcon className="h-4 w-4" />
            </Button>
          </>
        )}
      </CardFooter>
    </Card>
  );

  return (
    <div className="container mx-auto p-6">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-3xl font-bold">Evenementen</h1>
        {isAdmin && (
          <Dialog open={isAddDialogOpen} onOpenChange={setIsAddDialogOpen}>
            <DialogTrigger asChild>
              <Button>
                <PlusIcon className="h-4 w-4 mr-2" />
                Nieuw evenement
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-2xl">
              <addEventForm.AppForm>
                <form
                  onSubmit={(e) => {
                    e.preventDefault();
                    e.stopPropagation();
                    addEventForm.handleSubmit();
                  }}
                  noValidate
                >
                  <DialogHeader>
                    <DialogTitle>Nieuw evenement aanmaken</DialogTitle>
                    <DialogDescription>Vul de gegevens in voor het nieuwe evenement</DialogDescription>
                  </DialogHeader>
                  <div className="grid gap-4 py-4">
                    <addEventForm.AppField name="title" children={(field) => (
                      <field.TextField label="Titel" placeholder="Evenement titel" />
                    )} />
                    <addEventForm.AppField name="description" children={(field) => (
                      <field.TextArea label="Beschrijving" />
                    )} />
                    <div className="grid grid-cols-3 gap-4">
                      <addEventForm.AppField name="eventDate" children={(field) => (
                        <field.TextField label="Datum" type="date" />
                      )} />
                      <addEventForm.AppField name="startTime" children={(field) => (
                        <field.TextField label="Starttijd" type="time" />
                      )} />
                      <addEventForm.AppField name="endTime" children={(field) => (
                        <field.TextField label="Eindtijd" type="time" />
                      )} />
                    </div>
                    <addEventForm.AppField name="location" children={(field) => (
                      <field.TextField label="Locatie" placeholder="Evenement locatie" />
                    )} />
                  </div>
                  <DialogFooter>
                    <addEventForm.Subscribe
                      selector={(state) => state.canSubmit}
                      children={(canSubmit) => (
                        <Button type="submit" disabled={!canSubmit}>
                          Aanmaken
                        </Button>
                      )}
                    />
                  </DialogFooter>
                </form>
              </addEventForm.AppForm>
            </DialogContent>
          </Dialog>
        )}
      </div>

      <Tabs 
        value={search.status || "upcoming"} 
        onValueChange={(value) => {
          navigate({ 
            to: "/events", 
            search: { ...search, status: value === "upcoming" ? undefined : value as "past" | "upcoming" }
          });
        }}
        className="w-full"
      >
        <TabsList className="grid w-full max-w-md grid-cols-2">
          <TabsTrigger value="upcoming">Aankomende ({upcomingEvents.length})</TabsTrigger>
          <TabsTrigger value="past">Afgelopen ({pastEvents.length})</TabsTrigger>
        </TabsList>
        <TabsContent value="upcoming" className="mt-6">
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            {upcomingEvents.length === 0 ? (
              <p className="text-muted-foreground col-span-full text-center py-8">
                Geen aankomende evenementen
              </p>
            ) : (
              upcomingEvents.map((event) => <EventCard key={event.eventId} event={event} isPast={false} />)
            )}
          </div>
        </TabsContent>
        <TabsContent value="past" className="mt-6">
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            {pastEvents.length === 0 ? (
              <p className="text-muted-foreground col-span-full text-center py-8">
                Geen afgelopen evenementen
              </p>
            ) : (
              pastEvents.map((event) => <EventCard key={event.eventId} event={event} isPast={true} />)
            )}
          </div>
        </TabsContent>
      </Tabs>

      {/* Edit Dialog */}
      <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
        <DialogContent className="max-w-2xl">
          <editEventForm.AppForm>
            <form
              onSubmit={(e) => {
                e.preventDefault();
                e.stopPropagation();
                editEventForm.handleSubmit();
              }}
              noValidate
            >
              <DialogHeader>
                <DialogTitle>Evenement bewerken</DialogTitle>
              </DialogHeader>
              <div className="grid gap-4 py-4">
                <editEventForm.AppField name="title" children={(field) => (
                  <field.TextField label="Titel" placeholder="Evenement titel" />
                )} />
                <editEventForm.AppField name="description" children={(field) => (
                  <field.TextArea label="Beschrijving" />
                )} />
                <div className="grid grid-cols-3 gap-4">
                  <editEventForm.AppField name="eventDate" children={(field) => (
                    <field.TextField label="Datum" type="date" />
                  )} />
                  <editEventForm.AppField name="startTime" children={(field) => (
                    <field.TextField label="Starttijd" type="time" />
                  )} />
                  <editEventForm.AppField name="endTime" children={(field) => (
                    <field.TextField label="Eindtijd" type="time" />
                  )} />
                </div>
                <editEventForm.AppField name="location" children={(field) => (
                  <field.TextField label="Locatie" placeholder="Evenement locatie" />
                )} />
              </div>
              <DialogFooter>
                <editEventForm.Subscribe
                  selector={(state) => state.canSubmit}
                  children={(canSubmit) => (
                    <Button type="submit" disabled={!canSubmit}>
                      Opslaan
                    </Button>
                  )}
                />
              </DialogFooter>
            </form>
          </editEventForm.AppForm>
        </DialogContent>
      </Dialog>

      {/* View Dialog */}
      <Dialog open={isViewDialogOpen} onOpenChange={setIsViewDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>{selectedEvent?.title}</DialogTitle>
          </DialogHeader>
          {selectedEvent && (
            <div className="space-y-4">
              <p>{selectedEvent.description}</p>
              <div className="space-y-2 text-sm">
                <div className="flex items-center gap-2">
                  <CalendarIcon className="h-4 w-4 text-muted-foreground" />
                  <span>{new Date(selectedEvent.eventDate).toLocaleDateString('nl-NL')}</span>
                </div>
                <div className="flex items-center gap-2">
                  <ClockIcon className="h-4 w-4 text-muted-foreground" />
                  <span>{selectedEvent.startTime} - {selectedEvent.endTime}</span>
                </div>
                <div className="flex items-center gap-2">
                  <MapPinIcon className="h-4 w-4 text-muted-foreground" />
                  <span>{selectedEvent.location}</span>
                </div>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>

      {/* Rating Dialog */}
      <Dialog open={isRatingDialogOpen} onOpenChange={setIsRatingDialogOpen}>
        <DialogContent>
          <form
            onSubmit={(e) => {
              e.preventDefault();
              e.stopPropagation();
              rateEventForm.handleSubmit();
            }}
            noValidate
          >
            <DialogHeader>
              <DialogTitle>Evenement beoordelen</DialogTitle>
              <DialogDescription>Geef een beoordeling voor {selectedEvent?.title}</DialogDescription>
            </DialogHeader>
            <div className="py-4">
              <Label>Rating (1-5 sterren)</Label>
              <rateEventForm.Field name="rating">
                {(field) => (
                  <div className="flex gap-2 mt-2">
                    {[1, 2, 3, 4, 5].map((star) => (
                      <button
                        key={star}
                        type="button"
                        onClick={() => field.handleChange(star)}
                        className="focus:outline-none"
                      >
                        <StarIcon
                          className={`h-8 w-8 ${star <= field.state.value
                            ? "text-yellow-500 fill-yellow-500"
                            : "text-gray-300"
                            }`}
                        />
                      </button>
                    ))}
                  </div>
                )}
              </rateEventForm.Field>
            </div>
            <DialogFooter>
              <rateEventForm.Subscribe
                selector={(state) => state.canSubmit}
                children={(canSubmit) => (
                  <Button type="submit" disabled={!canSubmit}>
                    Beoordeling indienen
                  </Button>
                )}
              />
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
}
