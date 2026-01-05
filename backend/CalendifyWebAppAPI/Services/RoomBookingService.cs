using System;
using System.Linq;
using System.Collections.Generic;
using System.Threading.Tasks;
using Microsoft.EntityFrameworkCore;
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

        public async Task<RoomBooking?> BookRoomAsync(RoomBooking booking)
        {
            // Ensure DateTime is in UTC for PostgreSQL
            if (booking.BookingDate.Kind == DateTimeKind.Unspecified)
                booking.BookingDate = DateTime.SpecifyKind(booking.BookingDate, DateTimeKind.Utc);
            else if (booking.BookingDate.Kind == DateTimeKind.Local)
                booking.BookingDate = booking.BookingDate.ToUniversalTime();
            
            var exists = await _context.RoomBookings.FirstOrDefaultAsync(r => r.RoomId == booking.RoomId && r.BookingDate == booking.BookingDate && r.StartTime == booking.StartTime);
            if (exists != null) return null;

            _context.RoomBookings.Add(booking);
            await _context.SaveChangesAsync();
            return booking;
        }

        public async Task<List<RoomBooking>> GetUserBookingsAsync(Guid userId)
        {
            return await _context.RoomBookings.Where(r => r.UserId == userId).ToListAsync();
        }

        public async Task<RoomBooking?> UpdateBookingAsync(Guid roomId, Guid userId, RoomBooking updated)
        {
            var existing = await _context.RoomBookings.FindAsync(roomId, userId, updated.BookingDate, updated.StartTime);
            if (existing == null) return null;

            existing.EndTime = updated.EndTime;
            await _context.SaveChangesAsync();
            return existing;
        }

        public async Task<bool> DeleteBookingAsync(Guid roomId, Guid userId, System.DateTime bookingDate, System.TimeSpan startTime)
        {
            // Ensure DateTime is in UTC for PostgreSQL
            if (bookingDate.Kind == DateTimeKind.Unspecified)
                bookingDate = DateTime.SpecifyKind(bookingDate, DateTimeKind.Utc);
            else if (bookingDate.Kind == DateTimeKind.Local)
                bookingDate = bookingDate.ToUniversalTime();
            
            var existing = await _context.RoomBookings.FindAsync(roomId, userId, bookingDate, startTime);
            if (existing == null) return false;

            _context.RoomBookings.Remove(existing);
            await _context.SaveChangesAsync();
            return true;
        }
    }
}