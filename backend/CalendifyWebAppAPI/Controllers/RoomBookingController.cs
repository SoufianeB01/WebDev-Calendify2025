using Microsoft.AspNetCore.Mvc;
using Microsoft.AspNetCore.Http;
using System.Threading.Tasks;
using CalendifyWebAppAPI.Services.Interfaces;
using CalendifyWebAppAPI.Models;

namespace CalendifyWebAppAPI.Controllers
{
    [ApiController]
    [Route("api/[controller]")]
    public class RoomBookingController : ControllerBase
    {
        private readonly IRoomBookingService _service;

        public RoomBookingController(IRoomBookingService service)
        {
            _service = service;
        }

        [HttpPost]
        public async Task<IActionResult> Book([FromBody] RoomBooking booking)
        {
            var userId = HttpContext.Session.GetInt32("UserId");
            if (!userId.HasValue) return Unauthorized();
            if (booking.UserId != userId.Value) return Unauthorized();

            var booked = await _service.BookRoomAsync(booking);
            if (booked == null) return BadRequest(new { message = "Room occupied" });
            return Ok(booked);
        }

        [HttpGet]
        public async Task<IActionResult> GetBookings()
        {
            var userId = HttpContext.Session.GetInt32("UserId");
            if (!userId.HasValue) return Unauthorized();
            var bookings = await _service.GetUserBookingsAsync(userId.Value);
            return Ok(bookings);
        }

        [HttpPut]
        public async Task<IActionResult> Update([FromBody] RoomBooking updated)
        {
            var userId = HttpContext.Session.GetInt32("UserId");
            if (!userId.HasValue) return Unauthorized();
            if (updated.UserId != userId.Value) return Unauthorized();

            var result = await _service.UpdateBookingAsync(updated.RoomId, updated.UserId, updated);
            if (result == null) return NotFound();
            return Ok(result);
        }

        [HttpDelete]
        public async Task<IActionResult> Delete([FromBody] RoomBooking booking)
        {
            var userId = HttpContext.Session.GetInt32("UserId");
            if (!userId.HasValue) return Unauthorized();
            if (booking.UserId != userId.Value) return Unauthorized();

            var deleted = await _service.DeleteBookingAsync(booking.RoomId, booking.UserId, booking.BookingDate, booking.StartTime);
            if (!deleted) return NotFound();
            return Ok(new { message = "Deleted" });
        }
    }
}