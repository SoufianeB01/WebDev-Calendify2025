using CalendifyWebAppAPI.Data;
using CalendifyWebAppAPI.Models;
using Microsoft.AspNetCore.Mvc;
using System.Linq;

namespace CalendifyWebAppAPI.Controllers
{
    [ApiController]
    [Route("api/[controller]")]
    public class EventAttendanceController : ControllerBase
    {
        private readonly AppDbContext _context;

        public EventAttendanceController(AppDbContext context)
        {
            _context = context;
        }

        private bool IsLoggedIn() => HttpContext.Session.GetString("IsLoggedIn") == "true";
        private bool IsAdmin() => HttpContext.Session.GetString("Role") == "Admin";
        private int? SessionUserId()
        {
            var s = HttpContext.Session.GetString("UserId");
            if (int.TryParse(s, out var id)) return id;
            return null;
        }

        public class AttendEventRequest
        {
            public int UserId { get; set; }
            public int EventId { get; set; }
        }

        // POST: attend an event (returns the event)
        [HttpPost]
        public IActionResult Attend([FromBody] AttendEventRequest req)
        {
            if (!IsLoggedIn()) return Unauthorized(new { message = "Login required" });
            var sessionUserId = SessionUserId();
            if (sessionUserId == null) return Unauthorized(new { message = "Login required" });
            if (sessionUserId != req.UserId && !IsAdmin()) return Unauthorized(new { message = "Cannot attend for another user" });

            var user = _context.Employees.Find(req.UserId);
            if (user == null) return NotFound(new { message = "User not found" });

            var ev = _context.Events.Find(req.EventId);
            if (ev == null) return NotFound(new { message = "Event not found" });

            // Already participating?
            var exists = _context.EventParticipations.FirstOrDefault(p => p.UserId == req.UserId && p.EventId == req.EventId);
            if (exists != null) return BadRequest(new { message = "User is already participating in this event" });

            // Availability check: no overlapping events for same user on same date
            var userEventIds = _context.EventParticipations
                .Where(p => p.UserId == req.UserId)
                .Select(p => p.EventId)
                .ToList();

            var overlapping = (from e in _context.Events
                               where userEventIds.Contains(e.EventId)
                                     && e.EventDate.Date == ev.EventDate.Date
                                     && (
                                         (e.StartTime <= ev.StartTime && e.EndTime > ev.StartTime) ||
                                         (e.StartTime < ev.EndTime && e.EndTime >= ev.EndTime) ||
                                         (e.StartTime >= ev.StartTime && e.EndTime <= ev.EndTime)
                                     )
                               select e).FirstOrDefault();

            if (overlapping != null)
            {
                return BadRequest(new
                {
                    message = "User has another event at this time",
                    conflictEventId = overlapping.EventId
                });
            }

            _context.EventParticipations.Add(new EventParticipation
            {
                UserId = req.UserId,
                EventId = req.EventId,
                Status = "Going"
            });
            _context.SaveChanges();

            return Ok(ev);
        }

        // GET: attendees for an event (logged-in users)
        [HttpGet("event/{eventId}")]
        public IActionResult GetAttendees(int eventId)
        {
            if (!IsLoggedIn()) return Unauthorized(new { message = "Login required" });

            var attendees = (from p in _context.EventParticipations
                             join emp in _context.Employees on p.UserId equals emp.UserId
                             where p.EventId == eventId
                             select new
                             {
                                 emp.UserId,
                                 emp.Name,
                                 emp.Email,
                                 p.Status
                             }).ToList();
            return Ok(attendees);
        }

        // DELETE: user leaves an event they attended
        [HttpDelete("{eventId}/{userId}")]
        public IActionResult Leave(int eventId, int userId)
        {
            if (!IsLoggedIn()) return Unauthorized(new { message = "Login required" });
            var sessionUserId = SessionUserId();
            if (sessionUserId == null) return Unauthorized(new { message = "Login required" });
            if (sessionUserId != userId && !IsAdmin()) return Unauthorized(new { message = "Cannot modify another user's attendance" });

            var participation = _context.EventParticipations.FirstOrDefault(p => p.EventId == eventId && p.UserId == userId);
            if (participation == null) return NotFound(new { message = "Participation not found" });

            _context.EventParticipations.Remove(participation);
            _context.SaveChanges();
            return Ok(new { message = "User left the event" });
        }
    }
}

