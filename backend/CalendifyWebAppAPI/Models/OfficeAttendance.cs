using System;

namespace CalendifyWebAppAPI.Models
{
    public class OfficeAttendance
    {
        public Guid AttendanceId { get; set; } = Guid.NewGuid();
        public Guid UserId { get; set; }
        public DateTime Date { get; set; }
        public string Status { get; set; }
    }
}
