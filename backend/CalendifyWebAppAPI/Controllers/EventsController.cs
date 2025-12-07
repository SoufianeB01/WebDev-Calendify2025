using Microsoft.AspNetCore.Mvc;
using CalendifyWebAppAPI.Interfaces;
using CalendifyWebAppAPI.Models;
using Microsoft.AspNetCore.Http;
using System.Collections.Generic;

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
        public IActionResult GetAll()
        {
            var events = _eventService.GetAllEvents();
            if (events == null || events.Count == 0)
                return Ok(new { message = "No events found", events = new List<Event>() });
            return Ok(events);
        }

        [HttpGet("{id}")]
        public IActionResult GetById(int id)
        {
            var ev = _eventService.GetEventById(id);
            if (ev == null) return NotFound(new { message = "Event not found" });
            return Ok(ev);
        }

        [HttpGet("user/{userId}")]
        public IActionResult GetByUser(int userId)
        {
            var events = _eventService.GetEventsByUser(userId);
            if (events == null || events.Count == 0)
                return Ok(new { message = "No events found for user", events = new List<Event>() });
            return Ok(events);
        }

        [HttpPost]
        public IActionResult Create([FromBody] Event ev)
        {
            if (!IsAdmin()) return Unauthorized(new { message = "Admin privileges required" });
            var created = _eventService.CreateEvent(ev);
            return Ok(created);
        }

        [HttpPut("{id}")]
        public IActionResult Update(int id, [FromBody] Event ev)
        {
            if (!IsAdmin()) return Unauthorized(new { message = "Admin privileges required" });
            var updated = _eventService.UpdateEvent(id, ev);
            if (updated == null) return NotFound(new { message = "Event not found" });
            return Ok(updated);
        }

        [HttpDelete("{id}")]
        public IActionResult Delete(int id)
        {
            if (!IsAdmin()) return Unauthorized(new { message = "Admin privileges required" });
            var deleted = _eventService.DeleteEvent(id);
            if (!deleted) return NotFound(new { message = "Event not found" });
            return Ok(new { message = "Deleted" });
        }

        [HttpGet("{id}/attend")]
        public IActionResult AttendEvent(int id)
        {
            var userId = HttpContext.Session.GetInt32("UserId");
            if (!userId.HasValue) return Unauthorized();

            var attendance = _participationService.AttendEvent(userId.Value, id);
            return Ok(attendance);
        }

        [HttpGet("{id}/attendees")]
        public IActionResult GetAttendees(int id)
        {
            var attendees = _participationService.GetAttendees(id);
            if (attendees == null || attendees.Count == 0)
                return Ok(new { message = "No attendees for this event", attendees = new List<int>() });
            return Ok(attendees);
        }

        [HttpDelete("{id}/attend")]
        public IActionResult CancelAttendance(int id)
        {
            var userId = HttpContext.Session.GetInt32("UserId");
            if (!userId.HasValue) return Unauthorized();

            var canceled = _participationService.CancelAttendance(userId.Value, id);
            if (!canceled) return NotFound();
            return Ok(new { message = "Canceled" });
        }
    }
}