using Microsoft.AspNetCore.Mvc;
using CalendifyWebAppAPI.Data;
using CalendifyWebAppAPI.Models;
using CalendifyWebAppAPI.Models.DTOs;
using System.Linq;

namespace CalendifyWebAppAPI.Controllers
{
    [ApiController]
    [Route("api/[controller]")]
    public class EventsController : GenericCrudController<Event, int>
    {
        public EventsController(AppDbContext context) : base(context) { }

        private bool IsAdmin() => HttpContext.Session.GetString("IsLoggedIn") == "true" && HttpContext.Session.GetString("Role") == "Admin";

        [HttpGet] // public read with details
        public override IActionResult GetAll()
        {
            var events = _context.Events.AsQueryable().ToList();
            var result = events.Select(e => BuildDetails(e.EventId)).ToList();
            return Ok(result);
        }

        [HttpGet("{id}")]
        public override IActionResult GetById([FromRoute] int id)
        {
            var exists = _context.Events.Find(id);
            if (exists == null) return NotFound();
            var dto = BuildDetails(id);
            return Ok(dto);
        }

        [HttpPost] // admin create
        public override IActionResult Create([FromBody] EventCreateRequest req)
        {
            if (!IsAdmin())
            {
                return Unauthorized(new { message = "Admin privileges required" });
            }

            // Check if user exists
            var user = _context.Employees.Find(req.CreatedBy);
            if (user == null)
            {
                return NotFound(new { message = "User not found" });
            }

            var ev = new Event
            {
                Title = req.Title,
                Description = req.Description,
                EventDate = DateTime.SpecifyKind(req.EventDate, DateTimeKind.Utc),
                StartTime = req.StartTime,
                EndTime = req.EndTime,
                Location = req.Location,
                CreatedBy = req.CreatedBy
            };

            _context.Events.Add(ev);
            _context.SaveChanges();
            return Ok(ev);
        }

        [HttpGet("user/{userId}")] //get
        public IActionResult GetByUserId(int userId)
        {
            var events = _context.Events
                .Where(e => e.CreatedBy == userId)
                .OrderBy(e => e.EventDate)
                .ToList();
            return Ok(events);
        }

        [HttpPut("{id}")] // admin update
        public override IActionResult Update(int id, [FromBody] EventUpdateRequest updated)
        {
            if (!IsAdmin())
            {
                return Unauthorized(new { message = "Admin privileges required" });
            }

            var event_ = _context.Events.Find(id);
            if (event_ == null)
            {
                return NotFound(new { message = "Event not found" });
            }

            // Check if user exists
            var user = _context.Employees.Find(updated.CreatedBy);
            if (user == null)
            {
                return NotFound(new { message = "User not found" });
            }

            event_.Title = updated.Title;
            event_.Description = updated.Description;
            event_.EventDate = DateTime.SpecifyKind(updated.EventDate, DateTimeKind.Utc);
            event_.StartTime = updated.StartTime;
            event_.EndTime = updated.EndTime;
            event_.Location = updated.Location;
            event_.CreatedBy = updated.CreatedBy;
            _context.SaveChanges();
            return Ok(event_);
        }

        [HttpDelete("{id}")] // admin delete
        public override IActionResult Delete([FromRoute] int id)
        {
            if (!IsAdmin())
            {
                return Unauthorized(new { message = "Admin privileges required" });
            }

            var existing = _context.Events.Find(id);
            if (existing == null) return NotFound();
            _context.Events.Remove(existing);
            _context.SaveChanges();
            return Ok(new { message = "Deleted" });
        }

        [HttpPost("{id}/reviews")]
        public IActionResult AddReview([FromRoute] int id, [FromBody] EventReviewCreateRequest req)
        {
            var ev = _context.Events.Find(id);
            if (ev == null) return NotFound(new { message = "Event not found" });
            var user = _context.Employees.Find(req.UserId);
            if (user == null) return NotFound(new { message = "User not found" });

            var review = new EventReview
            {
                EventId = id,
                UserId = req.UserId,
                Rating = req.Rating,
                Comment = req.Comment,
                CreatedAt = DateTime.UtcNow
            };
            _context.EventReviews.Add(review);
            _context.SaveChanges();
            return Ok(review);
        }

        private EventDetailsResponse BuildDetails(int eventId)
        {
            var ev = _context.Events.First(e => e.EventId == eventId);
            var attendees = (from p in _context.EventParticipations
                             join emp in _context.Employees on p.UserId equals emp.UserId
                             where p.EventId == eventId
                             select new EventAttendeeDto
                             {
                                 UserId = emp.UserId,
                                 Name = emp.Name,
                                 Email = emp.Email
                             }).ToList();
            var reviews = _context.EventReviews
                .Where(r => r.EventId == eventId)
                .OrderByDescending(r => r.CreatedAt)
                .Select(r => new EventReviewDto
                {
                    ReviewId = r.ReviewId,
                    UserId = r.UserId,
                    Rating = r.Rating,
                    Comment = r.Comment,
                    CreatedAt = r.CreatedAt
                }).ToList();

            return new EventDetailsResponse
            {
                EventId = ev.EventId,
                Title = ev.Title,
                Description = ev.Description,
                EventDate = ev.EventDate,
                StartTime = ev.StartTime,
                EndTime = ev.EndTime,
                Location = ev.Location,
                CreatedBy = ev.CreatedBy,
                Attendees = attendees,
                Reviews = reviews
            };
        }
    }
}
