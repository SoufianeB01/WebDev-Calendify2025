using Microsoft.AspNetCore.Mvc;
using CalendifyWebAppAPI.Data;
using CalendifyWebAppAPI.Models;
using CalendifyWebAppAPI.Services.Interfaces;
using Microsoft.EntityFrameworkCore;

namespace CalendifyWebAppAPI.Controllers
{
    [ApiController]
    [Route("api/[controller]")]
    public class RoomBookingsController : ControllerBase
    {
        private readonly AppDbContext _context;
        private readonly IRoomBookingService _service;

        public RoomBookingsController(AppDbContext context, IRoomBookingService service)
        {
            _context = context;
            _service = service;
        }

        [HttpPost]
        public async Task<IActionResult> Create([FromBody] RoomBooking req)
        {
            // Ensure DateOnly/TimeOnly are correctly set if client sends ISO strings
            req.BookingDate = req.BookingDate.HasValue ? req.BookingDate.Value : DateTime.Now;
            req.StartTime = req.StartTime.HasValue ? req.StartTime.Value : TimeSpan.Zero;
            req.EndTime = req.EndTime.HasValue ? req.EndTime.Value : TimeSpan.Zero;

            var (success, error, booking) = await _service.CreateAsync(req);
            if (!success) return BadRequest(new { message = error });
            return Ok(booking);
        }

        [HttpGet("room/{roomId}/date/{date}")]
        public async Task<IActionResult> GetByRoomAndDate(int roomId, string date)
        {
            if (!DateOnly.TryParse(date, out var bookingDate))
                return BadRequest(new { message = "Invalid date format. Use YYYY-MM-DD" });

            var list = await _service.GetByRoomAndDateAsync(roomId, bookingDate);
            return Ok(list);
        }

        [HttpDelete]
        public async Task<IActionResult> Cancel([FromQuery] int roomId, [FromQuery] int userId, [FromQuery] string date, [FromQuery] string start)
        {
        [HttpPut]
        public async Task<IActionResult> Update([FromBody] RoomBooking req)
        {
            var result = await _roomBookingService.UpdateAsync(req);
            if (!result.success)
            {
                return BadRequest(new { message = result.error });
            }
            return Ok(result.booking);
        }

        [HttpDelete]
        public async Task<IActionResult> Delete([FromBody] RoomBooking req)
        {
            var cancelDateOnly = DateOnly.FromDateTime(req.BookingDate);
            var success = await _roomBookingService.DeleteAsync(
                req.RoomId,
                req.UserId,
                cancelDateOnly,
                req.StartTime
            );
            if (!success)
            {
                return NotFound(new { message = "Room booking not found" });
            }
            return Ok(new { message = "Deleted" });
        }
    }
}
