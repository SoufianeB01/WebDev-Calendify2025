import { z } from "zod";

export const officeAttendanceSchema = z.object({
  attendanceId: z.string(),
  userId: z.string(),
  date: z.string(),
  status: z.enum(["Present", "Absent", "Remote", "Late"]),
});

export type OfficeAttendance = z.infer<typeof officeAttendanceSchema>;

export const createAttendanceSchema = z.object({
  date: z.string().min(1),
  status: z.enum(["Present", "Absent", "Remote", "Late"]),
});

export type CreateAttendance = z.infer<typeof createAttendanceSchema>;
