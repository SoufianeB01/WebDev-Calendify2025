using Microsoft.AspNetCore.Mvc;
using CalendifyWebAppAPI.Data;
using CalendifyWebAppAPI.Models;
using Microsoft.EntityFrameworkCore;

namespace CalendifyWebAppAPI.Controllers
{
    [ApiController]
    [Route("api/[controller]")]
    public class OfficeAttendanceController : ControllerBase
    {
        private readonly AppDbContext _context;

        public OfficeAttendanceController(AppDbContext context)
        {
            _context = context;
        }

        [HttpGet]
        public async Task<IActionResult> GetAll()
        {
            var allAttendances = await _context.OfficeAttendances.ToListAsync();
            return Ok(allAttendances);
        }

        [HttpGet("{id:int}")]
        public async Task<IActionResult> GetById(int id)
        {
            var attendance = await _context.OfficeAttendances.FindAsync(id);
            if (attendance == null)
            {
                return NotFound();
            }

            return Ok(attendance);
        }

        // POST
        [HttpPost]
        public async Task<IActionResult> Create([FromBody] OfficeAttendance request)
        {
            var sessionUserId = HttpContext.Session.GetInt32("UserId");

            if (sessionUserId == null || sessionUserId.Value != request.UserId)
            {
                return Unauthorized(new { message = "Own user only" });
            }

            DateOnly requestDateOnly = DateOnly.FromDateTime(request.Date);

            var existingAttendance = await _context.OfficeAttendances.FirstOrDefaultAsync(a =>
                a.UserId == request.UserId &&
                DateOnly.FromDateTime(a.Date) == requestDateOnly
            );

            if (existingAttendance != null)
            {
                return BadRequest(new { message = "Attendance already exists for this date" });
            }

            _context.OfficeAttendances.Add(request);
            await _context.SaveChangesAsync();

            return Ok(request);
        }

        [HttpPut("{id:int}")]
        public async Task<IActionResult> Update(int id, [FromBody] OfficeAttendance request)
        {
            var sessionUserId = HttpContext.Session.GetInt32("UserId");

            if (sessionUserId == null || sessionUserId.Value != request.UserId)
            {
                return Unauthorized(new { message = "Only the logged-in user can update their own attendance" });
            }

            var existingAttendance = await _context.OfficeAttendances.FindAsync(id);
            if (existingAttendance == null)
            {
                return NotFound();
            }

            if (existingAttendance.UserId != request.UserId)
            {
                return Unauthorized(new { message = "Cannot update another user's attendance" });
            }

            existingAttendance.IsPresent = request.IsPresent;

            existingAttendance.Date = request.Date.Date;

            await _context.SaveChangesAsync();

            return Ok(existingAttendance);
        }

        [HttpDelete("{id:int}")]
        public async Task<IActionResult> Delete(int id)
        {
            var existingAttendance = await _context.OfficeAttendances.FindAsync(id);
            if (existingAttendance == null)
            {
                return NotFound();
            }

            var sessionUserId = HttpContext.Session.GetInt32("UserId");

            if (sessionUserId == null || sessionUserId.Value != existingAttendance.UserId)
            {
                return Unauthorized(new { message = "Only the logged-in user can delete their own attendance" });
            }

            _context.OfficeAttendances.Remove(existingAttendance);
            await _context.SaveChangesAsync();

            return Ok(new { message = "Deleted" });
        }

        [HttpGet("user/{userId:int}")]
        public async Task<IActionResult> GetByUser(int userId)
        {
            var items = await _context.OfficeAttendances
                .Where(a => a.UserId == userId)
                .OrderBy(a => a.Date)
                .ToListAsync();

            return Ok(items);
        }

        [HttpGet("by-date")]
        public async Task<IActionResult> GetByDate([FromQuery] int userId, [FromQuery] DateTime date)
        {
            DateOnly dateOnly = DateOnly.FromDateTime(date);

            var items = await _context.OfficeAttendances
                .Where(a => a.UserId == userId && DateOnly.FromDateTime(a.Date) == dateOnly)
                .ToListAsync();

            return Ok(items);
        }

        [HttpGet("user/{userId}/date/{date}")]
        public async Task<IActionResult> GetByUserAndDate(int userId, DateOnly date)
        {
            var targetDate = date.ToDateTime(TimeOnly.MinValue).Date;

            var attendance = await _context.OfficeAttendances.FirstOrDefaultAsync(a =>
                a.UserId == userId &&
                a.Date.Date == targetDate
            );

            return attendance == null ? NotFound() : Ok(attendance);
        }

        [HttpGet("date/{date}")]
        public async Task<IActionResult> GetByExactDate(DateOnly date)
        {
            var targetDate = date.ToDateTime(TimeOnly.MinValue).Date;

            var items = await _context.OfficeAttendances
                .Where(a => a.Date.Date == targetDate)
                .ToListAsync();

            return Ok(items);
        }

        [HttpDelete("user/{userId}/date/{date}")]
        public async Task<IActionResult> DeleteByUserAndDate(int userId, DateOnly date)
        {
            var targetDate = date.ToDateTime(TimeOnly.MinValue).Date;

            var attendance = await _context.OfficeAttendances.FirstOrDefaultAsync(a =>
                a.UserId == userId &&
                a.Date.Date == targetDate
            );

            if (attendance == null)
            {
                return NotFound();
            }

            _context.OfficeAttendances.Remove(attendance);
            await _context.SaveChangesAsync();

            return Ok(new { message = "Deleted" });
        }

        [HttpGet("user-date")]
        public async Task<IActionResult> GetByUserAndDate([FromQuery] int userId, [FromQuery] DateTime date)
        {
            DateOnly dateOnly = DateOnly.FromDateTime(date);

            var attendance = await _context.OfficeAttendances.FirstOrDefaultAsync(a =>
                a.UserId == userId &&
                DateOnly.FromDateTime(a.Date) == dateOnly
            );

            if (attendance == null)
            {
                return NotFound(new { message = "No attendance for this date" });
            }

            return Ok(attendance);
        }
    }
}
