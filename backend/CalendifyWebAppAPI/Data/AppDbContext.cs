using Microsoft.EntityFrameworkCore;
using CalendifyWebAppAPI.Models;

namespace CalendifyWebAppAPI.Data
{
    public class AppDbContext : DbContext
    {
        public AppDbContext(DbContextOptions<AppDbContext> options) : base(options) { }

        public DbSet<Event> Events { get; set; }
        public DbSet<Employee> Employees { get; set; }
        public DbSet<EventParticipation> EventParticipations { get; set; }
        public DbSet<OfficeAttendance> OfficeAttendances { get; set; }
        public DbSet<Room> Rooms { get; set; }
        public DbSet<RoomBooking> RoomBookings { get; set; }
        public DbSet<Group> Groups { get; set; }
        public DbSet<GroupMembership> GroupMemberships { get; set; }
        public DbSet<Admin> Admins { get; set; }

        protected override void OnModelCreating(ModelBuilder modelBuilder)
        {
            base.OnModelCreating(modelBuilder);

            modelBuilder.Entity<EventParticipation>(eventParticipation =>
            {
                eventParticipation.HasKey(x => new { x.UserId, x.EventId });
                eventParticipation.HasOne<Employee>()
                    .WithMany()
                    .HasForeignKey(x => x.UserId);
                eventParticipation.HasOne<Event>()
                    .WithMany()
                    .HasForeignKey(x => x.EventId);
            });

            modelBuilder.Entity<OfficeAttendance>(officeAttendance =>
            {
                officeAttendance.HasKey(x => x.AttendanceId);
                officeAttendance.HasOne<Employee>()
                    .WithMany()
                    .HasForeignKey(x => x.UserId);
            });

            modelBuilder.Entity<RoomBooking>(roomBooking =>
            {
                roomBooking.HasKey(x => new { x.RoomId, x.UserId, x.BookingDate, x.StartTime });
                roomBooking.HasOne<Room>()
                    .WithMany()
                    .HasForeignKey(x => x.RoomId);
                roomBooking.HasOne<Employee>()
                    .WithMany()
                    .HasForeignKey(x => x.UserId);
            });

            modelBuilder.Entity<GroupMembership>(groupMembership =>
            {
                groupMembership.HasKey(x => new { x.UserId, x.GroupId });
                groupMembership.HasOne<Employee>()
                    .WithMany()
                    .HasForeignKey(x => x.UserId);
                groupMembership.HasOne<Group>()
                    .WithMany()
                    .HasForeignKey(x => x.GroupId);
            });

            modelBuilder.Entity<Admin>(admin =>
            {
                admin.HasKey(x => x.AdminId);
                admin.HasOne<Employee>()
                    .WithMany()
                    .HasForeignKey(x => x.UserId);
            });

            modelBuilder.Entity<Event>(eventEntity =>
            {
                eventEntity.HasKey(x => x.EventId);
                eventEntity.HasOne<Employee>()
                    .WithMany()
                    .HasForeignKey(x => x.CreatedBy);
            });

            modelBuilder.Entity<Room>(room =>
            {
                room.HasKey(x => x.RoomId);
            });

            modelBuilder.Entity<Group>(group =>
            {
                group.HasKey(x => x.GroupId);
            });

            modelBuilder.Entity<Employee>(employee =>
            {
                employee.HasKey(x => x.UserId);
            });
        }
    }
}
