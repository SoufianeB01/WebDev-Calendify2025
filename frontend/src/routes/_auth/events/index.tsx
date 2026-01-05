import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { z } from "zod";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useState } from "react";
import { CalendarIcon, ClockIcon, MapPinIcon, PencilIcon, PlusIcon, StarIcon, TrashIcon } from "lucide-react";
import { toast } from "sonner";

import type { Event } from "@/types/Event";
import { useAuth } from "@/lib/auth";
import { createEventSchema, reviewEventSchema } from "@/types/Event";
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
  const queryClient = useQueryClient();
  const { isAdmin, user } = useAuth();

  const [selectedEvent, setSelectedEvent] = useState<Event | null>(null);
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [isRatingDialogOpen, setIsRatingDialogOpen] = useState(false);

  const API_BASE = import.meta.env.VITE_API_URL || 'http://localhost:5143';

  // Fetch events with useQuery
  const { data: events = [] } = useQuery<Array<Event>>({
    queryKey: ['events'],
    queryFn: async () => {
      const res = await fetch(`${API_BASE}/api/Events`, { credentials: 'include' });
      if (!res.ok) throw new Error('Failed to fetch events');
      return res.json();
    }
  });

  // Fetch reviews for all events
  const { data: allReviews = {} } = useQuery<Record<string, Array<any>>>({
    queryKey: ['all-reviews'],
    queryFn: async () => {
      const reviewsMap: Record<string, Array<any>> = {};
      await Promise.all(
        events.map(async (event) => {
          try {
            const res = await fetch(`${API_BASE}/api/Events/${event.eventId}/reviews`, { credentials: 'include' });
            if (res.ok) {
              reviewsMap[event.eventId] = await res.json();
            }
          } catch (err) {
            console.error(`Failed to fetch reviews for event ${event.eventId}`, err);
          }
        })
      );
      return reviewsMap;
    },
    enabled: events.length > 0,
  });

  // Calculate average rating
  const calculateAverageRating = (eventId: string): number | null => {
    const reviews = allReviews[eventId];
    if (reviews.length === 0) return null;
    const sum = reviews.reduce((acc, review) => acc + review.rating, 0);
    return sum / reviews.length;
  };

  // Mutations
  const createEventMutation = useMutation({
    mutationFn: async (data: any) => {
      const res = await fetch(`${API_BASE}/api/Events`, {
        method: 'POST',
        credentials: 'include',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      });
      if (!res.ok) throw new Error('Failed to create event');
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['events'] });
      toast.success('Evenement succesvol aangemaakt');
      setIsAddDialogOpen(false);
      addEventForm.reset();
    },
    onError: (error) => {
      console.error(error);
      toast.error('Fout bij het aanmaken van evenement');
    },
  });

  const updateEventMutation = useMutation({
    mutationFn: async ({ eventId, data }: { eventId: string; data: any }) => {
      const res = await fetch(`${API_BASE}/api/Events/${eventId}`, {
        method: 'PUT',
        credentials: 'include',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      });
      if (!res.ok) throw new Error('Failed to update event');
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['events'] });
      toast.success('Evenement succesvol bijgewerkt');
      setIsEditDialogOpen(false);
      setSelectedEvent(null);
      editEventForm.reset();
    },
    onError: (error) => {
      console.error(error);
      toast.error('Fout bij het bijwerken van evenement');
    },
  });

  const deleteEventMutation = useMutation({
    mutationFn: async (eventId: string) => {
      const res = await fetch(`${API_BASE}/api/Events/${eventId}`, {
        method: 'DELETE',
        credentials: 'include',
      });
      if (!res.ok) throw new Error('Failed to delete event');
      return eventId;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['events'] });
      toast.success('Evenement succesvol verwijderd');
    },
    onError: (error) => {
      console.error(error);
      toast.error('Fout bij het verwijderen van evenement');
    },
  });

  const registerEventMutation = useMutation({
    mutationFn: async (eventId: string) => {
      const res = await fetch(`${API_BASE}/api/Events/${eventId}/attend`, {
        method: 'GET',
        credentials: 'include',
      });
      if (!res.ok) throw new Error('Failed to register for event');
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['events'] });
      toast.success('Succesvol ingeschreven voor evenement');
    },
    onError: (error) => {
      console.error(error);
      toast.error('Fout bij inschrijven voor evenement');
    },
  });

  const unregisterEventMutation = useMutation({
    mutationFn: async (eventId: string) => {
      const res = await fetch(`${API_BASE}/api/Events/${eventId}/attend`, {
        method: 'DELETE',
        credentials: 'include',
      });
      if (!res.ok) throw new Error('Failed to unregister from event');
      return eventId;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['events'] });
      toast.success('Uitgeschreven van evenement');
    },
    onError: (error) => {
      console.error(error);
      toast.error('Fout bij uitschrijven van evenement');
    },
  });

  const submitReviewMutation = useMutation({
    mutationFn: async ({ eventId, rating, comment, isEdit }: { eventId: string; rating: number; comment: string; isEdit: boolean }) => {
      const res = await fetch(`${API_BASE}/api/Events/${eventId}/reviews`, {
        method: isEdit ? 'PUT' : 'POST',
        credentials: 'include',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ rating, comment }),
      });
      if (!res.ok) throw new Error('Failed to submit review');
      return res.json();
    },
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ['events'] });
      queryClient.invalidateQueries({ queryKey: ['all-reviews'] });
      toast.success(variables.isEdit ? 'Beoordeling succesvol bijgewerkt' : 'Beoordeling succesvol ingediend');
      setIsRatingDialogOpen(false);
      setSelectedEvent(null);
      reviewForm.reset();
    },
    onError: (error) => {
      console.error(error);
      toast.error('Fout bij het indienen van beoordeling');
    },
  });

  // Forms
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
      createEventMutation.mutate(value);
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
      updateEventMutation.mutate({ eventId: selectedEvent.eventId, data: value });
    },
    validators: {
      onSubmit: createEventSchema,
    },
  });

  const reviewForm = useAppForm({
    defaultValues: {
      rating: 0,
      comment: "",
    },
    onSubmit: ({ value }) => {
      if (!selectedEvent) return;
      const eventReviews = allReviews[selectedEvent.eventId];
      const userReview = eventReviews.find(r => r.userId === user?.userId || r.userId === user?.UserId);
      submitReviewMutation.mutate({
        eventId: selectedEvent.eventId,
        rating: value.rating,
        comment: value.comment,
        isEdit: !!userReview
      });
    },
    validators: {
      onSubmit: reviewEventSchema,
    },
  });

  // Filter events
  const now = new Date();
  const upcomingEvents = events.filter(e => new Date(e.eventDate) >= now);
  const pastEvents = events.filter(e => new Date(e.eventDate) < now);

  // Event Card Component
  const EventCard = ({ event, isPast }: { event: Event; isPast: boolean }) => {
    const avgRating = calculateAverageRating(event.eventId);

    return (
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
          {avgRating && (
            <div className="flex items-center gap-2 text-sm">
              <StarIcon className="h-4 w-4 text-yellow-600 fill-yellow-600" />
              <span>{avgRating.toFixed(1)} / 5.0</span>
              <span className="text-muted-foreground">({allReviews[event.eventId].length})</span>
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
            <Button size="sm" onClick={() => registerEventMutation.mutate(event.eventId)}>
              Inschrijven
            </Button>
          )}

          {!isPast && event.isRegistered && (
            <Button size="sm" variant="destructive" onClick={() => unregisterEventMutation.mutate(event.eventId)}>
              Uitschrijven
            </Button>
          )}

          {/* Rating button for ALL users on any event */}
          <Button size="sm" variant="outline" onClick={() => {
            setSelectedEvent(event);
            const eventReviews = allReviews[event.eventId];
            const userReview = eventReviews.find(r => r.userId === user?.userId || r.userId === user?.UserId);
            if (userReview) {
              reviewForm.setFieldValue('rating', userReview.rating);
              reviewForm.setFieldValue('comment', userReview.comment);
            } else {
              reviewForm.reset();
            }
            setIsRatingDialogOpen(true);
          }}>
            <StarIcon className="h-4 w-4 mr-1" />
            Beoordelen
          </Button>

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
                onClick={() => {
                  if (confirm("Weet u zeker dat u dit evenement wilt verwijderen?")) {
                    deleteEventMutation.mutate(event.eventId);
                  }
                }}
              >
                <TrashIcon className="h-4 w-4" />
              </Button>
            </>
          )}
        </CardFooter>
      </Card>
    );
  };

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
        <TabsList className="bg-secondary text-primary grid w-full max-w-md grid-cols-2">
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

      {/* Rating Dialog */}
      <Dialog open={isRatingDialogOpen} onOpenChange={setIsRatingDialogOpen}>
        <DialogContent className="max-w-md">
          <reviewForm.AppForm>
            <form
              onSubmit={(e) => {
                e.preventDefault();
                e.stopPropagation();
                reviewForm.handleSubmit();
              }}
              noValidate
            >
              <DialogHeader>
                <DialogTitle>
                  {selectedEvent && allReviews[selectedEvent.eventId].find(r => r.userId === user?.userId || r.userId === user?.UserId)
                    ? 'Beoordeling bewerken'
                    : 'Evenement beoordelen'}
                </DialogTitle>
                <DialogDescription>Geef een beoordeling en opmerking voor {selectedEvent?.title}</DialogDescription>
              </DialogHeader>
              <div className="space-y-4 py-4">
                <reviewForm.Subscribe
                  selector={(state) => state.values.rating}
                  children={(rating) => (
                    <div>
                      <Label>Uw beoordeling</Label>
                      <div className="flex gap-2 mt-3 justify-center">
                        {[1, 2, 3, 4, 5].map((star) => (
                          <button
                            key={star}
                            type="button"
                            onClick={() => reviewForm.setFieldValue('rating', star)}
                            className="focus:outline-none transition-transform hover:scale-110"
                          >
                            <StarIcon
                              className={`h-10 w-10 ${star <= rating
                                ? "text-yellow-600 fill-yellow-600"
                                : "text-muted-foreground"
                                }`}
                            />
                          </button>
                        ))}
                      </div>
                      {rating > 0 && (
                        <p className="text-center mt-2 text-sm text-muted-foreground">
                          {rating} ster{rating !== 1 ? 'ren' : ''}
                        </p>
                      )}
                      <reviewForm.AppField
                        name="rating"
                        children={(field) => (
                          field.state.meta.errors.length > 0 && (
                            <p className="text-sm text-destructive mt-2 text-center">
                              {field.state.meta.errors.join(', ')}
                            </p>
                          )
                        )}
                      />
                    </div>
                  )}
                />
                <reviewForm.AppField
                  name="comment"
                  children={(field) => (
                    <field.TextArea
                      label="Uw opmerking"
                      rows={4}
                    />
                  )}
                />
              </div>
              <DialogFooter>
                <Button type="submit">
                  {selectedEvent && allReviews[selectedEvent.eventId].find(r => r.userId === user?.userId || r.userId === user?.UserId)
                    ? 'Beoordeling bijwerken'
                    : 'Beoordeling indienen'}
                </Button>
              </DialogFooter>
            </form>
          </reviewForm.AppForm>
        </DialogContent>
      </Dialog>
    </div>
  );
}
