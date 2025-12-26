using System;

namespace CalendifyWebAppAPI.Models
{
    public class EventParticipation
    {
        public Guid EventId { get; set; }
        public Guid UserId { get; set; }
        public string Status { get; set; }
    }
}
