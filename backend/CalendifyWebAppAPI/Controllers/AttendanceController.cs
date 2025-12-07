using Microsoft.AspNetCore.Mvc;
using Microsoft.AspNetCore.Http;
using CalendifyWebAppAPI.Services.Interfaces;
using CalendifyWebAppAPI.Models;

namespace CalendifyWebAppAPI.Controllers
{
    [ApiController]
    [Route("api/[controller]")]
    public class AttendanceController : ControllerBase
    {
        private readonly IAttendanceService _service;

        public AttendanceController(IAttendanceService service)
        {
            _service = service;
        }

        [HttpPost]
        public IActionResult Add([FromBody] OfficeAttendance attendance)
        {
            var userId = HttpContext.Session.GetInt32("UserId");
            if (!userId.HasValue) return Unauthorized();
            if (attendance.UserId != userId.Value) return Unauthorized();

            var added = _service.AddAttendance(attendance);
            if (added == null) return BadRequest(new { message = "Date occupied" });
            return Ok(added);
        }

        [HttpGet]
        public IActionResult GetAll()
        {
            var userId = HttpContext.Session.GetInt32("UserId");
            if (!userId.HasValue) return Unauthorized();
            var attendances = _service.GetUserAttendances(userId.Value);
            return Ok(attendances);
        }

        [HttpPut("{id}")]
        public IActionResult Update(int id, [FromBody] OfficeAttendance updated)
        {
            var userId = HttpContext.Session.GetInt32("UserId");
            if (!userId.HasValue) return Unauthorized();
            var attendance = _service.UpdateAttendance(id, updated);
            if (attendance == null) return NotFound();
            return Ok(attendance);
        }

        [HttpDelete("{id}")]
        public IActionResult Delete(int id)
        {
            var userId = HttpContext.Session.GetInt32("UserId");
            if (!userId.HasValue) return Unauthorized();
            var deleted = _service.DeleteAttendance(id);
            if (!deleted) return NotFound();
            return Ok(new { message = "Deleted" });
        }
    }
}
