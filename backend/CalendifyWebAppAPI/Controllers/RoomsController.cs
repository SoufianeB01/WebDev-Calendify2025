using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using System.Threading.Tasks;
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
        public async Task<IActionResult> GetAll()
        {
            var rooms = await _context.Rooms.ToListAsync();
            return Ok(rooms);
        }

        [HttpGet("available")]
        public async Task<IActionResult> GetAvailable([FromQuery] System.DateTime bookingDate, [FromQuery] System.TimeSpan startTime, [FromQuery] System.TimeSpan endTime)
        {
            var occupiedRoomIds = await _context.RoomBookings
                .Where(b => b.BookingDate == bookingDate && b.StartTime < endTime && startTime < b.EndTime)
                .Select(b => b.RoomId)
                .Distinct()
                .ToListAsync();

            var available = await _context.Rooms.Where(r => !occupiedRoomIds.Contains(r.RoomId)).ToListAsync();
            return Ok(available);
        }
    }
}
