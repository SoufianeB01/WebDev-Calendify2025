using CalendifyWebAppAPI.Data;
using CalendifyWebAppAPI.Models;
using CalendifyWebAppAPI.Services.Interfaces;
using Microsoft.EntityFrameworkCore;

namespace CalendifyWebAppAPI.Services
{
    public class EventService : IEventService
    {
        private readonly AppDbContext _db;

        public EventService(AppDbContext db)
        {
            _db = db;
        }

        public Event Create(Event evt)
        {
            var creator = _db.Employees.Find(evt.CreatedBy);
            if (creator == null)
            {
                throw new InvalidOperationException("User not found");
            }
            evt.EventDate = DateTime.SpecifyKind(evt.EventDate, DateTimeKind.Utc);
            _db.Events.Add(evt);
            _db.SaveChanges();
            return evt;
        }

        public Event? Update(int eventId, Event updated)
        {
            var found = _db.Events.Find(eventId);
            if (found == null) return null;

            var creator = _db.Employees.Find(updated.CreatedBy);
            if (creator == null)
            {
                throw new InvalidOperationException("User not found");
            }

            found.Title = updated.Title;
            found.Description = updated.Description;
            found.EventDate = DateTime.SpecifyKind(updated.EventDate, DateTimeKind.Utc);
            found.CreatedBy = updated.CreatedBy;
            _db.SaveChanges();
            return found;
        }

        public bool Delete(int eventId)
        {
            var found = _db.Events.Find(eventId);
            if (found == null) return false;
            _db.Events.Remove(found);
            _db.SaveChanges();
            return true;
        }

        public Event? GetById(int eventId) => _db.Events.Find(eventId);
        public IEnumerable<Event> GetAll() => _db.Events.AsNoTracking().ToList();
        public IEnumerable<Event> GetByUserId(int userId) =>
            _db.Events.AsNoTracking().Where(e => e.CreatedBy == userId).OrderBy(e => e.EventDate).ToList();
    }
}


