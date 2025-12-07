using Microsoft.AspNetCore.Mvc;
using CalendifyWebAppAPI.Data;
using CalendifyWebAppAPI.Models;
using CalendifyWebAppAPI.Services.Interfaces;
using Microsoft.EntityFrameworkCore;

namespace CalendifyWebAppAPI.Controllers
{
    [ApiController]
    [Route("api/[controller]")]
    public class EventAttendanceController : ControllerBase
    {
        private readonly AppDbContext _context;
        private readonly IEventAttendanceService _service;

        public EventAttendanceController(AppDbContext context, IEventAttendanceService service)
        {
            _context = context;
            _service = service;
        }

        // POST /api/eventattendance
        [HttpPost]
        public async Task<IActionResult> Attend([FromBody] EventParticipation participation)
        {
            if (participation == null)
                return BadRequest(new { message = "Invalid payload" });

            var user = await _context.Employees.FindAsync(participation.UserId);
            if (user == null)
                return NotFound(new { message = "User not found" });

            var ev = await _context.Events.FindAsync(participation.EventId);
            if (ev == null)
                return NotFound(new { message = "Event not found" });

            var exists = await _context.EventParticipations.AnyAsync(x =>
                x.UserId == participation.UserId && x.EventId == participation.EventId);
            if (exists)
                return BadRequest(new { message = "Already attending" });

            await _context.EventParticipations.AddAsync(new EventParticipation
            {
                UserId = participation.UserId,
                EventId = participation.EventId
            });
            await _context.SaveChangesAsync();

            return Ok(new { message = "Attending" });
        }

        // GET /api/eventattendance/attendees/{eventId}
        [HttpGet("attendees/{eventId:int}")]
        public async Task<IActionResult> GetAttendees([FromRoute] int eventId)
        {
            var attendees = await (from p in _context.EventParticipations
                                   join emp in _context.Employees on p.UserId equals emp.UserId
                                   where p.EventId == eventId
                                   select new { emp.UserId, emp.Name, emp.Email })
                                   .ToListAsync();

            return Ok(attendees);
        }
    }
}

