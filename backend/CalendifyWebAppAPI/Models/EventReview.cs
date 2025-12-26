using System;

namespace CalendifyWebAppAPI.Models
{
    public class EventReview
    {
        public Guid ReviewId { get; set; } = Guid.NewGuid();
        public Guid EventId { get; set; }
        public Guid UserId { get; set; }
        public int Rating { get; set; }
        public string Comment { get; set; }
        public DateTime CreatedAt { get; set; } = DateTime.UtcNow;
    }
}

