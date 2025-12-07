using System.Linq;
using System.Collections.Generic;
using CalendifyWebAppAPI.Data;
using CalendifyWebAppAPI.Models;
using CalendifyWebAppAPI.Services.Interfaces;

namespace CalendifyWebAppAPI.Services
{
    public class RoomBookingService : IRoomBookingService
    {
        private readonly AppDbContext _context;

        public RoomBookingService(AppDbContext context)
        {
            _context = context;
        }

        public RoomBooking BookRoom(RoomBooking booking)
        {
            var exists = _context.RoomBookings.FirstOrDefault(r => r.RoomId == booking.RoomId && r.BookingDate == booking.BookingDate && r.StartTime == booking.StartTime);
            if (exists != null) return null;

            _context.RoomBookings.Add(booking);
            _context.SaveChanges();
            return booking;
        }

        public List<RoomBooking> GetUserBookings(int userId)
        {
            return _context.RoomBookings.Where(r => r.UserId == userId).ToList();
        }

        public RoomBooking? UpdateBooking(int roomId, int userId, RoomBooking updated)
        {
            var existing = _context.RoomBookings.Find(roomId, userId, updated.BookingDate, updated.StartTime);
            if (existing == null) return null;

            existing.EndTime = updated.EndTime;
            _context.SaveChanges();
            return existing;
        }

        public bool DeleteBooking(int roomId, int userId, System.DateTime bookingDate, System.TimeSpan startTime)
        {
            var existing = _context.RoomBookings.Find(roomId, userId, bookingDate, startTime);
            if (existing == null) return false;

            _context.RoomBookings.Remove(existing);
            _context.SaveChanges();
            return true;
        }
    }
}