using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;
using Microsoft.EntityFrameworkCore;
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

        public async Task<EventParticipation> AttendEventAsync(Guid userId, Guid eventId)
        {
            var existing = await _context.EventParticipations
                .FirstOrDefaultAsync(ep => ep.UserId == userId && ep.EventId == eventId);
            if (existing != null) return existing;

            var epNew = new EventParticipation
            {
                UserId = userId,
                EventId = eventId,
                Status = "Attending"
            };
            _context.EventParticipations.Add(epNew);
            await _context.SaveChangesAsync();
            return epNew;
        }

        public async Task<List<object>> GetAttendeesAsync(Guid eventId)
        {
            var attendees = await _context.EventParticipations
                .Where(ep => ep.EventId == eventId)
                .Join(
                    _context.Employees,
                    ep => ep.UserId,
                    e => e.UserId,
                    (ep, e) => new
                    {
                        userId = ep.UserId,
                        name = e.Name,
                        email = e.Email
                    })
                .Distinct()
                .ToListAsync();
            return attendees.Cast<object>().ToList();
        }

        public async Task<bool> CancelAttendanceAsync(Guid userId, Guid eventId)
        {
            var existing = await _context.EventParticipations
                .FirstOrDefaultAsync(ep => ep.UserId == userId && ep.EventId == eventId);
            if (existing == null) return false;

            _context.EventParticipations.Remove(existing);
            await _context.SaveChangesAsync();
            return true;
        }
    }
}