using CalendifyWebAppAPI.Models;

namespace CalendifyWebAppAPI.Services.Interfaces
{
    public interface IEventParticipationService
    {
        EventParticipation Join(EventParticipation participation);
        EventParticipation? UpdateStatus(int eventId, int userId, string status);
        bool Leave(int eventId, int userId);
        IEnumerable<EventParticipation> GetByEventId(int eventId);
        IEnumerable<EventParticipation> GetByUserId(int userId);
        IEnumerable<EventParticipation> GetAll();
    }
}


