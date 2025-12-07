namespace CalendifyWebAppAPI.Models.DTOs
{
    public class OfficeAttendanceRequest
    {
        public int? AttendanceId { get; set; } // optional for create
        public int UserId { get; set; }
        public DateTime Date { get; set; }
        public bool IsPresent { get; set; }
    }
}
