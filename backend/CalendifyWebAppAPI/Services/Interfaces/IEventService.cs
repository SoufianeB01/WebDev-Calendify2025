using CalendifyWebAppAPI.Models;

namespace CalendifyWebAppAPI.Services.Interfaces
{
    public interface IEventService
    {
        Event Create(Event evt);
        Event? Update(int eventId, Event updated);
        bool Delete(int eventId);
        Event? GetById(int eventId);
        IEnumerable<Event> GetAll();
        IEnumerable<Event> GetByUserId(int userId);
    }
}


