namespace CalendifyWebAppAPI.Models
{
    public class Employee
    {
        public int UserId { get; set; }
        public string Name { get; set; } = string.Empty;
        public string Email { get; set; } = string.Empty;
        public string Role { get; set; } = string.Empty;
        public string Password { get; set; } = string.Empty;
    }
}
