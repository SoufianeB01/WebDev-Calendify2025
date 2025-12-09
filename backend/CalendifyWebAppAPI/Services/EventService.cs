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

        public async Task<List<EventDto>> GetAllEventsAsync()
        {
            var events = await _context.Events.ToListAsync();
            var eventDtos = new List<EventDto>();

            foreach (var ev in events)
            {
                var reviews = await _context.EventReviews
                    .Where(r => r.EventId == ev.EventId)
                    .ToListAsync();

                var attendees = await _context.EventParticipations
                    .Where(ep => ep.EventId == ev.EventId)
                    .Select(ep => ep.UserId)
                    .Distinct()
                    .ToListAsync();

                eventDtos.Add(new EventDto
                {
                    EventId = ev.EventId,
                    Title = ev.Title,
                    Description = ev.Description,
                    EventDate = ev.EventDate,
                    StartTime = ev.StartTime,
                    EndTime = ev.EndTime,
                    Location = ev.Location,
                    CreatedBy = ev.CreatedBy,
                    Reviews = reviews,
                    Attendees = attendees
                });
            }

            return eventDtos;
        }

        public async Task<EventDto?> GetEventByIdAsync(int id)
        {
            var ev = await _context.Events.FirstOrDefaultAsync(e => e.EventId == id);
            if (ev == null) return null;

            var reviews = await _context.EventReviews
                .Where(r => r.EventId == ev.EventId)
                .ToListAsync();

            var attendees = await _context.EventParticipations
                .Where(ep => ep.EventId == ev.EventId)
                .Select(ep => ep.UserId)
                .Distinct()
                .ToListAsync();

            return new EventDto
            {
                EventId = ev.EventId,
                Title = ev.Title,
                Description = ev.Description,
                EventDate = ev.EventDate,
                StartTime = ev.StartTime,
                EndTime = ev.EndTime,
                Location = ev.Location,
                CreatedBy = ev.CreatedBy,
                Reviews = reviews,
                Attendees = attendees
            };
        }

        public async Task<List<Event>> GetEventsByUserAsync(int userId) =>
            await _context.Events.Where(e => e.CreatedBy == userId).ToListAsync();

        public async Task<Event> CreateEventAsync(Event ev)
        {
            _context.Events.Add(ev);
            await _context.SaveChangesAsync();
            return ev;
        }

        public async Task<Event?> UpdateEventAsync(int id, Event ev)
        {
            var existing = await _context.Events.FirstOrDefaultAsync(e => e.EventId == id);
            if (existing == null) return null;
            existing.Title = ev.Title;
            existing.Description = ev.Description;
            existing.EventDate = ev.EventDate;
            existing.StartTime = ev.StartTime;
            existing.EndTime = ev.EndTime;
            existing.Location = ev.Location;
            existing.CreatedBy = ev.CreatedBy;
            await _context.SaveChangesAsync();
            return existing;
        }

        public async Task<bool> DeleteEventAsync(int id)
        {
            var existing = await _context.Events.FirstOrDefaultAsync(e => e.EventId == id);
            if (existing == null) return false;
            _context.Events.Remove(existing);
            await _context.SaveChangesAsync();
            return true;
        }
    }
}