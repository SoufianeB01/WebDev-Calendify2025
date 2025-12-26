using System;

namespace CalendifyWebAppAPI.Models
{
    public class Event
    {
        public Guid EventId { get; set; } = Guid.NewGuid();
        public string Title { get; set; }
        public string Description { get; set; }
        public DateTime EventDate { get; set; }
        public TimeSpan StartTime { get; set; }
        public TimeSpan EndTime { get; set; }
        public string Location { get; set; }
        public Guid CreatedBy { get; set; }
    }
}
