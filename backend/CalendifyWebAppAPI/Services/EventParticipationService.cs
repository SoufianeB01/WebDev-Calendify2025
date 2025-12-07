using System.Collections.Generic;
using System.Linq;
using CalendifyWebAppAPI.Data;
using CalendifyWebAppAPI.Interfaces;
using CalendifyWebAppAPI.Models;

namespace CalendifyWebAppAPI.Services
{
    public class EventParticipationService : IEventParticipationService
    {
        private readonly AppDbContext _context;

        public EventParticipationService(AppDbContext context)
        {
            _context = context;
        }

        public EventParticipation AttendEvent(int userId, int eventId)
        {
            var existing = _context.EventParticipations
                .FirstOrDefault(ep => ep.UserId == userId && ep.EventId == eventId);
            if (existing != null) return existing;

            var epNew = new EventParticipation
            {
                UserId = userId,
                EventId = eventId,
                Status = "Attending"
            };
            _context.EventParticipations.Add(epNew);
            _context.SaveChanges();
            return epNew;
        }

        public List<int> GetAttendees(int eventId)
        {
            return _context.EventParticipations
                .Where(ep => ep.EventId == eventId)
                .Select(ep => ep.UserId)
                .Distinct()
                .ToList();
        }

        public bool CancelAttendance(int userId, int eventId)
        {
            var existing = _context.EventParticipations
                .FirstOrDefault(ep => ep.UserId == userId && ep.EventId == eventId);
            if (existing == null) return false;

            _context.EventParticipations.Remove(existing);
            _context.SaveChanges();
            return true;
        }
    }
}