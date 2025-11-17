using Microsoft.AspNetCore.Mvc;
using CalendifyWebAppAPI.Data;
using CalendifyWebAppAPI.Models;
using System.Linq;

namespace CalendifyWebAppAPI.Controllers
{
    [ApiController]
    [Route("api/[controller]")]
    public class OfficeAttendancesController : GenericCrudController<OfficeAttendance, int>
    {
        public OfficeAttendancesController(AppDbContext context) : base(context) { }

        [HttpPost] //post
        public override IActionResult Create([FromBody] OfficeAttendance attendance)
        {
            // Check if user exists
            var user = _context.Employees.Find(attendance.UserId);
            if (user == null)
            {
                return NotFound(new { message = "User not found" });
            }

            attendance.Date = DateTime.SpecifyKind(attendance.Date, DateTimeKind.Utc);
            _context.OfficeAttendances.Add(attendance);
            _context.SaveChanges();
            return Ok(attendance);
        }

        [HttpGet("user/{userId}")] //get
        public IActionResult GetByUserId(int userId)
        {
            var attendances = _context.OfficeAttendances
                .Where(a => a.UserId == userId)
                .OrderByDescending(a => a.Date)
                .ToList();
            return Ok(attendances);
        }

        [HttpGet("date/{date}")] //get
        public IActionResult GetByDate(DateTime date)
        {
            var attendances = _context.OfficeAttendances
                .Where(a => a.Date.Date == date.Date)
                .ToList();
            return Ok(attendances);
        }

        [HttpPut("{id}")] //put
        public override IActionResult Update(int id, [FromBody] OfficeAttendance updated)
        {
            var attendance = _context.OfficeAttendances.Find(id);
            if (attendance == null)
            {
                return NotFound(new { message = "Attendance record not found" });
            }

            attendance.UserId = updated.UserId;
            attendance.Date = DateTime.SpecifyKind(updated.Date, DateTimeKind.Utc);
            attendance.Status = updated.Status;
            _context.SaveChanges();
            return Ok(attendance);
        }

    }
}

