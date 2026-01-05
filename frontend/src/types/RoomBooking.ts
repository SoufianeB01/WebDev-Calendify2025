import { z } from "zod";

// Room booking schema
export const roomBookingSchema = z.object({
    roomId: z.string().uuid("Room ID must be a valid UUID"),
    userId: z.string().uuid("User ID must be a valid UUID"),
    bookingDate: z.string(),
    startTime: z.string(),
    endTime: z.string(),
    purpose: z.string(),
});

export type RoomBooking = z.infer<typeof roomBookingSchema>;

// Create room booking schema
export const createRoomBookingSchema = z.object({
    roomId: z.string().uuid("Selecteer een kamer"),
    bookingDate: z.string().min(1, "Datum is verplicht"),
    startTime: z.string().min(1, "Starttijd is verplicht"),
    endTime: z.string().min(1, "Eindtijd is verplicht"),
    purpose: z.string().min(1, "Doel is verplicht").max(500, "Doel mag maximaal 500 tekens bevatten"),
});

export type CreateRoomBooking = z.infer<typeof createRoomBookingSchema>;
