import { z } from "zod";

// Event schema
export const eventSchema = z.object({
    eventId: z.string().uuid("Event ID must be a valid UUID"),
    title: z.string().min(1, "Titel is verplicht").max(100, "Titel mag maximaal 100 tekens bevatten"),
    description: z.string().min(1, "Beschrijving is verplicht").max(500, "Beschrijving mag maximaal 500 tekens bevatten"),
    eventDate: z.string().min(1, "Datum is verplicht"),
    startTime: z.string().min(1, "Starttijd is verplicht"),
    endTime: z.string().min(1, "Eindtijd is verplicht"),
    location: z.string().min(1, "Locatie is verplicht").max(200, "Locatie mag maximaal 200 tekens bevatten"),
    createdBy: z.string().uuid("CreatedBy must be a valid UUID"),
    adminApproval: z.boolean(),
    createdAt: z.string(),
    updatedAt: z.string(),
    participants: z.record(z.string()),
    isRegistered: z.boolean().optional(),
    rating: z.number().optional(),
    averageRating: z.number().optional(),
});

export type Event = z.infer<typeof eventSchema>;

// Create event schema
export const createEventSchema = z.object({
    title: z.string().min(1, "Titel is verplicht").max(100, "Titel mag maximaal 100 tekens bevatten"),
    description: z.string().min(1, "Beschrijving is verplicht").max(500, "Beschrijving mag maximaal 500 tekens bevatten"),
    eventDate: z.string().min(1, "Datum is verplicht"),
    startTime: z.string().min(1, "Starttijd is verplicht"),
    endTime: z.string().min(1, "Eindtijd is verplicht"),
    location: z.string().min(1, "Locatie is verplicht").max(200, "Locatie mag maximaal 200 tekens bevatten"),
});

export type CreateEvent = z.infer<typeof createEventSchema>;

// Rate event schema
export const rateEventSchema = z.object({
    rating: z.number().min(1, "Minimale waardering is 1").max(5, "Maximale waardering is 5"),
});

export type RateEvent = z.infer<typeof rateEventSchema>;
