using Microsoft.AspNetCore.Mvc;
using CalendifyWebAppAPI.Data;
using CalendifyWebAppAPI.Models;
using System.Linq;

namespace CalendifyWebAppAPI.Controllers
{
    [ApiController]
    [Route("api/[controller]")]
    public class EventParticipationsController : ControllerBase
    {
        private readonly AppDbContext _context;

        public EventParticipationsController(AppDbContext context)
        {
            _context = context;
        }

        [HttpGet] //get
        public IActionResult GetAll()
        {
            var participations = _context.EventParticipations.ToList();
            return Ok(participations);
        }

        [HttpPost] //post
        public IActionResult JoinEvent([FromBody] EventParticipation participation)
        {
            // Check if user exists
            var user = _context.Employees.Find(participation.UserId);
            if (user == null)
            {
                return NotFound(new { message = "User not found" });
            }

            // Check if event exists
            var event_ = _context.Events.Find(participation.EventId);
            if (event_ == null)
            {
                return NotFound(new { message = "Event not found" });
            }

            // Check if participation already exists
            var existingParticipation = _context.EventParticipations.FirstOrDefault(p =>
                p.UserId == participation.UserId && p.EventId == participation.EventId);
            if (existingParticipation != null)
            {
                return BadRequest(new { message = "User is already participating in this event" });
            }

            _context.EventParticipations.Add(participation);
            _context.SaveChanges();
            return Ok(participation);
        }

        [HttpGet("event/{eventId}")] //get
        public IActionResult GetEventParticipants(int eventId)
        {
            var participations = _context.EventParticipations
                .Where(p => p.EventId == eventId)
                .ToList();
            return Ok(participations);
        }

        [HttpGet("user/{userId}")] //get
        public IActionResult GetUserEvents(int userId)
        {
            var participations = _context.EventParticipations
                .Where(p => p.UserId == userId)
                .ToList();
            return Ok(participations);
        }

        [HttpPut] //put
        public IActionResult UpdateStatus([FromBody] EventParticipation updatedParticipation)
        {
            var participation = _context.EventParticipations.FirstOrDefault(p =>
                p.UserId == updatedParticipation.UserId && p.EventId == updatedParticipation.EventId);
            if (participation == null)
            {
                return NotFound(new { message = "Participation not found" });
            }

            participation.Status = updatedParticipation.Status;
            _context.SaveChanges();
            return Ok(participation);
        }

        [HttpDelete("{eventId}/{userId}")] //delete
        public IActionResult LeaveEvent(int eventId, int userId)
        {
            var participation = _context.EventParticipations.FirstOrDefault(p =>
                p.UserId == userId && p.EventId == eventId);
            if (participation == null)
            {
                return NotFound(new { message = "Participation not found" });
            }

            _context.EventParticipations.Remove(participation);
            _context.SaveChanges();
            return Ok(new { message = "User left the event" });
        }
    }
}

