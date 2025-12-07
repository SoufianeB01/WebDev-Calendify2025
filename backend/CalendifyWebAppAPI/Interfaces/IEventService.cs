using System.Collections.Generic;
using CalendifyWebAppAPI.Models;

namespace CalendifyWebAppAPI.Interfaces
{
    public interface IEventService
    {
        List<Event> GetAllEvents();
        Event? GetEventById(int id);
        List<Event> GetEventsByUser(int userId);
        Event CreateEvent(Event ev);
        Event? UpdateEvent(int id, Event ev);
        bool DeleteEvent(int id);
    }
}
