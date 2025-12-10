namespace CalendifyWebAppAPI.Models
{
    public class EventReview
    {
        public int ReviewId { get; set; }
        public int EventId { get; set; }
        public int UserId { get; set; }
        public int Rating { get; set; }
        public string Comment { get; set; }
        public DateTime CreatedAt { get; set; } = DateTime.UtcNow;
    }
}

