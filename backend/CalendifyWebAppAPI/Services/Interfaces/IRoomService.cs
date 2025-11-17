using CalendifyWebAppAPI.Models;

namespace CalendifyWebAppAPI.Services.Interfaces
{
    public interface IRoomService
    {
        Room Create(Room room);
        Room? Update(int roomId, Room updated);
        bool Delete(int roomId);
        Room? GetById(int roomId);
        IEnumerable<Room> GetAll();
    }
}


