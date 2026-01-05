using Microsoft.AspNetCore.Mvc;
using CalendifyWebAppAPI.Interfaces;
using CalendifyWebAppAPI.Models;
using CalendifyWebAppAPI.Data;
using Microsoft.EntityFrameworkCore;

namespace CalendifyWebAppAPI.Controllers
{
    [ApiController]
    [Route("api/[controller]")]
    public class EventsController : ControllerBase
    {
        private readonly IEventService _eventService;
        private readonly IEventParticipationService _participationService;
        private readonly AppDbContext _context;

        public EventsController(IEventService eventService, IEventParticipationService participationService, AppDbContext context)
        {
            _eventService = eventService;
            _participationService = participationService;
            _context = context;
        }

        private bool IsAdmin()
        {
            var role = HttpContext.Session.GetString("UserRole");
            return role == "Admin";
        }

        [HttpGet]
        public async Task<IActionResult> GetAll()
        {
            var events = await _eventService.GetAllEventsAsync();
            if (events == null || events.Count == 0)
                return Ok(new { message = "No events found", events = new List<Event>() });
            return Ok(events);
        }

        [HttpGet("{id}")]
        public async Task<IActionResult> GetById(string id)
        {
            if (!Guid.TryParse(id, out Guid eventId))
                return BadRequest(new { message = "Invalid event ID format" });

            var ev = await _eventService.GetEventByIdAsync(eventId);
            if (ev == null) return NotFound(new { message = "Event not found" });
            return Ok(ev);
        }

        [HttpGet("user/{userId}")]
        public async Task<IActionResult> GetByUser(string userId)
        {
            if (!Guid.TryParse(userId, out Guid userGuid))
                return BadRequest(new { message = "Invalid user ID format" });

            var events = await _eventService.GetEventsByUserAsync(userGuid);
            if (events == null || events.Count == 0)
                return Ok(new { message = "No events found for user", events = new List<Event>() });
            return Ok(events);
        }

        [HttpPost]
        public async Task<IActionResult> Create([FromBody] Event ev)
        {
            if (!IsAdmin()) return Unauthorized(new { message = "Admin privileges required" });

            // Set CreatedBy from session
            var userIdStr = HttpContext.Session.GetString("UserId");
            if (string.IsNullOrEmpty(userIdStr))
                return Unauthorized(new { message = "User not authenticated" });

            if (!Guid.TryParse(userIdStr, out Guid userId))
                return BadRequest(new { message = "Invalid user ID in session" });

            ev.CreatedBy = userId;
            var created = await _eventService.CreateEventAsync(ev);
            return Ok(created);
        }

        [HttpPut("{id}")]
        public async Task<IActionResult> Update(string id, [FromBody] Event ev)
        {
            if (!IsAdmin()) return Unauthorized(new { message = "Admin privileges required" });
            if (!Guid.TryParse(id, out Guid eventId))
                return BadRequest(new { message = "Invalid event ID format" });

            var updated = await _eventService.UpdateEventAsync(eventId, ev);
            if (updated == null) return NotFound(new { message = "Event not found" });
            return Ok(updated);
        }

        [HttpDelete("{id}")]
        public async Task<IActionResult> Delete(string id)
        {
            if (!IsAdmin()) return Unauthorized(new { message = "Admin privileges required" });
            if (!Guid.TryParse(id, out Guid eventId))
                return BadRequest(new { message = "Invalid event ID format" });

            var deleted = await _eventService.DeleteEventAsync(eventId);
            if (!deleted) return NotFound(new { message = "Event not found" });
            return Ok(new { message = "Deleted" });
        }

        [HttpGet("{id}/attend")]
        public async Task<IActionResult> AttendEvent(string id)
        {
            if (!Guid.TryParse(id, out Guid eventId))
                return BadRequest(new { message = "Invalid event ID format" });

            var userIdStr = HttpContext.Session.GetString("UserId");
            if (string.IsNullOrEmpty(userIdStr) || !Guid.TryParse(userIdStr, out Guid userId))
                return Unauthorized();

            var attendance = await _participationService.AttendEventAsync(userId, eventId);
            return Ok(attendance);
        }

        [HttpGet("{id}/attendees")]
        public async Task<IActionResult> GetAttendees(string id)
        {
            if (!Guid.TryParse(id, out Guid eventId))
                return BadRequest(new { message = "Invalid event ID format" });

            var attendees = await _participationService.GetAttendeesAsync(eventId);
            if (attendees == null || attendees.Count == 0)
                return Ok(new { message = "No attendees for this event", attendees = new List<Guid>() });
            return Ok(attendees);
        }

        [HttpDelete("{id}/attend")]
        public async Task<IActionResult> CancelAttendance(string id)
        {
            if (!Guid.TryParse(id, out Guid eventId))
                return BadRequest(new { message = "Invalid event ID format" });

            var userIdStr = HttpContext.Session.GetString("UserId");
            if (string.IsNullOrEmpty(userIdStr) || !Guid.TryParse(userIdStr, out Guid userId))
                return Unauthorized();

            var canceled = await _participationService.CancelAttendanceAsync(userId, eventId);
            if (!canceled) return NotFound();
            return Ok(new { message = "Canceled" });
        }

        [HttpGet("{id}/reviews")]
        public async Task<IActionResult> GetReviews(string id)
        {
            if (!Guid.TryParse(id, out Guid eventId))
                return BadRequest(new { message = "Invalid event ID format" });

            var reviews = await _context.EventReviews
                .Where(r => r.EventId == eventId)
                .ToListAsync();

            return Ok(reviews);
        }

        [HttpPost("{id}/reviews")]
        public async Task<IActionResult> AddReview(string id, [FromBody] EventReview review)
        {
            if (!Guid.TryParse(id, out Guid eventId))
                return BadRequest(new { message = "Invalid event ID format" });

            var userIdStr = HttpContext.Session.GetString("UserId");
            if (string.IsNullOrEmpty(userIdStr) || !Guid.TryParse(userIdStr, out Guid userId))
                return Unauthorized();

            // Check if user already has a review for this event
            var existingReview = await _context.EventReviews
                .FirstOrDefaultAsync(r => r.EventId == eventId && r.UserId == userId);

            if (existingReview != null)
            {
                return BadRequest(new { message = "You have already reviewed this event. Use PUT to update." });
            }

            review.EventId = eventId;
            review.UserId = userId;
            review.ReviewId = Guid.NewGuid();
            review.CreatedAt = DateTime.UtcNow;

            _context.EventReviews.Add(review);
            await _context.SaveChangesAsync();

            return Ok(review);
        }

        [HttpPut("{id}/reviews")]
        public async Task<IActionResult> UpdateReview(string id, [FromBody] EventReview reviewUpdate)
        {
            if (!Guid.TryParse(id, out Guid eventId))
                return BadRequest(new { message = "Invalid event ID format" });

            var userIdStr = HttpContext.Session.GetString("UserId");
            if (string.IsNullOrEmpty(userIdStr) || !Guid.TryParse(userIdStr, out Guid userId))
                return Unauthorized();

            // Find existing review
            var existingReview = await _context.EventReviews
                .FirstOrDefaultAsync(r => r.EventId == eventId && r.UserId == userId);

            if (existingReview == null)
            {
                return NotFound(new { message = "Review not found" });
            }

            // Update the review
            existingReview.Rating = reviewUpdate.Rating;
            existingReview.Comment = reviewUpdate.Comment;
            existingReview.CreatedAt = DateTime.UtcNow; // Update timestamp

            await _context.SaveChangesAsync();

            return Ok(existingReview);
        }
    }
}