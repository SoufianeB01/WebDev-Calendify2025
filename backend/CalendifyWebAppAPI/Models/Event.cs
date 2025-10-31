namespace CalendifyWebAppAPI.Models
{
    public class Event
    {
        public int EventId { get; set; }
        public string Title { get; set; } = string.Empty;
        public string Description { get; set; } = string.Empty;
        public DateTime EventDate { get; set; }
        public int CreatedBy { get; set; }
    }
}
