using Microsoft.AspNetCore.Mvc;
using CalendifyWebAppAPI.Interfaces;
using CalendifyWebAppAPI.Models;
using Microsoft.AspNetCore.Http;
using System.Collections.Generic;
using System.Threading.Tasks;

namespace CalendifyWebAppAPI.Controllers
{
    [ApiController]
    [Route("api/[controller]")]
    public class EventsController : ControllerBase
    {
        private readonly IEventService _eventService;
        private readonly IEventParticipationService _participationService;

        public EventsController(IEventService eventService, IEventParticipationService participationService)
        {
            _eventService = eventService;
            _participationService = participationService;
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
                return Ok(new { message = "No events found", events = new List<EventDto>() });
            return Ok(events);
        }

        [HttpGet("{id}")]
        public async Task<IActionResult> GetById(int id)
        {
            var ev = await _eventService.GetEventByIdAsync(id);
            if (ev == null) return NotFound(new { message = "Event not found" });
            return Ok(ev);
        }

        [HttpGet("user/{userId}")]
        public async Task<IActionResult> GetByUser(int userId)
        {
            var events = await _eventService.GetEventsByUserAsync(userId);
            if (events == null || events.Count == 0)
                return Ok(new { message = "No events found for user", events = new List<Event>() });
            return Ok(events);
        }

        [HttpPost]
        public async Task<IActionResult> Create([FromBody] Event ev)
        {
            if (!IsAdmin()) return Unauthorized(new { message = "Admin privileges required" });
            var created = await _eventService.CreateEventAsync(ev);
            return Ok(created);
        }

        [HttpPut("{id}")]
        public async Task<IActionResult> Update(int id, [FromBody] Event ev)
        {
            if (!IsAdmin()) return Unauthorized(new { message = "Admin privileges required" });
            var updated = await _eventService.UpdateEventAsync(id, ev);
            if (updated == null) return NotFound(new { message = "Event not found" });
            return Ok(updated);
        }

        [HttpDelete("{id}")]
        public async Task<IActionResult> Delete(int id)
        {
            if (!IsAdmin()) return Unauthorized(new { message = "Admin privileges required" });
            var deleted = await _eventService.DeleteEventAsync(id);
            if (!deleted) return NotFound(new { message = "Event not found" });
            return Ok(new { message = "Deleted" });
        }

        [HttpGet("{id}/attend")]
        public async Task<IActionResult> AttendEvent(int id)
        {
            var userId = HttpContext.Session.GetInt32("UserId");
            if (!userId.HasValue) return Unauthorized();

            var attendance = await _participationService.AttendEventAsync(userId.Value, id);
            return Ok(attendance);
        }

        [HttpGet("{id}/attendees")]
        public async Task<IActionResult> GetAttendees(int id)
        {
            var attendees = await _participationService.GetAttendeesAsync(id);
            if (attendees == null || attendees.Count == 0)
                return Ok(new { message = "No attendees for this event", attendees = new List<int>() });
            return Ok(attendees);
        }

        [HttpDelete("{id}/attend")]
        public async Task<IActionResult> CancelAttendance(int id)
        {
            var userId = HttpContext.Session.GetInt32("UserId");
            if (!userId.HasValue) return Unauthorized();

            var canceled = await _participationService.CancelAttendanceAsync(userId.Value, id);
            if (!canceled) return NotFound();
            return Ok(new { message = "Canceled" });
        }
    }
}