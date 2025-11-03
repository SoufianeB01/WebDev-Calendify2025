using Microsoft.AspNetCore.Mvc;
using CalendifyWebAppAPI.Data;
using CalendifyWebAppAPI.Models;
using System.Linq;

namespace CalendifyWebAppAPI.Controllers
{
    [ApiController]
    [Route("api/[controller]")]
    public class RoomsController : ControllerBase
    {
        private readonly AppDbContext _context;

        public RoomsController(AppDbContext context)
        {
            _context = context;
        }

        [HttpPost] //post
        public IActionResult Create([FromBody] Room room)
        {
            _context.Rooms.Add(room);
            _context.SaveChanges();
            return Ok(room);
        }

        [HttpGet] //get
        public IActionResult GetAll()
        {
            var rooms = _context.Rooms.ToList();
            return Ok(rooms);
        }

        [HttpGet("{id}")] //get
        public IActionResult GetById(int id)
        {
            var room = _context.Rooms.Find(id);
            if (room == null)
            {
                return NotFound(new { message = "Room not found" });
            }

            return Ok(room);
        }

        [HttpPut("{id}")] //put
        public IActionResult Update(int id, [FromBody] Room updated)
        {
            var room = _context.Rooms.Find(id);
            if (room == null)
            {
                return NotFound(new { message = "Room not found" });
            }

            room.RoomName = updated.RoomName;
            room.Capacity = updated.Capacity;
            room.Location = updated.Location;
            _context.SaveChanges();
            return Ok(room);
        }

        [HttpDelete("{id}")] //delete
        public IActionResult Delete(int id)
        {
            var room = _context.Rooms.Find(id);
            if (room == null)
            {
                return NotFound(new { message = "Room not found" });
            }

            _context.Rooms.Remove(room);
            _context.SaveChanges();
            return Ok(new { message = "Room deleted" });
        }
    }
}

