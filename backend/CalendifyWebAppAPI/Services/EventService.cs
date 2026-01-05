using System;
using System.Linq;
using System.Collections.Generic;
using System.Threading.Tasks;
using Microsoft.EntityFrameworkCore;
using CalendifyWebAppAPI.Data;
using CalendifyWebAppAPI.Interfaces;
using CalendifyWebAppAPI.Models;

namespace CalendifyWebAppAPI.Services
{
    public class EventService : IEventService
    {
        private readonly AppDbContext _context;
        public EventService(AppDbContext context) => _context = context;

        public async Task<List<Event>> GetAllEventsAsync() => await _context.Events.ToListAsync();

        public async Task<Event?> GetEventByIdAsync(Guid id) => await _context.Events.FirstOrDefaultAsync(e => e.EventId == id);

        public async Task<List<Event>> GetEventsByUserAsync(Guid userId) =>
            await _context.Events.Where(e => e.CreatedBy == userId).ToListAsync();

        public async Task<Event> CreateEventAsync(Event ev)
        {
            if (ev.EventId == Guid.Empty)
                ev.EventId = Guid.NewGuid();
            _context.Events.Add(ev);
            await _context.SaveChangesAsync();
            return ev;
        }

        public async Task<Event?> UpdateEventAsync(Guid id, Event ev)
        {
            var existing = await _context.Events.FirstOrDefaultAsync(e => e.EventId == id);
            if (existing == null) return null;
            existing.Title = ev.Title;
            existing.Description = ev.Description;
            existing.EventDate = ev.EventDate;
            existing.StartTime = ev.StartTime;
            existing.EndTime = ev.EndTime;
            existing.Location = ev.Location;
            await _context.SaveChangesAsync();
            return existing;
        }

        public async Task<bool> DeleteEventAsync(Guid id)
        {
            var existing = await _context.Events.FirstOrDefaultAsync(e => e.EventId == id);
            if (existing == null) return false;
            _context.Events.Remove(existing);
            await _context.SaveChangesAsync();
            return true;
        }
    }
}