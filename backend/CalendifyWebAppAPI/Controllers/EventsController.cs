using Microsoft.AspNetCore.Mvc;
using CalendifyWebAppAPI.Data;
using CalendifyWebAppAPI.Models;
using System.Linq;
using Microsoft.EntityFrameworkCore;
using CalendifyWebAppAPI.Services.Interfaces;

namespace CalendifyWebAppAPI.Controllers
{
    [ApiController]
    [Route("api/[controller]")]
    public class EventsController : GenericCrudController<Event, int>
    {
        private readonly IEventService _eventService;

        public EventsController(AppDbContext context, IEventService eventService) : base(context)
        {
            _eventService = eventService;
        }

        private bool IsAdmin()
        {
            var uid = HttpContext.Session.GetInt32("UserId");
            var role = HttpContext.Session.GetString("UserRole");
            return uid != null && role == "Admin";
        }

        public override async Task<IActionResult> GetAll()
        {
            var events = await _eventService.GetAllAsync();

            var detailsTasks = events.Select(async ev =>
            {
                var attendees = await (from p in _context.EventParticipations
                                       join emp in _context.Employees on p.UserId equals emp.UserId
                                       where p.EventId == ev.EventId
                                       select new { emp.UserId, emp.Name, emp.Email }).ToListAsync();

                var reviews = await _context.EventReviews
                    .Where(r => r.EventId == ev.EventId)
                    .OrderByDescending(r => r.CreatedAt)
                    .Select(r => new { r.ReviewId, r.UserId, r.Rating, r.Comment, r.CreatedAt })
                    .ToListAsync();

                return new
                {
                    ev.EventId,
                    ev.Title,
                    ev.Description,
                    ev.EventDate,
                    ev.StartTime,
                    ev.EndTime,
                    ev.Location,
                    ev.CreatedBy,
                    Attendees = attendees,
                    Reviews = reviews
                };
            });

            var result = await Task.WhenAll(detailsTasks);
            return Ok(result);
        }

        public override async Task<IActionResult> GetById([FromRoute] int id)
        {
            var ev = await _eventService.GetByIdAsync(id);
            if (ev == null) return NotFound();

            var attendees = await (from p in _context.EventParticipations
                                   join emp in _context.Employees on p.UserId equals emp.UserId
                                   where p.EventId == id
                                   select new { emp.UserId, emp.Name, emp.Email }).ToListAsync();

            var reviews = await _context.EventReviews
                .Where(r => r.EventId == id)
                .OrderByDescending(r => r.CreatedAt)
                .Select(r => new { r.ReviewId, r.UserId, r.Rating, r.Comment, r.CreatedAt })
                .ToListAsync();

            return Ok(new
            {
                ev.EventId,
                ev.Title,
                ev.Description,
                ev.EventDate,
                ev.StartTime,
                ev.EndTime,
                ev.Location,
                ev.CreatedBy,
                Attendees = attendees,
                Reviews = reviews
            });
        }

        [HttpPost]
        public override async Task<IActionResult> Create([Bind("Title,Description,EventDate,StartTime,EndTime,Location,CreatedBy")] Event req)
        {
            if (!IsAdmin()) return Unauthorized(new { message = "Admin privileges required" });

            var user = await _context.Employees.FindAsync(req.CreatedBy);
            if (user == null) return NotFound(new { message = "User not found" });

            var (success, error, ev) = await _eventService.CreateAsync(req);
            if (!success) return BadRequest(new { message = error });

            return Ok(ev);
        }

        [HttpPut("{id}")]
        public override async Task<IActionResult> Update(int id, [Bind("Title,Description,EventDate,StartTime,EndTime,Location,CreatedBy")] Event updated)
        {
            if (!IsAdmin()) return Unauthorized(new { message = "Admin privileges required" });

            var user = await _context.Employees.FindAsync(updated.CreatedBy);
            if (user == null) return NotFound(new { message = "User not found" });

            updated.EventId = id;
            var (success, error, ev) = await _eventService.UpdateAsync(updated);
            if (!success) return BadRequest(new { message = error });

            return Ok(ev);
        }

        public override async Task<IActionResult> Delete([FromRoute] int id)
        {
            if (!IsAdmin()) return Unauthorized(new { message = "Admin privileges required" });

            var (success, error) = await _eventService.DeleteAsync(id);
            if (!success) return NotFound(new { message = error });

            return Ok(new { message = "Deleted" });
        }

        [HttpPost("{id}/reviews")]
        public async Task<IActionResult> AddReview([FromRoute] int id, [FromBody] EventReview req)
        {
            var ev = await _context.Events.FindAsync(id);
            if (ev == null) return NotFound(new { message = "Event not found" });

            var user = await _context.Employees.FindAsync(req.UserId);
            if (user == null) return NotFound(new { message = "User not found" });

            var review = new EventReview
            {
                EventId = id,
                UserId = req.UserId,
                Rating = req.Rating,
                Comment = req.Comment,
                CreatedAt = DateTime.UtcNow
            };

            await _context.EventReviews.AddAsync(review);
            await _context.SaveChangesAsync();
            return Ok(review);
        }
    }
}
