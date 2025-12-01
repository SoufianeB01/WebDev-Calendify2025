using CalendifyWebAppAPI.Data;
using CalendifyWebAppAPI.Models;
using Microsoft.AspNetCore.Mvc;
using System.Linq;

namespace CalendifyWebAppAPI.Controllers
{
    [ApiController]
    [Route("api/[controller]")]
    public class MyRoomBookingsController : ControllerBase
    {
        private readonly AppDbContext _context;

        public MyRoomBookingsController(AppDbContext context)
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
            public int RoomId { get; set; }
            public DateTime BookingDate { get; set; }
            public TimeSpan StartTime { get; set; }
            public TimeSpan EndTime { get; set; }
            public string Purpose { get; set; }
        }

        [HttpGet]
        public IActionResult GetMine()
        {
            if (!IsLoggedIn()) return Unauthorized(new { message = "Login required" });
            var userId = SessionUserId();
            if (userId == null) return Unauthorized(new { message = "Login required" });

            var list = _context.RoomBookings
                .Where(b => b.UserId == userId)
                .OrderByDescending(b => b.BookingDate)
                .ThenBy(b => b.StartTime)
                .ToList();

            return Ok(list);
        }

        [HttpPost]
        public IActionResult Create([FromBody] CreateRequest req)
        {
            if (!IsLoggedIn()) return Unauthorized(new { message = "Login required" });
            var userId = SessionUserId();
            if (userId == null) return Unauthorized(new { message = "Login required" });

            var room = _context.Rooms.Find(req.RoomId);
            if (room == null) return NotFound(new { message = "Room not found" });

            var dateUtc = DateTime.SpecifyKind(req.BookingDate, DateTimeKind.Utc);

            // Check conflicts on same room/date with overlap
            var conflicting = _context.RoomBookings.FirstOrDefault(b =>
                b.RoomId == req.RoomId &&
                b.BookingDate.Date == dateUtc.Date &&
                ((b.StartTime <= req.StartTime && b.EndTime > req.StartTime) ||
                 (b.StartTime < req.EndTime && b.EndTime >= req.EndTime) ||
                 (b.StartTime >= req.StartTime && b.EndTime <= req.EndTime)));

            if (conflicting != null)
            {
                return BadRequest(new { message = "Room is already booked for this time slot" });
            }

            var booking = new RoomBooking
            {
                RoomId = req.RoomId,
                UserId = userId.Value,
                BookingDate = dateUtc,
                StartTime = req.StartTime,
                EndTime = req.EndTime,
                Purpose = req.Purpose
            };
            _context.RoomBookings.Add(booking);
            _context.SaveChanges();
            return Ok(booking);
        }

        // Composite key delete (userId from session)
        [HttpDelete]
        public IActionResult Delete([FromQuery] int roomId, [FromQuery] DateTime bookingDate, [FromQuery] TimeSpan startTime)
        {
            if (!IsLoggedIn()) return Unauthorized(new { message = "Login required" });
            var userId = SessionUserId();
            if (userId == null) return Unauthorized(new { message = "Login required" });

            var dateUtc = DateTime.SpecifyKind(bookingDate, DateTimeKind.Utc);

            var booking = _context.RoomBookings.FirstOrDefault(b =>
                b.RoomId == roomId &&
                b.UserId == userId &&
                b.BookingDate.Date == dateUtc.Date &&
                b.StartTime == startTime);

            if (booking == null) return NotFound(new { message = "Booking not found" });

            _context.RoomBookings.Remove(booking);
            _context.SaveChanges();
            return Ok(new { message = "Booking deleted" });
        }
    }
}

