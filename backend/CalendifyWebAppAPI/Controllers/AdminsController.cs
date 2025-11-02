using Microsoft.AspNetCore.Mvc;
using CalendifyWebAppAPI.Data;
using CalendifyWebAppAPI.Models;
using System.Linq;

namespace CalendifyWebAppAPI.Controllers
{
    [ApiController]
    [Route("api/[controller]")]
    public class AdminsController : ControllerBase
    {
        private readonly AppDbContext _context;

        public AdminsController(AppDbContext context)
        {
            _context = context;
        }

        [HttpPost] //post
        public IActionResult Create([FromBody] Admin admin)
        {
            // Check if user exists
            var user = _context.Employees.Find(admin.UserId);
            if (user == null)
            {
                return NotFound(new { message = "User not found" });
            }

            // Check if user is already an admin
            var existingAdmin = _context.Admins.FirstOrDefault(a => a.UserId == admin.UserId);
            if (existingAdmin != null)
            {
                return BadRequest(new { message = "User is already an admin" });
            }

            _context.Admins.Add(admin);
            _context.SaveChanges();
            return Ok(admin);
        }

        [HttpGet] //get
        public IActionResult GetAll()
        {
            var admins = _context.Admins.ToList();
            return Ok(admins);
        }

        [HttpGet("{id}")] //get
        public IActionResult GetById(int id)
        {
            var admin = _context.Admins.Find(id);
            if (admin == null)
            {
                return NotFound(new { message = "Admin not found" });
            }

            return Ok(admin);
        }

        [HttpGet("user/{userId}")] //get
        public IActionResult GetByUserId(int userId)
        {
            var admin = _context.Admins.FirstOrDefault(a => a.UserId == userId);
            if (admin == null)
            {
                return NotFound(new { message = "Admin not found" });
            }

            return Ok(admin);
        }

        [HttpGet("{id}/permissions")] //get
        public IActionResult GetPermissions(int id)
        {
            var admin = _context.Admins.Find(id);
            if (admin == null)
            {
                return NotFound(new { message = "Admin not found" });
            }

            return Ok(new { permissions = admin.Permissions });
        }

        [HttpPut("{id}")] //put
        public IActionResult Update(int id, [FromBody] Admin updated)
        {
            var admin = _context.Admins.Find(id);
            if (admin == null)
            {
                return NotFound(new { message = "Admin not found" });
            }

            admin.UserId = updated.UserId;
            admin.Permissions = updated.Permissions;
            _context.SaveChanges();
            return Ok(admin);
        }

        [HttpDelete("{id}")] //delete
        public IActionResult Delete(int id)
        {
            var admin = _context.Admins.Find(id);
            if (admin == null)
            {
                return NotFound(new { message = "Admin not found" });
            }

            _context.Admins.Remove(admin);
            _context.SaveChanges();
            return Ok(new { message = "Admin deleted" });
        }
    }
}

