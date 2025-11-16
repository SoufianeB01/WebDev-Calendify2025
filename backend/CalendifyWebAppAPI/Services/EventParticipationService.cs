using CalendifyWebAppAPI.Data;
using CalendifyWebAppAPI.Models;
using CalendifyWebAppAPI.Services.Interfaces;
using Microsoft.EntityFrameworkCore;

namespace CalendifyWebAppAPI.Services
{
    public class EventParticipationService : IEventParticipationService
    {
        private readonly AppDbContext _db;

        public EventParticipationService(AppDbContext db)
        {
            _db = db;
        }

        public EventParticipation Join(EventParticipation participation)
        {
            if (_db.Employees.Find(participation.UserId) == null)
                throw new InvalidOperationException("User not found");
            if (_db.Events.Find(participation.EventId) == null)
                throw new InvalidOperationException("Event not found");
            var exists = _db.EventParticipations.FirstOrDefault(p => p.UserId == participation.UserId && p.EventId == participation.EventId);
            if (exists != null)
                throw new InvalidOperationException("User is already participating in this event");
            _db.EventParticipations.Add(participation);
            _db.SaveChanges();
            return participation;
        }

        public EventParticipation? UpdateStatus(int eventId, int userId, string status)
        {
            var found = _db.EventParticipations.FirstOrDefault(p => p.EventId == eventId && p.UserId == userId);
            if (found == null) return null;
            found.Status = status;
            _db.SaveChanges();
            return found;
        }

        public bool Leave(int eventId, int userId)
        {
            var found = _db.EventParticipations.FirstOrDefault(p => p.EventId == eventId && p.UserId == userId);
            if (found == null) return false;
            _db.EventParticipations.Remove(found);
            _db.SaveChanges();
            return true;
        }

        public IEnumerable<EventParticipation> GetByEventId(int eventId) =>
            _db.EventParticipations.AsNoTracking().Where(p => p.EventId == eventId).ToList();
        public IEnumerable<EventParticipation> GetByUserId(int userId) =>
            _db.EventParticipations.AsNoTracking().Where(p => p.UserId == userId).ToList();
        public IEnumerable<EventParticipation> GetAll() => _db.EventParticipations.AsNoTracking().ToList();
    }
}


