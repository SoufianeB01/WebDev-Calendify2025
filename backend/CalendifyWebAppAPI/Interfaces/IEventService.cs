using System.Collections.Generic;
using System.Threading.Tasks;
using CalendifyWebAppAPI.Models;

namespace CalendifyWebAppAPI.Interfaces
{
    public interface IEventService
    {
        Task<List<EventDto>> GetAllEventsAsync();
        Task<EventDto?> GetEventByIdAsync(int id);
        Task<List<Event>> GetEventsByUserAsync(int userId);
        Task<Event> CreateEventAsync(Event ev);
        Task<Event?> UpdateEventAsync(int id, Event ev);
        Task<bool> DeleteEventAsync(int id);
    }
}
