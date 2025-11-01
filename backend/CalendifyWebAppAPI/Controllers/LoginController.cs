using Microsoft.AspNetCore.Mvc;
using CalendifyWebAppAPI.Data;
using CalendifyWebAppAPI.Models;
using System.Linq;

namespace CalendifyWebAppAPI.Controllers
{
    [ApiController]
    [Route("api/[controller]")]
    public class LoginController : ControllerBase
    {
        private readonly AppDbContext _context;

        public LoginController(AppDbContext context)
        {
            _context = context;
        }

        [HttpPost("auth")] //post
        public IActionResult Authenticate([FromBody] User loginUser)
        {
            var user = _context.Users.FirstOrDefault(u => u.Username == loginUser.Username);
            if (user == null)
            {
                return NotFound(new { message = "User not found" });
            }

            if (user.Password != loginUser.Password)
            {
                return BadRequest(new { message = "Incorrect password" });
            }

            return Ok(new { message = "Login successful", username = user.Username });
        }

        [HttpPost] //post
        public IActionResult Create([FromBody] User newUser)
        {
            if (_context.Users.Any(u => u.Username == newUser.Username))
            {
                return BadRequest(new { message = "Username already exists" });
            }

            _context.Users.Add(newUser);
            _context.SaveChanges();
            return Ok(newUser);
        }

        [HttpGet] //get
        public IActionResult GetAllUsers()
        {
            var users = _context.Users.ToList();
            return Ok(users);
        }

        [HttpGet("{id}")] //get
        public IActionResult GetById(int id)
        {
            var user = _context.Users.Find(id);
            if (user == null)
            {
                return NotFound(new { message = "User not found" });
            }

            return Ok(user);
        }

        [HttpPut("{id}")] //put
        public IActionResult Update(int id, [FromBody] User updatedUser)
        {
            var user = _context.Users.Find(id);
            if (user == null)
            {
                return NotFound(new { message = "User not found" });
            }

            user.Username = updatedUser.Username;
            user.Password = updatedUser.Password;
            _context.SaveChanges();
            return Ok(user);
        }

        [HttpDelete("{id}")] //delete
        public IActionResult Delete(int id)
        {
            var user = _context.Users.Find(id);
            if (user == null)
            {
                return NotFound(new { message = "User not found" });
            }

            _context.Users.Remove(user);
            _context.SaveChanges();
            return Ok(new { message = "User deleted" });
        }
    }
}
