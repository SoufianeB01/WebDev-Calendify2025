using CalendifyWebAppAPI.Models;
using System.Collections.Generic;

namespace CalendifyWebAppAPI.Interfaces
{
    public interface IEventParticipationService
    {
        EventParticipation AttendEvent(int userId, int eventId);
        List<int> GetAttendees(int eventId);
        bool CancelAttendance(int userId, int eventId);
    }
}