import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useState } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { ArrowLeftIcon, CalendarIcon, ClockIcon, MapPinIcon, StarIcon, UsersIcon, XCircleIcon } from "lucide-react";
import { toast } from "sonner";

import type { Event, Review } from "@/types/Event";
import { reviewEventSchema } from "@/types/Event";
import { useAppForm } from "@/hooks/use-app-form";
import { useAuth } from "@/lib/auth";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";

export const Route = createFileRoute("/_auth/events/$eventId/")({
    component: RouteComponent,
});

function RouteComponent() {
    const navigate = useNavigate();
    const params = Route.useParams();
    const eventId = params.eventId;
    const queryClient = useQueryClient();
    const { user } = useAuth();

    const [isRatingDialogOpen, setIsRatingDialogOpen] = useState(false);

    const API_BASE = import.meta.env.VITE_API_URL || 'http://localhost:5143';

    // Fetch event details
    const { data: event, isLoading: eventLoading } = useQuery<Event>({
        queryKey: ['event', eventId],
        queryFn: async () => {
            const res = await fetch(`${API_BASE}/api/Events/${eventId}`, { credentials: 'include' });
            if (!res.ok) throw new Error('Kon evenement niet ophalen');
            return res.json();
        },
    });

    // Fetch event reviews
    const { data: reviews = [] } = useQuery<Array<Review>>({
        queryKey: ['event-reviews', eventId],
        queryFn: async () => {
            const res = await fetch(`${API_BASE}/api/Events/${eventId}/reviews`, { credentials: 'include' });
            if (!res.ok) return [];
            return res.json();
        },
    });

    // Fetch event attendees
    const { data: attendees = [] } = useQuery<Array<{ userId: string; name: string; email: string }>>({
        queryKey: ['event-attendees', eventId],
        queryFn: async () => {
            const res = await fetch(`${API_BASE}/api/Events/${eventId}/attendees`, { credentials: 'include' });
            if (!res.ok) return [];
            const data = await res.json();
            return Array.isArray(data) ? data : data.attendees || [];
        },
    });

    // Check if current user is registered
    const isUserRegistered = attendees.some(a => a.userId === (user?.userId || user?.UserId || ''));

    // Find user's existing review
    const userReview = reviews.find(r => r.userId === user?.userId || r.userId === user?.UserId);

    // Register mutation
    const registerMutation = useMutation({
        mutationFn: async () => {
            const res = await fetch(`${API_BASE}/api/Events/${eventId}/attend`, {
                method: 'GET',
                credentials: 'include',
            });
            if (!res.ok) throw new Error('Kon niet inschrijven voor evenement');
            return res.json();
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['event', eventId] });
            queryClient.invalidateQueries({ queryKey: ['events'] });
            queryClient.invalidateQueries({ queryKey: ['event-attendees', eventId] });
            toast.success('Succesvol ingeschreven voor evenement');
        },
        onError: (error) => {
            console.error(error);
            toast.error('Fout bij inschrijven voor evenement');
        },
    });

    // Unregister mutation
    const unregisterMutation = useMutation({
        mutationFn: async () => {
            const res = await fetch(`${API_BASE}/api/Events/${eventId}/attend`, {
                method: 'DELETE',
                credentials: 'include',
            });
            if (!res.ok) throw new Error('Kon uitschrijving niet voltooien');
            return eventId;
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['event', eventId] });
            queryClient.invalidateQueries({ queryKey: ['events'] });
            queryClient.invalidateQueries({ queryKey: ['event-attendees', eventId] });
            toast.success('Uitgeschreven van evenement');
        },
        onError: (error) => {
            console.error(error);
            toast.error('Fout bij uitschrijven van evenement');
        },
    });

    // Submit review mutation (creates new or updates existing)
    const submitReviewMutation = useMutation({
        mutationFn: async ({ rating, comment }: { rating: number; comment: string }) => {
            const res = await fetch(`${API_BASE}/api/Events/${eventId}/reviews`, {
                method: userReview ? 'PUT' : 'POST',
                credentials: 'include',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ rating, comment }),
            });
            if (!res.ok) throw new Error('Kon beoordeling niet indienen');
            return res.json();
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['event', eventId] });
            queryClient.invalidateQueries({ queryKey: ['event-reviews', eventId] });
            queryClient.invalidateQueries({ queryKey: ['events'] });
            queryClient.invalidateQueries({ queryKey: ['all-reviews'] });
            toast.success(userReview ? 'Beoordeling succesvol bijgewerkt' : 'Beoordeling succesvol ingediend');
            setIsRatingDialogOpen(false);
            reviewForm.reset();
        },
        onError: (error) => {
            console.error(error);
            toast.error('Fout bij het indienen van beoordeling');
        },
    });

    const reviewForm = useAppForm({
        defaultValues: {
            rating: 0,
            comment: "",
        },
        onSubmit: ({ value }) => {
            submitReviewMutation.mutate({ rating: value.rating, comment: value.comment });
        },
        validators: {
            onSubmit: reviewEventSchema,
        },
    });

    if (eventLoading) {
        return (
            <div className="container mx-auto p-6">
                <p>Laden...</p>
            </div>
        );
    }

    if (!event) {
        return (
            <div className="container mx-auto p-6">
                <p>Evenement niet gevonden</p>
                <Button onClick={() => navigate({ to: '/events' })}>
                    Terug naar evenementen
                </Button>
            </div>
        );
    }

    const isPastEvent = new Date(event.eventDate) < new Date();
    const averageRating = reviews.length > 0
        ? reviews.reduce((sum, r) => sum + r.rating, 0) / reviews.length
        : null;

    return (
        <div className="container mx-auto p-6 max-w-4xl">
            <Button
                variant="ghost"
                size="sm"
                onClick={() => navigate({ to: '/events' })}
                className="mb-4"
            >
                <ArrowLeftIcon className="h-4 w-4 mr-2" />
                Terug naar overzicht
            </Button>

            <Card>
                <CardHeader>
                    <div className="flex justify-between items-start">
                        <div className="space-y-2 flex-1">
                            <CardTitle className="text-3xl">{event.title}</CardTitle>
                            {isUserRegistered && (
                                <Badge variant="default">Ingeschreven</Badge>
                            )}
                        </div>
                    </div>
                    <CardDescription className="text-base mt-4">{event.description}</CardDescription>
                </CardHeader>
                <CardContent className="space-y-6">
                    <div className="grid gap-4">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div className="flex items-center gap-2 text-lg">
                                <CalendarIcon className="h-5 w-5 text-muted-foreground" />
                                <span>{new Date(event.eventDate).toLocaleDateString('nl-NL', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}</span>
                            </div>
                            <div className="flex items-center gap-2 text-lg">
                                <ClockIcon className="h-5 w-5 text-muted-foreground" />
                                <span>{event.startTime} - {event.endTime}</span>
                            </div>
                            <div className="flex items-center gap-2 text-lg">
                                <MapPinIcon className="h-5 w-5 text-muted-foreground" />
                                <span>{event.location}</span>
                            </div>
                            {averageRating && (
                                <div className="flex items-center gap-2 text-lg">
                                    <StarIcon className="h-5 w-5 text-yellow-600 fill-yellow-600" />
                                    <span>{averageRating.toFixed(1)} / 5.0</span>
                                    <span className="text-muted-foreground text-sm">
                                        ({reviews.length} {reviews.length === 1 ? 'review' : 'reviews'})
                                    </span>
                                </div>
                            )}
                        </div>
                    </div>

                    <div className="flex gap-3 flex-wrap">
                        {!isPastEvent && !isUserRegistered && (
                            <Button onClick={() => registerMutation.mutate()}>
                                <UsersIcon className="h-4 w-4 mr-2" />
                                Inschrijven
                            </Button>
                        )}

                        {!isPastEvent && isUserRegistered && (
                            <Button className="text-destructive" onClick={() => unregisterMutation.mutate()}>
                                <XCircleIcon className="h-4 w-4 mr-2" />
                                Uitschrijven
                            </Button>
                        )}

                        <Button onClick={() => {
                            if (userReview) {
                                reviewForm.setFieldValue('rating', userReview.rating);
                                reviewForm.setFieldValue('comment', userReview.comment);
                            } else {
                                reviewForm.reset();
                            }
                            setIsRatingDialogOpen(true);
                        }} variant="secondary">
                            <StarIcon className="h-4 w-4 mr-2" />
                            Beoordelen
                        </Button>
                    </div>

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
                                        <DialogTitle>{userReview ? 'Beoordeling bewerken' : 'Evenement beoordelen'}</DialogTitle>
                                        <DialogDescription>Geef een beoordeling en opmerking voor {event.title}</DialogDescription>
                                    </DialogHeader>
                                    <div className="space-y-4 py-4">
                                        <reviewForm.Subscribe
                                            selector={(state) => state.values.rating}
                                            children={(rating) => (
                                                <div>
                                                    <Label>Uw beoordeling *</Label>
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
                                                    label="Uw opmerking *"
                                                    rows={4}
                                                />
                                            )}
                                        />
                                    </div>
                                    <DialogFooter>
                                        <Button type="submit">
                                            {userReview ? 'Beoordeling bijwerken' : 'Beoordeling indienen'}
                                        </Button>
                                    </DialogFooter>
                                </form>
                            </reviewForm.AppForm>
                        </DialogContent>
                    </Dialog>

                    {/* Attendees Section */}
                    {attendees.length > 0 && (
                        <div className="mt-6 border-t pt-6">
                            <h3 className="text-lg font-semibold mb-3 flex items-center gap-2">
                                <UsersIcon className="h-5 w-5" />
                                Deelnemers ({attendees.length})
                            </h3>
                            <div className="flex flex-wrap gap-2">
                                {attendees.map((attendee, index) => (
                                    <Badge key={index} variant="secondary">
                                        {attendee.name}
                                    </Badge>
                                ))}
                            </div>
                        </div>
                    )}

                    {/* Reviews Section */}
                    {reviews.length > 0 && (
                        <div className="mt-8 space-y-4">
                            <h3 className="text-xl font-semibold">Reviews</h3>
                            <div className="space-y-4">
                                {reviews.map((review, index) => (
                                    <Card key={index}>
                                        <CardContent className="pt-6">
                                            <div className="flex justify-between items-start mb-2">
                                                <div>
                                                    <p className="font-semibold">{review.userName}</p>
                                                    <p className="text-sm text-muted-foreground">
                                                        {new Date(review.date).toLocaleDateString("nl-NL")}
                                                    </p>
                                                </div>
                                                <div className="flex items-center gap-1">
                                                    {Array.from({ length: 5 }).map((_, i) => (
                                                        <StarIcon
                                                            key={i}
                                                            className={`h-4 w-4 ${i < review.rating
                                                                ? "text-yellow-600 fill-yellow-600"
                                                                : "text-muted-foreground"
                                                                }`}
                                                        />
                                                    ))}
                                                </div>
                                            </div>
                                            {review.comment && (
                                                <p className="text-sm">{review.comment}</p>
                                            )}
                                        </CardContent>
                                    </Card>
                                ))}
                            </div>
                        </div>
                    )}
                </CardContent>
            </Card>
        </div>
    );
}
