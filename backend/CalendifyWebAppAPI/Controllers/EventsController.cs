using Microsoft.AspNetCore.Mvc;
using CalendifyWebAppAPI.Data;
using CalendifyWebAppAPI.Models;
using System.Linq;

namespace CalendifyWebAppAPI.Controllers
{
    [ApiController]
    [Route("api/[controller]")]
    public class EventsController : ControllerBase
    {
        private readonly AppDbContext _context;

        public EventsController(AppDbContext context)
        {
            _context = context;
        }

        [HttpPost] //post
        public IActionResult Create([FromBody] Event event_)
        {
            _context.Events.Add(event_);
            _context.SaveChanges();
            return CreatedAtAction(nameof(GetById), new { id = event_.EventId }, event_);
        }

        [HttpGet] //get
        public IActionResult GetAll()
        {
            var events = _context.Events.ToList();
            return Ok(events);
        }

        [HttpGet("{id}")] //get
        public IActionResult GetById(int id)
        {
            var event_ = _context.Events.Find(id);
            if (event_ == null) return NotFound();
            return Ok(event_);
        }

        [HttpPut("{id}")] //put
        public IActionResult Update(int id, [FromBody] Event updated)
        {
            var event_ = _context.Events.Find(id);
            if (event_ == null) return NotFound();

            event_.Title = updated.Title;
            event_.Description = updated.Description;
            event_.EventDate = updated.EventDate;
            event_.CreatedBy = updated.CreatedBy;
            _context.SaveChanges();
            return NoContent();
        }

        [HttpDelete("{id}")] //delete
        public IActionResult Delete(int id)
        {
            var event_ = _context.Events.Find(id);
            if (event_ == null) return NotFound();
            _context.Events.Remove(event_);
            _context.SaveChanges();
            return NoContent();
        }
    }
}
