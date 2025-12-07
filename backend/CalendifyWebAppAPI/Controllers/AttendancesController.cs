using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using CalendifyWebAppAPI.Data; // FIX: add AppDbContext namespace
using CalendifyWebAppAPI.Models;

namespace CalendifyWebAppAPI.Controllers
{
    [ApiController]
    [Route("api/[controller]")]
    public class AttendancesController : ControllerBase
    {
        private readonly AppDbContext _context; // FIX: use AppDbContext

        public AttendancesController(AppDbContext context) // FIX: DI constructor
        {
            _context = context;
        }

        [HttpGet]
        public async Task<IActionResult> GetAll()
        {
            var items = await _context.OfficeAttendances.ToListAsync();
            return Ok(items);
        }

        [HttpGet("{id:int}")]
        public async Task<IActionResult> GetById(int id)
        {
            var entity = await _context.OfficeAttendances.FindAsync(id);
            if (entity == null) return NotFound();
            return Ok(entity);
        }

        [HttpPost]
        public async Task<IActionResult> Create([FromBody] OfficeAttendance req)
        {
            await _context.OfficeAttendances.AddAsync(req);
            await _context.SaveChangesAsync();
            return Ok(req);
        }

        [HttpPut("{id:int}")]
        public async Task<IActionResult> Update(int id, [FromBody] OfficeAttendance updated)
        {
            var existing = await _context.OfficeAttendances.FindAsync(id);
            if (existing == null) return NotFound();

            existing.UserId = updated.UserId;
            existing.Date = updated.Date;
            existing.IsPresent = updated.IsPresent;
            existing.Status = updated.Status;

            await _context.SaveChangesAsync();
            return Ok(existing);
        }

        [HttpDelete("{id:int}")]
        public async Task<IActionResult> Delete(int id)
        {
            var existing = await _context.OfficeAttendances.FindAsync(id);
            if (existing == null) return NotFound();
            _context.OfficeAttendances.Remove(existing);
            await _context.SaveChangesAsync();
            return Ok(new { message = "Deleted" });
        }
    }
}
