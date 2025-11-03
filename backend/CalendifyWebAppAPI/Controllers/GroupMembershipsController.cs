using Microsoft.AspNetCore.Mvc;
using CalendifyWebAppAPI.Data;
using CalendifyWebAppAPI.Models;
using System.Linq;

namespace CalendifyWebAppAPI.Controllers
{
    [ApiController]
    [Route("api/[controller]")]
    public class GroupMembershipsController : ControllerBase
    {
        private readonly AppDbContext _context;

        public GroupMembershipsController(AppDbContext context)
        {
            _context = context;
        }

        [HttpGet] //get
        public IActionResult GetAll()
        {
            var memberships = _context.GroupMemberships.ToList();
            return Ok(memberships);
        }

        [HttpPost] //post
        public IActionResult AddMember([FromBody] GroupMembership membership)
        {
            // Check if user exists
            var user = _context.Employees.Find(membership.UserId);
            if (user == null)
            {
                return NotFound(new { message = "User not found" });
            }

            // Check if group exists
            var group = _context.Groups.Find(membership.GroupId);
            if (group == null)
            {
                return NotFound(new { message = "Group not found" });
            }

            // Check if membership already exists
            var existingMembership = _context.GroupMemberships.FirstOrDefault(m =>
                m.UserId == membership.UserId && m.GroupId == membership.GroupId);
            if (existingMembership != null)
            {
                return BadRequest(new { message = "User is already a member of this group" });
            }

            _context.GroupMemberships.Add(membership);
            _context.SaveChanges();
            return Ok(membership);
        }

        [HttpGet("group/{groupId}")] //get
        public IActionResult GetGroupMembers(int groupId)
        {
            var memberships = _context.GroupMemberships
                .Where(m => m.GroupId == groupId)
                .ToList();
            return Ok(memberships);
        }

        [HttpGet("user/{userId}")] //get
        public IActionResult GetUserGroups(int userId)
        {
            var memberships = _context.GroupMemberships
                .Where(m => m.UserId == userId)
                .ToList();
            return Ok(memberships);
        }

        [HttpDelete("{userId}/{groupId}")] //delete
        public IActionResult RemoveMember(int userId, int groupId)
        {
            var membership = _context.GroupMemberships.FirstOrDefault(m =>
                m.UserId == userId && m.GroupId == groupId);
            if (membership == null)
            {
                return NotFound(new { message = "Membership not found" });
            }

            _context.GroupMemberships.Remove(membership);
            _context.SaveChanges();
            return Ok(new { message = "Member removed from group" });
        }
    }
}

