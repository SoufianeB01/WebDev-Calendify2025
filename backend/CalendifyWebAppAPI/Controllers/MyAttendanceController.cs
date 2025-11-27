using CalendifyWebAppAPI.Data;
using CalendifyWebAppAPI.Models;
using Microsoft.AspNetCore.Mvc;
using System.Linq;

namespace CalendifyWebAppAPI.Controllers
{
    [ApiController]
    [Route("api/[controller]")]
    public class MyAttendanceController : ControllerBase
    {
        private readonly AppDbContext _context;

        public MyAttendanceController(AppDbContext context)
        {
            _context = context;
        }

        private bool IsLoggedIn() => HttpContext.Session.GetString("IsLoggedIn") == "true";
        private int? SessionUserId()
        {
            var s = HttpContext.Session.GetString("UserId");
            if (int.TryParse(s, out var id)) return id;
            return null;
        }

        public class CreateRequest
        {
            public DateTime Date { get; set; }
            public string Status { get; set; }
        }

        public class UpdateRequest
        {
            public DateTime Date { get; set; }
            public string Status { get; set; }
        }

        [HttpGet]
        public IActionResult GetMine()
        {
            if (!IsLoggedIn()) return Unauthorized(new { message = "Login required" });
            var userId = SessionUserId();
            if (userId == null) return Unauthorized(new { message = "Login required" });

            var items = _context.OfficeAttendances
                .Where(a => a.UserId == userId)
                .OrderByDescending(a => a.Date)
                .ToList();
            return Ok(items);
        }

        [HttpPost]
        public IActionResult CreateMine([FromBody] CreateRequest req)
        {
            if (!IsLoggedIn()) return Unauthorized(new { message = "Login required" });
            var userId = SessionUserId();
            if (userId == null) return Unauthorized(new { message = "Login required" });

            var dateUtc = DateTime.SpecifyKind(req.Date, DateTimeKind.Utc);
            var exists = _context.OfficeAttendances.Any(a => a.UserId == userId && a.Date.Date == dateUtc.Date);
            if (exists)
            {
                return BadRequest(new { message = "Attendance already exists for this date" });
            }

            var attendance = new OfficeAttendance
            {
                UserId = userId.Value,
                Date = dateUtc,
                Status = req.Status
            };
            _context.OfficeAttendances.Add(attendance);
            _context.SaveChanges();
            return Ok(attendance);
        }

        [HttpPut("{id}")]
        public IActionResult UpdateMine(int id, [FromBody] UpdateRequest req)
        {
            if (!IsLoggedIn()) return Unauthorized(new { message = "Login required" });
            var userId = SessionUserId();
            if (userId == null) return Unauthorized(new { message = "Login required" });

            var attendance = _context.OfficeAttendances.Find(id);
            if (attendance == null) return NotFound(new { message = "Attendance record not found" });
            if (attendance.UserId != userId) return Unauthorized(new { message = "Cannot modify another user's attendance" });

            var dateUtc = DateTime.SpecifyKind(req.Date, DateTimeKind.Utc);
            var collision = _context.OfficeAttendances.Any(a => a.UserId == userId && a.Date.Date == dateUtc.Date && a.AttendanceId != id);
            if (collision)
            {
                return BadRequest(new { message = "Attendance already exists for this date" });
            }

            attendance.Date = dateUtc;
            attendance.Status = req.Status;
            _context.SaveChanges();
            return Ok(attendance);
        }

        [HttpDelete("{id}")]
        public IActionResult DeleteMine(int id)
        {
            if (!IsLoggedIn()) return Unauthorized(new { message = "Login required" });
            var userId = SessionUserId();
            if (userId == null) return Unauthorized(new { message = "Login required" });

            var attendance = _context.OfficeAttendances.Find(id);
            if (attendance == null) return NotFound(new { message = "Attendance record not found" });
            if (attendance.UserId != userId) return Unauthorized(new { message = "Cannot modify another user's attendance" });

            _context.OfficeAttendances.Remove(attendance);
            _context.SaveChanges();
            return Ok(new { message = "Attendance deleted" });
        }
    }
}

