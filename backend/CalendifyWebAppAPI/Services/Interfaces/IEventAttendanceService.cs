using CalendifyWebAppAPI.Models;
using CalendifyWebAppAPI.Models.DTOs;

namespace CalendifyWebAppAPI.Services.Interfaces
{
    public interface IEventAttendanceService
    {
        Task<(bool success, string error, Event? eventJoined)> AttendAsync(EventAttendanceRequest req);
        Task<List<Employee>> GetAttendeesAsync(int eventId);
        Task<(bool success, string error)> CancelAsync(int userId, int eventId);
    }
}
