using System;
using System.Collections.Generic;

namespace CalendifyWebAppAPI.Models.DTOs
{
    public class EventCreateRequest
    {
        public string Title { get; set; }
        public string Description { get; set; }
        public DateTime EventDate { get; set; }
        public TimeSpan StartTime { get; set; }
        public TimeSpan EndTime { get; set; }
        public string Location { get; set; }
        public int CreatedBy { get; set; }
    }

    public class EventUpdateRequest : EventCreateRequest { }

    public class EventAttendeeDto
    {
        public int UserId { get; set; }
        public string Name { get; set; }
        public string Email { get; set; }
    }

    public class EventReviewDto
    {
        public int ReviewId { get; set; }
        public int UserId { get; set; }
        public int Rating { get; set; }
        public string Comment { get; set; }
        public DateTime CreatedAt { get; set; }
    }

    public class EventDetailsResponse
    {
        public int EventId { get; set; }
        public string Title { get; set; }
        public string Description { get; set; }
        public DateTime EventDate { get; set; }
        public TimeSpan StartTime { get; set; }
        public TimeSpan EndTime { get; set; }
        public string Location { get; set; }
        public int CreatedBy { get; set; }
        public List<EventAttendeeDto> Attendees { get; set; } = new();
        public List<EventReviewDto> Reviews { get; set; } = new();
    }

    public class EventReviewCreateRequest
    {
        public int UserId { get; set; }
        public int Rating { get; set; }
        public string Comment { get; set; }
    }
}

