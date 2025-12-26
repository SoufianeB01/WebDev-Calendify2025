using System;

namespace CalendifyWebAppAPI.Models
{
    public class RoomBooking
    {
        public Guid RoomId { get; set; }
        public Guid UserId { get; set; }
        public DateTime BookingDate { get; set; }
        public TimeSpan StartTime { get; set; }
        public TimeSpan EndTime { get; set; }
        public string Purpose { get; set; }
    }
}
