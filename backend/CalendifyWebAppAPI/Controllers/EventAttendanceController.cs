using Microsoft.AspNetCore.Mvc;
using Microsoft.AspNetCore.Http;
using System.Threading.Tasks;
using CalendifyWebAppAPI.Interfaces;
using CalendifyWebAppAPI.Models;
using System.Collections.Generic;

namespace CalendifyWebAppAPI.Controllers
{
    [ApiController]
    [Route("api/[controller]")]
    public class EventAttendanceController : ControllerBase
    {
        private readonly IEventService _eventService;
        private readonly IEventParticipationService _participationService;

        public EventAttendanceController(IEventService eventService, IEventParticipationService participationService)
        {
            _eventService = eventService;
            _participationService = participationService;
        }

        [HttpPost]
        public async Task<IActionResult> AttendEvent([FromBody] AttendEventRequest request)
        {
            var userId = HttpContext.Session.GetInt32("UserId");
            if (!userId.HasValue) return Unauthorized(new { message = "User must be logged in" });

            // Validate that the userId in request matches the logged-in user
            if (request.UserId != userId.Value)
            {
                return Unauthorized(new { message = "User can only attend events for themselves" });
            }

            // Get the event
            var eventDto = await _eventService.GetEventByIdAsync(request.EventId);
            if (eventDto == null)
            {
                return NotFound(new { message = "Event not found" });
            }

            // Check event availability based on date and start time
            var now = DateTime.UtcNow;
            var eventDateTime = eventDto.EventDate.Date.Add(eventDto.StartTime);
            
            if (eventDateTime < now)
            {
                return BadRequest(new { message = "Event has already passed" });
            }

            // Check if user is already attending (this will be checked in the service, but we check here for better error message)
            var existingAttendees = await _participationService.GetAttendeesAsync(request.EventId);
            if (existingAttendees.Contains(request.UserId))
            {
                return BadRequest(new { message = "User is already attending this event" });
            }

            // Add attendance
            await _participationService.AttendEventAsync(request.UserId, request.EventId);

            // Return the event
            var updatedEvent = await _eventService.GetEventByIdAsync(request.EventId);
            return Ok(updatedEvent);
        }

        [HttpGet("{eventId}/attendees")]
        public async Task<IActionResult> GetAttendees(int eventId)
        {
            var userId = HttpContext.Session.GetInt32("UserId");
            if (!userId.HasValue) return Unauthorized(new { message = "User must be logged in" });

            var attendees = await _participationService.GetAttendeesAsync(eventId);
            if (attendees == null || attendees.Count == 0)
                return Ok(new { message = "No attendees for this event", attendees = new List<int>() });
            return Ok(attendees);
        }

        [HttpDelete("{eventId}")]
        public async Task<IActionResult> CancelAttendance(int eventId)
        {
            var userId = HttpContext.Session.GetInt32("UserId");
            if (!userId.HasValue) return Unauthorized(new { message = "User must be logged in" });

            var canceled = await _participationService.CancelAttendanceAsync(userId.Value, eventId);
            if (!canceled) return NotFound(new { message = "Attendance not found" });
            return Ok(new { message = "Attendance canceled successfully" });
        }
    }

    public class AttendEventRequest
    {
        public int UserId { get; set; }
        public int EventId { get; set; }
    }
}

