namespace CalendifyWebAppAPI.Models
{
    public class RoomBookingRequest
    {
        public int RoomId { get; set; }
        public int UserId { get; set; }
        // Incoming booking date as DateTime (e.g., from JSON), converted to DateOnly in service
        public DateTime BookingDate { get; set; }
        public TimeSpan StartTime { get; set; }
        public TimeSpan EndTime { get; set; }
    }
}
