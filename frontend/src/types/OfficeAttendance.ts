export interface OfficeAttendance {
    attendanceId: number;
    userId: number;
    date: string;
    status: "Present" | "Absent" | "Remote" | "Late";
    createdAt: string;
}
