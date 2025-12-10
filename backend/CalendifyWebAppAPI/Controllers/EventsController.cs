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
        private readonly IReviewService _reviewService;

        public EventsController(IEventService eventService, IEventParticipationService participationService, IReviewService reviewService)
        {
            _eventService = eventService;
            _participationService = participationService;
            _reviewService = reviewService;
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


        [HttpPost("{id}/reviews")]
        public async Task<IActionResult> AddReview(int id, [FromBody] EventReview review)
        {
            var userId = HttpContext.Session.GetInt32("UserId");
            if (!userId.HasValue) return Unauthorized();

            review.EventId = id;
            review.UserId = userId.Value;

            if (review.Rating < 1 || review.Rating > 5)
            {
                return BadRequest(new { message = "Rating must be between 1 and 5" });
            }

            var addedReview = await _reviewService.AddReviewAsync(review);
            return Ok(addedReview);
        }

        [HttpGet("{id}/reviews")]
        public async Task<IActionResult> GetReviews(int id)
        {
            var reviews = await _reviewService.GetReviewsByEventIdAsync(id);
            return Ok(reviews);
        }
    }
}