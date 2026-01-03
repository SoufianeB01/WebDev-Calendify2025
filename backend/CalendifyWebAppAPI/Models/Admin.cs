using System;

namespace CalendifyWebAppAPI.Models
{
    public class Admin
    {
        public Guid AdminId { get; set; }
        public Guid UserId { get; set; }
        public string Permissions { get; set; }
    }
}
