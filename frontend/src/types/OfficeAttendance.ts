import { z } from "zod";

// Office attendance schema
export const officeAttendanceSchema = z.object({
    attendanceId: z.number(),
    userId: z.number(),
    date: z.string(),
    status: z.enum(["Present", "Absent", "Remote", "Late"]),
    createdAt: z.string(),
});

export type OfficeAttendance = z.infer<typeof officeAttendanceSchema>;

// Create attendance schema
export const createAttendanceSchema = z.object({
    date: z.string().min(1, "Datum is verplicht"),
    status: z.enum(["Present", "Absent", "Remote", "Late"]),
});

export type CreateAttendance = z.infer<typeof createAttendanceSchema>;
