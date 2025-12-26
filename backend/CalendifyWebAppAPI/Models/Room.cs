using System;

namespace CalendifyWebAppAPI.Models
{
    public class Room
    {
        public Guid RoomId { get; set; } = Guid.NewGuid();
        public string RoomName { get; set; }
        public int Capacity { get; set; }
        public string Location { get; set; }
    }
}
