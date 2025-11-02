using Microsoft.AspNetCore.Mvc;
using CalendifyWebAppAPI.Data;
using CalendifyWebAppAPI.Models;
using System.Linq;

namespace CalendifyWebAppAPI.Controllers
{
    [ApiController]
    [Route("api/[controller]")]
    public class GroupsController : ControllerBase
    {
        private readonly AppDbContext _context;

        public GroupsController(AppDbContext context)
        {
            _context = context;
        }

        [HttpPost] //post
        public IActionResult Create([FromBody] Group group)
        {
            _context.Groups.Add(group);
            _context.SaveChanges();
            return Ok(group);
        }

        [HttpGet] //get
        public IActionResult GetAll()
        {
            var groups = _context.Groups.ToList();
            return Ok(groups);
        }

        [HttpGet("{id}")] //get
        public IActionResult GetById(int id)
        {
            var group = _context.Groups.Find(id);
            if (group == null)
            {
                return NotFound(new { message = "Group not found" });
            }

            return Ok(group);
        }

        [HttpPut("{id}")] //put
        public IActionResult Update(int id, [FromBody] Group updated)
        {
            var group = _context.Groups.Find(id);
            if (group == null)
            {
                return NotFound(new { message = "Group not found" });
            }

            group.GroupName = updated.GroupName;
            group.Description = updated.Description;
            _context.SaveChanges();
            return Ok(group);
        }

        [HttpDelete("{id}")] //delete
        public IActionResult Delete(int id)
        {
            var group = _context.Groups.Find(id);
            if (group == null)
            {
                return NotFound(new { message = "Group not found" });
            }

            _context.Groups.Remove(group);
            _context.SaveChanges();
            return Ok(new { message = "Group deleted" });
        }
    }
}

