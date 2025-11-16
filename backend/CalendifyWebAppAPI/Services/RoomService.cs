using CalendifyWebAppAPI.Data;
using CalendifyWebAppAPI.Models;
using CalendifyWebAppAPI.Services.Interfaces;
using Microsoft.EntityFrameworkCore;

namespace CalendifyWebAppAPI.Services
{
    public class RoomService : IRoomService
    {
        private readonly AppDbContext _db;

        public RoomService(AppDbContext db)
        {
            _db = db;
        }

        public Room Create(Room room)
        {
            _db.Rooms.Add(room);
            _db.SaveChanges();
            return room;
        }

        public Room? Update(int roomId, Room updated)
        {
            var found = _db.Rooms.Find(roomId);
            if (found == null) return null;
            found.RoomName = updated.RoomName;
            found.Capacity = updated.Capacity;
            found.Location = updated.Location;
            _db.SaveChanges();
            return found;
        }

        public bool Delete(int roomId)
        {
            var found = _db.Rooms.Find(roomId);
            if (found == null) return false;
            _db.Rooms.Remove(found);
            _db.SaveChanges();
            return true;
        }

        public Room? GetById(int roomId) => _db.Rooms.Find(roomId);
        public IEnumerable<Room> GetAll() => _db.Rooms.AsNoTracking().ToList();
    }
}


