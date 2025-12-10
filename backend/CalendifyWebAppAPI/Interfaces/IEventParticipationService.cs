using CalendifyWebAppAPI.Models;
using System.Collections.Generic;
using System.Threading.Tasks;

namespace CalendifyWebAppAPI.Interfaces
{
    public interface IEventParticipationService
    {
        Task<EventParticipation> AttendEventAsync(int userId, int eventId);
        Task<List<int>> GetAttendeesAsync(int eventId);
        Task<bool> CancelAttendanceAsync(int userId, int eventId);
    }
}