using System;
using CalendifyWebAppAPI.Data;
using CalendifyWebAppAPI.Models;
using CalendifyWebAppAPI.Services.Interfaces;
using Microsoft.EntityFrameworkCore;

namespace CalendifyWebAppAPI.Services
{
    public class RoomBookingService : IRoomBookingService
    {
        private readonly AppDbContext _context;
        public RoomBookingService(AppDbContext ctx) { _context = ctx; }

        public async Task<IEnumerable<RoomBooking>> GetAllAsync()
        {
            return await _context.RoomBookings.AsNoTracking().ToListAsync();
        }

        public async Task<RoomBooking?> GetByKeyAsync(int roomId, int userId, DateOnly bookingDate, TimeSpan startTime)
        {
            return await _context.RoomBookings.FindAsync(roomId, userId, bookingDate, startTime);
        }

        public async Task<(bool success, string error, RoomBooking? booking)> CreateAsync(RoomBooking booking)
        {
            var available = await IsSlotAvailableAsync(booking.RoomId, booking.BookingDate, booking.StartTime, booking.EndTime);
            if (!available) return (false, "Time slot not available", null);

            await _context.RoomBookings.AddAsync(booking);
            await _context.SaveChangesAsync();
            return (true, string.Empty, booking);
        }

        public async Task<(bool success, string error, RoomBooking? booking)> UpdateAsync(RoomBooking roomBooking)
        {
            var existingBooking = await _context.RoomBookings.FindAsync(roomBooking.RoomId, roomBooking.UserId, roomBooking.BookingDate, roomBooking.StartTime);
            if (existingBooking == null)
            {
                return (false, "Booking not found", null);
            }

            if (roomBooking.EndTime <= roomBooking.StartTime)
            {
                return (false, "EndTime must be after StartTime", null);
            }

            var roomBookingsSameDay = await _context.RoomBookings
                .Where(rb => rb.RoomId == roomBooking.RoomId && rb.BookingDate == roomBooking.BookingDate)
                .ToListAsync();

            foreach (var otherBooking in roomBookingsSameDay)
            {
                var isSameKey =
                    otherBooking.RoomId == existingBooking.RoomId &&
                    otherBooking.UserId == existingBooking.UserId &&
                    otherBooking.BookingDate == existingBooking.BookingDate &&
                    otherBooking.StartTime == existingBooking.StartTime;

                if (isSameKey)
                {
                    continue;
                }

                var overlaps = roomBooking.StartTime < otherBooking.EndTime && otherBooking.StartTime < roomBooking.EndTime;
                if (overlaps)
                {
                    return (false, "Room already booked at that time", null);
                }
            }

            existingBooking.EndTime = roomBooking.EndTime;
            await _context.SaveChangesAsync();
            return (true, string.Empty, existingBooking);
        }

        public async Task<(bool success, string error)> DeleteAsync(int roomId, int userId, DateOnly bookingDate, TimeSpan startTime)
        {
            var existingBooking = await _context.RoomBookings.FindAsync(roomId, userId, bookingDate, startTime);
            if (existingBooking == null)
            {
                return (false, "Booking not found");
            }

            _context.RoomBookings.Remove(existingBooking);
            await _context.SaveChangesAsync();
            return (true, string.Empty);
        }

        // Implement missing interface methods
        public async Task<(bool success, string error, RoomBooking? booking)> BookAsync(RoomBooking req)
        {
            // Validate room and user exist
            var roomExists = await _context.Rooms.AnyAsync(r => r.RoomId == req.RoomId);
            if (!roomExists) return (false, "Room not found", null);
                var overlaps = roomBooking.StartTime < otherBooking.EndTime && otherBooking.StartTime < roomBooking.EndTime;
                if (overlaps)
                {
                    return (false, "Room already booked at that time", null);
                }
            }

            existingBooking.EndTime = roomBooking.EndTime;
            await _context.SaveChangesAsync();
            return (true, string.Empty, existingBooking);
        }

        public async Task<(bool success, string error)> DeleteAsync(int roomId, int userId, DateOnly bookingDate, TimeSpan startTime)
        {
            var existingBooking = await _context.RoomBookings.FindAsync(roomId, userId, bookingDate, startTime);
            if (existingBooking == null)
            {
                return (false, "Booking not found");
            }

            _context.RoomBookings.Remove(existingBooking);
            await _context.SaveChangesAsync();
            return (true, string.Empty);
        }

        // Implement missing interface methods
        public async Task<(bool success, string error, RoomBooking? booking)> BookAsync(RoomBooking req)
        {
            // Validate room and user exist
            var roomExists = await _context.Rooms.AnyAsync(r => r.RoomId == req.RoomId);
            if (!roomExists) return (false, "Room not found", null);

            var userExists = await _context.Employees.AnyAsync(e => e.UserId == req.UserId);
            if (!userExists) return (false, "User not found", null);

            // Check overlap
            var overlap = await _context.RoomBookings.AnyAsync(b =>
                b.RoomId == req.RoomId &&
                b.BookingDate == req.BookingDate &&
                (
                    (req.StartTime >= b.StartTime && req.StartTime < b.EndTime) ||
                    (req.EndTime > b.StartTime && req.EndTime <= b.EndTime) ||
                    (req.StartTime <= b.StartTime && req.EndTime >= b.EndTime)
                )
            );
            if (overlap) return (false, "Time slot already booked", null);

            _context.RoomBookings.Add(req);
            await _context.SaveChangesAsync();
            return (true, string.Empty, req);
        }

        public async Task<(bool success, string error)> CancelAsync(int roomId, int userId, DateOnly date, TimeSpan startTime)
        {
            var existing = await _context.RoomBookings.FindAsync(roomId, userId, date, startTime);
            if (existing == null) return (false, "Booking not found");

            _context.RoomBookings.Remove(existing);
            await _context.SaveChangesAsync();
            return (true, string.Empty);
        }
    }
}
