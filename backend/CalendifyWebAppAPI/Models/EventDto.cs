namespace CalendifyWebAppAPI.Models
{
    public class EventDto
    {
        public int EventId { get; set; }
        public string Title { get; set; }
        public string Description { get; set; }
        public DateTime EventDate { get; set; }
        public TimeSpan StartTime { get; set; }
        public TimeSpan EndTime { get; set; }
        public string Location { get; set; }
        public int CreatedBy { get; set; }
        public List<EventReview> Reviews { get; set; } = new List<EventReview>();
        public List<int> Attendees { get; set; } = new List<int>();
    }
}

