import { z } from "zod";

// Room schema
export const roomSchema = z.object({
    roomId: z.string().uuid("Room ID must be a valid UUID"),
    roomName: z.string().min(1, "Kamernaam is verplicht").max(100, "Kamernaam mag maximaal 100 tekens bevatten"),
    capacity: z.number().min(1, "Capaciteit moet minimaal 1 zijn").max(1000, "Capaciteit mag maximaal 1000 zijn"),
    location: z.string().min(1, "Locatie is verplicht").max(200, "Locatie mag maximaal 200 tekens bevatten"),
    services: z.array(z.string()),
    isOnline: z.boolean(),
    createdAt: z.string(),
    updatedAt: z.string(),
});

export type Room = z.infer<typeof roomSchema>;

// Create room schema (full - with services and isOnline)
export const createRoomSchema = z.object({
    roomName: z.string().min(1, "Kamernaam is verplicht").max(100, "Kamernaam mag maximaal 100 tekens bevatten"),
    capacity: z.coerce.number().min(1, "Capaciteit moet minimaal 1 zijn").max(1000, "Capaciteit mag maximaal 1000 zijn"),
    location: z.string().min(1, "Locatie is verplicht").max(200, "Locatie mag maximaal 200 tekens bevatten"),
    services: z.array(z.string()),
    isOnline: z.boolean(),
});

export type CreateRoom = z.infer<typeof createRoomSchema>;

// Simplified room schema (for basic forms - only name, capacity, location)
export const simpleRoomSchema = z.object({
    roomName: z.string().min(1, "Kamernaam is verplicht").max(100, "Kamernaam mag maximaal 100 tekens bevatten"),
    capacity: z.coerce.number().min(1, "Capaciteit moet minimaal 1 zijn").max(1000, "Capaciteit mag maximaal 1000 zijn"),
    location: z.string().min(1, "Locatie is verplicht").max(200, "Locatie mag maximaal 200 tekens bevatten"),
});

export type SimpleRoom = z.infer<typeof simpleRoomSchema>;
