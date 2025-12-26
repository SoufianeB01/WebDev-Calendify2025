using System;

namespace CalendifyWebAppAPI.Models
{
    public class Employee
    {
        public Guid UserId { get; set; } = Guid.NewGuid();
        public string Name { get; set; }
        public string Email { get; set; }
        public string Role { get; set; }
        public string Password { get; set; }
    }
}
