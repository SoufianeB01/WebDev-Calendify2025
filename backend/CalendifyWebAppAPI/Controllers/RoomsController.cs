using Microsoft.AspNetCore.Mvc;
using CalendifyWebAppAPI.Data;
using System.Linq;

namespace CalendifyWebAppAPI.Controllers
{
    [ApiController]
    [Route("api/[controller]")]
    public class RoomsController : ControllerBase
    {
        private readonly AppDbContext _context;
        public RoomsController(AppDbContext context) { _context = context; }

        [HttpGet]
        public IActionResult GetAll()
        {
            var rooms = _context.Rooms.ToList();
            return Ok(rooms);
        }

        [HttpGet("available")]
        public IActionResult GetAvailable([FromQuery] System.DateTime bookingDate, [FromQuery] System.TimeSpan startTime, [FromQuery] System.TimeSpan endTime)
        {
            var occupiedRoomIds = _context.RoomBookings
                .Where(b => b.BookingDate == bookingDate && b.StartTime < endTime && startTime < b.EndTime)
                .Select(b => b.RoomId)
                .Distinct()
                .ToList();

            var available = _context.Rooms.Where(r => !occupiedRoomIds.Contains(r.RoomId)).ToList();
            return Ok(available);
        }
    }
}
