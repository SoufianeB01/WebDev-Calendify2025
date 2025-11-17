using Microsoft.AspNetCore.Mvc;
using CalendifyWebAppAPI.Data;
using CalendifyWebAppAPI.Models;
using System.Linq;

namespace CalendifyWebAppAPI.Controllers
{
    [ApiController]
    [Route("api/[controller]")]
    public class RoomBookingsController : ControllerBase
    {
        private readonly AppDbContext _context;

        public RoomBookingsController(AppDbContext context)
        {
            _context = context;
        }

        [HttpPost] //post
        public IActionResult Create([FromBody] RoomBooking booking)
        {
            // Check if room exists
            var room = _context.Rooms.Find(booking.RoomId);
            if (room == null)
            {
                return NotFound(new { message = "Room not found" });
            }

            // Check if user exists
            var user = _context.Employees.Find(booking.UserId);
            if (user == null)
            {
                return NotFound(new { message = "User not found" });
            }

            // Check for booking conflicts
            var conflictingBooking = _context.RoomBookings.FirstOrDefault(b =>
                b.RoomId == booking.RoomId &&
                b.BookingDate.Date == booking.BookingDate.Date &&
                ((b.StartTime <= booking.StartTime && b.EndTime > booking.StartTime) ||
                 (b.StartTime < booking.EndTime && b.EndTime >= booking.EndTime) ||
                 (b.StartTime >= booking.StartTime && b.EndTime <= booking.EndTime)));

            if (conflictingBooking != null)
            {
                return BadRequest(new { message = "Room is already booked for this time slot" });
            }

            booking.BookingDate = DateTime.SpecifyKind(booking.BookingDate, DateTimeKind.Utc);
            _context.RoomBookings.Add(booking);
            _context.SaveChanges();
            return Ok(booking);
        }

        [HttpGet] //get
        public IActionResult GetAll()
        {
            var bookings = _context.RoomBookings.ToList();
            return Ok(bookings);
        }

        [HttpGet("room/{roomId}")] //get
        public IActionResult GetByRoomId(int roomId)
        {
            var bookings = _context.RoomBookings
                .Where(b => b.RoomId == roomId)
                .ToList();
            return Ok(bookings);
        }

        [HttpGet("user/{userId}")] //get
        public IActionResult GetByUserId(int userId)
        {
            var bookings = _context.RoomBookings
                .Where(b => b.UserId == userId)
                .ToList();
            return Ok(bookings);
        }

        [HttpGet("availability")] //get
        public IActionResult CheckAvailability([FromQuery] int roomId, [FromQuery] DateTime bookingDate, [FromQuery] TimeSpan startTime, [FromQuery] TimeSpan endTime)
        {
            var conflictingBooking = _context.RoomBookings.FirstOrDefault(b =>
                b.RoomId == roomId &&
                b.BookingDate.Date == bookingDate.Date &&
                ((b.StartTime <= startTime && b.EndTime > startTime) ||
                 (b.StartTime < endTime && b.EndTime >= endTime) ||
                 (b.StartTime >= startTime && b.EndTime <= endTime)));

            if (conflictingBooking != null)
            {
                return Ok(new { available = false, message = "Room is not available for this time slot" });
            }

            return Ok(new { available = true, message = "Room is available" });
        }

        [HttpPut] //put
        public IActionResult Update([FromBody] RoomBooking updatedBooking)
        {
            var booking = _context.RoomBookings.FirstOrDefault(b =>
                b.RoomId == updatedBooking.RoomId &&
                b.UserId == updatedBooking.UserId &&
                b.BookingDate.Date == updatedBooking.BookingDate.Date &&
                b.StartTime == updatedBooking.StartTime);

            if (booking == null)
            {
                return NotFound(new { message = "Booking not found" });
            }

            // Check for booking conflicts (excluding current booking)
            var conflictingBooking = _context.RoomBookings.FirstOrDefault(b =>
                b.RoomId == updatedBooking.RoomId &&
                b.BookingDate.Date == updatedBooking.BookingDate.Date &&
                ((b.StartTime <= updatedBooking.StartTime && b.EndTime > updatedBooking.StartTime) ||
                 (b.StartTime < updatedBooking.EndTime && b.EndTime >= updatedBooking.EndTime) ||
                 (b.StartTime >= updatedBooking.StartTime && b.EndTime <= updatedBooking.EndTime)) &&
                !(b.RoomId == booking.RoomId && b.UserId == booking.UserId && 
                  b.BookingDate.Date == booking.BookingDate.Date && b.StartTime == booking.StartTime));

            if (conflictingBooking != null)
            {
                return BadRequest(new { message = "Room is already booked for this time slot" });
            }

            booking.EndTime = updatedBooking.EndTime;
            booking.Purpose = updatedBooking.Purpose;
            booking.BookingDate = DateTime.SpecifyKind(updatedBooking.BookingDate, DateTimeKind.Utc);
            _context.SaveChanges();
            return Ok(booking);
        }

        [HttpDelete] //delete
        public IActionResult Delete([FromQuery] int roomId, [FromQuery] int userId, [FromQuery] DateTime bookingDate, [FromQuery] TimeSpan startTime)
        {
            var booking = _context.RoomBookings.FirstOrDefault(b =>
                b.RoomId == roomId &&
                b.UserId == userId &&
                b.BookingDate.Date == bookingDate.Date &&
                b.StartTime == startTime);

            if (booking == null)
            {
                return NotFound(new { message = "Booking not found" });
            }

            _context.RoomBookings.Remove(booking);
            _context.SaveChanges();
            return Ok(new { message = "Booking deleted" });
        }
    }
}

