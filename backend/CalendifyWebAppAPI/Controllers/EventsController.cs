using Microsoft.AspNetCore.Mvc;
using CalendifyWebAppAPI.Data;
using CalendifyWebAppAPI.Models;
using System.Linq;

namespace CalendifyWebAppAPI.Controllers
{
    [ApiController]
    [Route("api/[controller]")]
    public class EventsController : GenericCrudController<Event, int>
    {
        public EventsController(AppDbContext context) : base(context) { }

        [HttpPost] //post
        public override IActionResult Create([FromBody] Event event_)
        {
            // Check if user exists
            var user = _context.Employees.Find(event_.CreatedBy);
            if (user == null)
            {
                return NotFound(new { message = "User not found" });
            }

            event_.EventDate = DateTime.SpecifyKind(event_.EventDate, DateTimeKind.Utc);
            _context.Events.Add(event_);
            _context.SaveChanges();
            return Ok(event_);
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

        [HttpPut("{id}")] //put
        public override IActionResult Update(int id, [FromBody] Event updated)
        {
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
            event_.CreatedBy = updated.CreatedBy;
            _context.SaveChanges();
            return Ok(event_);
        }

    }
}
