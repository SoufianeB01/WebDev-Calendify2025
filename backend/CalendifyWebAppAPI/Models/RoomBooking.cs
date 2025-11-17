namespace CalendifyWebAppAPI.Models
{
    public class RoomBooking
    {
        public int RoomId { get; set; }
        public int UserId { get; set; }
        public DateTime BookingDate { get; set; }
        public TimeSpan StartTime { get; set; }
        public TimeSpan EndTime { get; set; }
        public string Purpose { get; set; }
    }
}
