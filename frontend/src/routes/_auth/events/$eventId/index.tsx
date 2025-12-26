import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useEffect, useState } from "react";
// import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { ArrowLeftIcon, CalendarIcon, ClockIcon, MapPinIcon, StarIcon, UsersIcon, XCircleIcon } from "lucide-react";
import { toast } from "sonner";

import type { Event } from "@/types/Event";
import mockData from "@/data/mock.json";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";

export const Route = createFileRoute("/_auth/events/$eventId/")({
    component: RouteComponent,
});

function RouteComponent() {
    const navigate = useNavigate();
    const params = Route.useParams();
    const eventId = params.eventId;
    // const queryClient = useQueryClient();

    // Mock event data - in reality, fetch from API based on eventId
    const [event, setEvent] = useState<Event | null>(null);
    const [isLoading, setIsLoading] = useState(true);
    const [isRatingDialogOpen, setIsRatingDialogOpen] = useState(false);
    const [rating, setRating] = useState(0);
    const [reviewText, setReviewText] = useState("");
    const [reviews, setReviews] = useState<Array<{ userId: number; userName: string; rating: number; comment: string; date: string }>>([]);

    // TanStack Query for fetching event (commented out)
    // const { data: eventData, isLoading: queryLoading } = useQuery({
    //   queryKey: ['event', eventId],
    //   queryFn: async () => {
    //     const API_BASE = import.meta.env.VITE_API_URL || 'http://localhost:5143';
    //     const response = await fetch(`${API_BASE}/api/events/${eventId}`, {
    //       mode: 'cors',
    //       credentials: 'include',
    //     });
    //     if (!response.ok) throw new Error('Failed to fetch event');
    //     return response.json();
    //   },
    // });

    // const registerMutation = useMutation({
    //   mutationFn: async (eventId: number) => {
    //     const API_BASE = import.meta.env.VITE_API_URL || 'http://localhost:5143';
    //     const response = await fetch(`${API_BASE}/api/events/${eventId}/attend`, {
    //       method: 'POST',
    //       mode: 'cors',
    //       credentials: 'include',
    //     });
    //     if (!response.ok) throw new Error('Failed to register');
    //     return response.json();
    //   },
    // });

    // const unregisterMutation = useMutation({
    //   mutationFn: async (eventId: number) => {
    //     const API_BASE = import.meta.env.VITE_API_URL || 'http://localhost:5143';
    //     const response = await fetch(`${API_BASE}/api/events/${eventId}/attend`, {
    //       method: 'DELETE',
    //       mode: 'cors',
    //       credentials: 'include',
    //     });
    //     if (!response.ok) throw new Error('Failed to unregister');
    //     return response.json();
    //   },
    // });

    // const submitReviewMutation = useMutation({
    //   mutationFn: async ({ eventId, rating, comment }: { eventId: number; rating: number; comment: string }) => {
    //     const API_BASE = import.meta.env.VITE_API_URL || 'http://localhost:5143';
    //     const response = await fetch(`${API_BASE}/api/events/${eventId}/reviews`, {
    //       method: 'POST',
    //       mode: 'cors',
    //       credentials: 'include',
    //       headers: { 'Content-Type': 'application/json' },
    //       body: JSON.stringify({ rating, comment }),
    //     });
    //     if (!response.ok) throw new Error('Failed to submit review');
    //     return response.json();
    //   },
    // });

    useEffect(() => {
        // TODO: Uncomment when backend endpoint is ready
        // When using useQuery above, remove this useEffect and use:
        // setEvent(eventData);
        // setIsLoading(queryLoading);

        // Mock data from JSON
        const foundEvent = (mockData.events as Array<Event>).find((e) => e.eventId === eventId);
        setEvent(foundEvent || null);
        setIsLoading(false);

        // Mock reviews from JSON
        const eventReviews = mockData.reviews
            .filter((r) => r.eventId === eventId)
            .map((r) => ({
                userId: r.userId,
                userName: r.userName,
                rating: r.rating,
                comment: r.comment,
                date: r.date
            }));
        setReviews(eventReviews);
    }, [eventId]);

    const handleRegister = () => {
        if (!event) return;

        // TODO: Uncomment when backend endpoint is ready
        // registerMutation.mutate(event.eventId, {
        //   onSuccess: () => {
        //     setEvent({ ...event, isRegistered: true });
        //     toast.success("Succesvol ingeschreven voor evenement");
        //   },
        //   onError: (error) => {
        //     console.error('Error registering for event:', error);
        //     toast.error("Fout bij inschrijven");
        //   },
        //   onSettled: () => {
        //     queryClient.invalidateQueries({ queryKey: ['event', eventId] });
        //   },
        // });
        // return;

        // Mock register
        setEvent({ ...event, isRegistered: true });
        toast.success("Succesvol ingeschreven voor evenement (demo)");
    };

    const handleUnregister = () => {
        if (!event) return;

        // TODO: Uncomment when backend endpoint is ready
        // unregisterMutation.mutate(event.eventId, {
        //   onSuccess: () => {
        //     setEvent({ ...event, isRegistered: false });
        //     toast.success("Uitgeschreven van evenement");
        //   },
        //   onError: (error) => {
        //     console.error('Error unregistering from event:', error);
        //     toast.error("Fout bij uitschrijven");
        //   },
        //   onSettled: () => {
        //     queryClient.invalidateQueries({ queryKey: ['event', eventId] });
        //   },
        // });
        // return;

        // Mock unregister
        setEvent({ ...event, isRegistered: false });
        toast.success("Uitgeschreven van evenement (demo)");
    };

    const handleSubmitReview = (e: React.FormEvent) => {
        e.preventDefault();
        if (!event || rating === 0) {
            toast.error("Selecteer een rating");
            return;
        }

        // TODO: Uncomment when backend endpoint is ready
        // submitReviewMutation.mutate({ eventId: event.eventId, rating, comment: reviewText }, {
        //   onSuccess: (newReview) => {
        //     setReviews([newReview, ...reviews]);
        //     setEvent({ ...event, rating });
        //     setIsRatingDialogOpen(false);
        //     setRating(0);
        //     setReviewText("");
        //     toast.success("Review succesvol toegevoegd");
        //   },
        //   onError: (error) => {
        //     console.error('Error submitting review:', error);
        //     toast.error("Fout bij toevoegen review");
        //   },
        //   onSettled: () => {
        //     queryClient.invalidateQueries({ queryKey: ['event', eventId] });
        //   },
        // });
        // return;

        // Mock review
        const newReview = {
            userId: 1,
            userName: "Huidige Gebruiker",
            rating,
            comment: reviewText,
            date: new Date().toISOString().split('T')[0],
        };
        setReviews([newReview, ...reviews]);
        setEvent({ ...event, rating });
        toast.success("Review succesvol toegevoegd (demo)");

        setIsRatingDialogOpen(false);
        setRating(0);
        setReviewText("");
    };

    if (isLoading) {
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
                <Button onClick={() => navigate({ to: "/events" })} className="mt-4">
                    Terug naar Evenementen
                </Button>
            </div>
        );
    }

    const isPastEvent = new Date(event.eventDate) < new Date();

    return (
        <div className="container mx-auto p-6">
            <Button
                variant="ghost"
                onClick={() => navigate({ to: "/events" })}
                className="mb-4"
            >
                <ArrowLeftIcon className="h-4 w-4 mr-2" />
                Terug naar Evenementen
            </Button>

            <div className="grid gap-6">
                {/* Event Details Card */}
                <Card>
                    <CardHeader>
                        <div className="flex justify-between items-start">
                            <div>
                                <CardTitle className="text-3xl">{event.title}</CardTitle>
                                <CardDescription className="text-lg mt-2">
                                    {event.description}
                                </CardDescription>
                            </div>
                            <div className="flex gap-2">
                                {event.isRegistered && (
                                    <Badge variant="default">Ingeschreven</Badge>
                                )}
                                {isPastEvent && (
                                    <Badge variant="secondary">Afgelopen</Badge>
                                )}
                            </div>
                        </div>
                    </CardHeader>
                    <CardContent>
                        <div className="grid gap-4">
                            <div className="flex items-center gap-2 text-lg">
                                <CalendarIcon className="h-5 w-5 text-muted-foreground" />
                                <span>{new Date(event.eventDate).toLocaleDateString("nl-NL", {
                                    weekday: 'long',
                                    year: 'numeric',
                                    month: 'long',
                                    day: 'numeric'
                                })}</span>
                            </div>
                            <div className="flex items-center gap-2 text-lg">
                                <ClockIcon className="h-5 w-5 text-muted-foreground" />
                                <span>{event.startTime} - {event.endTime}</span>
                            </div>
                            <div className="flex items-center gap-2 text-lg">
                                <MapPinIcon className="h-5 w-5 text-muted-foreground" />
                                <span>{event.location}</span>
                            </div>
                            {event.averageRating && (
                                <div className="flex items-center gap-2 text-lg">
                                    <StarIcon className="h-5 w-5 text-yellow-500 fill-yellow-500" />
                                    <span>{event.averageRating.toFixed(1)} / 5.0</span>
                                    <span className="text-muted-foreground text-sm">
                                        ({reviews.length} {reviews.length === 1 ? 'review' : 'reviews'})
                                    </span>
                                </div>
                            )}
                        </div>

                        <div className="flex gap-3 mt-6">
                            {!isPastEvent && (
                                event.isRegistered ? (
                                    <Button variant="destructive" onClick={handleUnregister}>
                                        <XCircleIcon className="h-4 w-4 mr-2" />
                                        Uitschrijven
                                    </Button>
                                ) : (
                                    <Button onClick={handleRegister}>
                                        <UsersIcon className="h-4 w-4 mr-2" />
                                        Inschrijven
                                    </Button>
                                )
                            )}
                            {isPastEvent && event.isRegistered && (
                                <Dialog open={isRatingDialogOpen} onOpenChange={setIsRatingDialogOpen}>
                                    <DialogTrigger asChild>
                                        <Button>
                                            <StarIcon className="h-4 w-4 mr-2" />
                                            Review Plaatsen
                                        </Button>
                                    </DialogTrigger>
                                    <DialogContent>
                                        <form onSubmit={handleSubmitReview} noValidate>
                                            <DialogHeader>
                                                <DialogTitle>Review Toevoegen</DialogTitle>
                                                <DialogDescription>
                                                    Deel uw ervaring met dit evenement
                                                </DialogDescription>
                                            </DialogHeader>
                                            <div className="grid gap-4 py-4">
                                                <div>
                                                    <Label>Rating</Label>
                                                    <div className="flex gap-2 mt-2">
                                                        {[1, 2, 3, 4, 5].map((star) => (
                                                            <button
                                                                key={star}
                                                                type="button"
                                                                onClick={() => setRating(star)}
                                                                className="focus:outline-none"
                                                            >
                                                                <StarIcon
                                                                    className={`h-8 w-8 ${star <= rating
                                                                        ? "text-yellow-500 fill-yellow-500"
                                                                        : "text-gray-300"
                                                                        }`}
                                                                />
                                                            </button>
                                                        ))}
                                                    </div>
                                                </div>
                                                <div>
                                                    <Label htmlFor="review">Uw Review (optioneel)</Label>
                                                    <Textarea
                                                        id="review"
                                                        value={reviewText}
                                                        onChange={(e) => setReviewText(e.target.value)}
                                                        placeholder="Deel uw gedachten over dit evenement..."
                                                        rows={4}
                                                    />
                                                </div>
                                            </div>
                                            <DialogFooter>
                                                <Button type="submit">Review Versturen</Button>
                                            </DialogFooter>
                                        </form>
                                    </DialogContent>
                                </Dialog>
                            )}
                        </div>
                    </CardContent>
                </Card>

                {/* Reviews Section */}
                {reviews.length > 0 && (
                    <Card>
                        <CardHeader>
                            <CardTitle>Reviews</CardTitle>
                            <CardDescription>
                                Wat andere deelnemers van dit evenement vonden
                            </CardDescription>
                        </CardHeader>
                        <CardContent>
                            <div className="space-y-4">
                                {reviews.map((review, index) => (
                                    <div
                                        key={index}
                                        className="border-b last:border-0 pb-4 last:pb-0"
                                    >
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
                                                            ? "text-yellow-500 fill-yellow-500"
                                                            : "text-gray-300"
                                                            }`}
                                                    />
                                                ))}
                                            </div>
                                        </div>
                                        {review.comment && (
                                            <p className="text-sm">{review.comment}</p>
                                        )}
                                    </div>
                                ))}
                            </div>
                        </CardContent>
                    </Card>
                )}
            </div>
        </div>
    );
}
