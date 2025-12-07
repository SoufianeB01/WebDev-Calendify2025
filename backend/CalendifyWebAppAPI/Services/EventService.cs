using CalendifyWebAppAPI.Data;
using CalendifyWebAppAPI.Models;
using CalendifyWebAppAPI.Services.Interfaces;
using Microsoft.EntityFrameworkCore;

namespace CalendifyWebAppAPI.Services
{
    public class EventService : IEventService
    {
        private readonly AppDbContext _context;

        public EventService(AppDbContext context)
        {
            _context = context;
        }

        public async Task<IEnumerable<Event>> GetAllAsync()
        {
            return await _context.Events.AsNoTracking().ToListAsync();
        }

        public async Task<Event?> GetByIdAsync(int eventId)
        {
            return await _context.Events.FindAsync(eventId);
        }

        public async Task<(bool success, string error, Event? ev)> CreateAsync(Event ev)
        {
            if (ev.EndTime <= ev.StartTime)
                return (false, "EndTime must be after StartTime", null);

            ev.EventDate = ev.EventDate.Date;
            await _context.Events.AddAsync(ev);
            await _context.SaveChangesAsync();
            return (true, string.Empty, ev);
        }

        public async Task<(bool success, string error, Event? ev)> UpdateAsync(Event ev)
        {
            var existing = await _context.Events.FindAsync(ev.EventId);
            if (existing == null) return (false, "Event not found", null);

            if (ev.EndTime <= ev.StartTime)
                return (false, "EndTime must be after StartTime", null);

            existing.Title = ev.Title;
            existing.Description = ev.Description;
            existing.EventDate = ev.EventDate.Date;
            existing.StartTime = ev.StartTime;
            existing.EndTime = ev.EndTime;
            existing.Location = ev.Location;
            existing.CreatedBy = ev.CreatedBy;

            await _context.SaveChangesAsync();
            return (true, string.Empty, existing);
        }

        public async Task<(bool success, string error)> DeleteAsync(int eventId)
        {
            var existing = await _context.Events.FindAsync(eventId);
            if (existing == null) return (false, "Event not found");

            var participations = _context.EventParticipations.Where(p => p.EventId == eventId);
            _context.EventParticipations.RemoveRange(participations);

            var reviews = _context.EventReviews.Where(r => r.EventId == eventId);
            _context.EventReviews.RemoveRange(reviews);

            _context.Events.Remove(existing);
            await _context.SaveChangesAsync();
            return (true, string.Empty);
        }
    }
}