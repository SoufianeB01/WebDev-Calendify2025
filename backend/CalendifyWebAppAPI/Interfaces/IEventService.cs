using System;
using System.Collections.Generic;
using System.Threading.Tasks;
using CalendifyWebAppAPI.Models;

namespace CalendifyWebAppAPI.Interfaces
{
    public interface IEventService
    {
        Task<List<Event>> GetAllEventsAsync();
        Task<Event?> GetEventByIdAsync(Guid id);
        Task<List<Event>> GetEventsByUserAsync(Guid userId);
        Task<Event> CreateEventAsync(Event ev);
        Task<Event?> UpdateEventAsync(Guid id, Event ev);
        Task<bool> DeleteEventAsync(Guid id);
    }
}
