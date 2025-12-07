using System.Linq;
using System.Collections.Generic;
using CalendifyWebAppAPI.Data;
using CalendifyWebAppAPI.Interfaces;
using CalendifyWebAppAPI.Models;

namespace CalendifyWebAppAPI.Services
{
    public class EventService : IEventService
    {
        private readonly AppDbContext _context;
        public EventService(AppDbContext context) => _context = context;

        public List<Event> GetAllEvents() => _context.Events.ToList();

        public Event? GetEventById(int id) => _context.Events.FirstOrDefault(e => e.EventId == id);

        public List<Event> GetEventsByUser(int userId) =>
            _context.Events.Where(e => e.CreatedBy == userId).ToList();

        public Event CreateEvent(Event ev)
        {
            _context.Events.Add(ev);
            _context.SaveChanges();
            return ev;
        }

        public Event? UpdateEvent(int id, Event ev)
        {
            var existing = _context.Events.FirstOrDefault(e => e.EventId == id);
            if (existing == null) return null;
            existing.Title = ev.Title;
            existing.Description = ev.Description;
            existing.EventDate = ev.EventDate;
            existing.StartTime = ev.StartTime;
            existing.EndTime = ev.EndTime;
            existing.Location = ev.Location;
            existing.CreatedBy = ev.CreatedBy;
            _context.SaveChanges();
            return existing;
        }

        public bool DeleteEvent(int id)
        {
            var existing = _context.Events.FirstOrDefault(e => e.EventId == id);
            if (existing == null) return false;
            _context.Events.Remove(existing);
            _context.SaveChanges();
            return true;
        }
    }
}