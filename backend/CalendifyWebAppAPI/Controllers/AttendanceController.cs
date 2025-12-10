using Microsoft.AspNetCore.Mvc;
using Microsoft.AspNetCore.Http;
using System.Threading.Tasks;
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
        public async Task<IActionResult> Add([FromBody] OfficeAttendance attendance)
        {
            var userId = HttpContext.Session.GetInt32("UserId");
            if (!userId.HasValue) return Unauthorized();
            if (attendance.UserId != userId.Value) return Unauthorized();

            var added = await _service.AddAttendanceAsync(attendance);
            if (added == null) return BadRequest(new { message = "Date occupied" });
            return Ok(added);
        }

        [HttpGet]
        public async Task<IActionResult> GetAll()
        {
            var userId = HttpContext.Session.GetInt32("UserId");
            if (!userId.HasValue) return Unauthorized();
            var attendances = await _service.GetUserAttendancesAsync(userId.Value);
            return Ok(attendances);
        }

        [HttpPut("{id}")]
        public async Task<IActionResult> Update(int id, [FromBody] OfficeAttendance updated)
        {
            var userId = HttpContext.Session.GetInt32("UserId");
            if (!userId.HasValue) return Unauthorized();
            var attendance = await _service.UpdateAttendanceAsync(id, updated);
            if (attendance == null) return NotFound();
            return Ok(attendance);
        }

        [HttpDelete("{id}")]
        public async Task<IActionResult> Delete(int id)
        {
            var userId = HttpContext.Session.GetInt32("UserId");
            if (!userId.HasValue) return Unauthorized();
            var deleted = await _service.DeleteAttendanceAsync(id);
            if (!deleted) return NotFound();
            return Ok(new { message = "Deleted" });
        }
    }
}
