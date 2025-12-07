using Microsoft.AspNetCore.Mvc;
using Microsoft.AspNetCore.Http;
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
        public IActionResult Book([FromBody] RoomBooking booking)
        {
            var userId = HttpContext.Session.GetInt32("UserId");
            if (!userId.HasValue) return Unauthorized();
            if (booking.UserId != userId.Value) return Unauthorized();

            var booked = _service.BookRoom(booking);
            if (booked == null) return BadRequest(new { message = "Room occupied" });
            return Ok(booked);
        }

        [HttpGet]
        public IActionResult GetBookings()
        {
            var userId = HttpContext.Session.GetInt32("UserId");
            if (!userId.HasValue) return Unauthorized();
            var bookings = _service.GetUserBookings(userId.Value);
            return Ok(bookings);
        }

        [HttpPut]
        public IActionResult Update([FromBody] RoomBooking updated)
        {
            var userId = HttpContext.Session.GetInt32("UserId");
            if (!userId.HasValue) return Unauthorized();
            if (updated.UserId != userId.Value) return Unauthorized();

            var result = _service.UpdateBooking(updated.RoomId, updated.UserId, updated);
            if (result == null) return NotFound();
            return Ok(result);
        }

        [HttpDelete]
        public IActionResult Delete([FromBody] RoomBooking booking)
        {
            var userId = HttpContext.Session.GetInt32("UserId");
            if (!userId.HasValue) return Unauthorized();
            if (booking.UserId != userId.Value) return Unauthorized();

            var deleted = _service.DeleteBooking(booking.RoomId, booking.UserId, booking.BookingDate, booking.StartTime);
            if (!deleted) return NotFound();
            return Ok(new { message = "Deleted" });
        }
    }
}