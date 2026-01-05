using System;
using CalendifyWebAppAPI.Models;
using System.Collections.Generic;
using System.Threading.Tasks;

namespace CalendifyWebAppAPI.Interfaces
{
    public interface IEventParticipationService
    {
        Task<EventParticipation> AttendEventAsync(Guid userId, Guid eventId);
        Task<List<object>> GetAttendeesAsync(Guid eventId);
        Task<bool> CancelAttendanceAsync(Guid userId, Guid eventId);
    }
}