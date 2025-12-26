using System;

namespace CalendifyWebAppAPI.Models
{
    public class GroupMembership
    {
        public Guid UserId { get; set; }
        public Guid GroupId { get; set; }
    }
}
