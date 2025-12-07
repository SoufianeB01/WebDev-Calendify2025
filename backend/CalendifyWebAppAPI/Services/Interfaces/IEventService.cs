using CalendifyWebAppAPI.Models;

namespace CalendifyWebAppAPI.Services.Interfaces
{
    public interface IEventService
    {
        Task<IEnumerable<Event>> GetAllAsync();
        Task<Event?> GetByIdAsync(int eventId);
        Task<(bool success, string error, Event? ev)> CreateAsync(Event ev);
        Task<(bool success, string error, Event? ev)> UpdateAsync(Event ev);
        Task<(bool success, string error)> DeleteAsync(int eventId);
    }
}
