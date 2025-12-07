using CalendifyWebAppAPI.Data;
using CalendifyWebAppAPI.Models;
using CalendifyWebAppAPI.Models.DTOs;
using CalendifyWebAppAPI.Services.Interfaces;
using Microsoft.EntityFrameworkCore;

namespace CalendifyWebAppAPI.Services
{
    public class EventAttendanceService : IEventAttendanceService
    {
        private readonly AppDbContext _context;
        public EventAttendanceService(AppDbContext context) => _context = context;

        public async Task<(bool success, string error, Event? eventJoined)> AttendAsync(EventAttendanceRequest req)
        {
            var ev = await _context.Events.FindAsync(req.EventId);
            if (ev == null) return (false, "Event not found", null);

            var already = await _context.EventParticipations.AnyAsync(p => p.UserId == req.UserId && p.EventId == req.EventId);
            if (already) return (false, "Already attending", null);

            // Availability: no other event at the same date and start time for this user
            var conflict = await (from p in _context.EventParticipations
                                  join e in _context.Events on p.EventId equals e.EventId
                                  where p.UserId == req.UserId
                                  where e.EventDate == ev.EventDate && e.StartTime == ev.StartTime
                                  select p).AnyAsync();
            if (conflict) return (false, "Conflicts with another event at the same time", null);

            await _context.EventParticipations.AddAsync(new EventParticipation
            {
                UserId = req.UserId,
                EventId = req.EventId
            });
            await _context.SaveChangesAsync();
            return (true, string.Empty, ev);
        }

        public async Task<List<Employee>> GetAttendeesAsync(int eventId)
        {
            var attendees = await (from p in _context.EventParticipations
                                   join emp in _context.Employees on p.UserId equals emp.UserId
                                   where p.EventId == eventId
                                   select emp).ToListAsync();
            return attendees;
        }

        public async Task<(bool success, string error)> CancelAsync(int userId, int eventId)
        {
            var existing = await _context.EventParticipations.FindAsync(userId, eventId);
            if (existing == null) return (false, "Attendance not found");
            _context.EventParticipations.Remove(existing);
            await _context.SaveChangesAsync();
            return (true, string.Empty);
        }
    }
}
