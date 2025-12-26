using Microsoft.AspNetCore.Mvc;
using Microsoft.AspNetCore.Http;
using System;
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
            var userIdStr = HttpContext.Session.GetString("UserId");
            if (string.IsNullOrEmpty(userIdStr) || !Guid.TryParse(userIdStr, out Guid userId))
                return Unauthorized();
            if (attendance.UserId != userId) return Unauthorized();

            var added = await _service.AddAttendanceAsync(attendance);
            if (added == null) return BadRequest(new { message = "Date occupied" });
            return Ok(added);
        }

        [HttpGet]
        public async Task<IActionResult> GetAll()
        {
            var userIdStr = HttpContext.Session.GetString("UserId");
            if (string.IsNullOrEmpty(userIdStr) || !Guid.TryParse(userIdStr, out Guid userId))
                return Unauthorized();
            var attendances = await _service.GetUserAttendancesAsync(userId);
            return Ok(attendances);
        }

        [HttpPut("{id}")]
        public async Task<IActionResult> Update(string id, [FromBody] OfficeAttendance updated)
        {
            if (!Guid.TryParse(id, out Guid attendanceId))
                return BadRequest(new { message = "Invalid attendance ID format" });
            
            var userIdStr = HttpContext.Session.GetString("UserId");
            if (string.IsNullOrEmpty(userIdStr) || !Guid.TryParse(userIdStr, out Guid userId))
                return Unauthorized();
            
            var attendance = await _service.UpdateAttendanceAsync(attendanceId, updated);
            if (attendance == null) return NotFound();
            return Ok(attendance);
        }

        [HttpDelete("{id}")]
        public async Task<IActionResult> Delete(string id)
        {
            if (!Guid.TryParse(id, out Guid attendanceId))
                return BadRequest(new { message = "Invalid attendance ID format" });
            
            var userIdStr = HttpContext.Session.GetString("UserId");
            if (string.IsNullOrEmpty(userIdStr) || !Guid.TryParse(userIdStr, out Guid userId))
                return Unauthorized();
            
            var deleted = await _service.DeleteAttendanceAsync(attendanceId);
            if (!deleted) return NotFound();
            return Ok(new { message = "Deleted" });
        }
    }
}
