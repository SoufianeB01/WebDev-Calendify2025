using System;

namespace CalendifyWebAppAPI.Models
{
    public class Group
    {
        public Guid GroupId { get; set; } = Guid.NewGuid();
        public string GroupName { get; set; }
        public string Description { get; set; }
    }
}
