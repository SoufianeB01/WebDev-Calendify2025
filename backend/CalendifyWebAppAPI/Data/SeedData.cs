using CalendifyWebAppAPI.Models;
using CalendifyWebAppAPI.Controllers;
using Microsoft.AspNetCore.Identity;

namespace CalendifyWebAppAPI.Data
{
    public static class SeedData
{
    public static void Initialize(AppDbContext context, IPasswordHasher<Employee> passwordHasher)
    {
        context.Database.EnsureCreated();

        if (!context.Employees.Any())
        {
            // Employees
            var emp1 = new Employee
            {
                UserId = Guid.NewGuid(),
                Name = "Employee One",
                Email = "employee1@company.com",
                Role = "Employee",
                Password = passwordHasher.HashPassword(null, "password123")
            };
            var emp2 = new Employee
            {
                UserId = Guid.NewGuid(),
                Name = "Employee Two",
                Email = "employee2@company.com",
                Role = "Employee",
                Password = passwordHasher.HashPassword(null, "password123")
            };
            var emp3 = new Employee
            {
                UserId = Guid.NewGuid(),
                Name = "Employee Three",
                Email = "employee3@company.com",
                Role = "Employee",
                Password = passwordHasher.HashPassword(null, "password123")
            };

            context.Employees.AddRange(emp1, emp2, emp3);

            // Admins
            var admin1 = new Admin
            {
                AdminId = Guid.NewGuid(),
                UserId = emp1.UserId,
                Permissions = "Full"
            };
            var admin2 = new Admin
            {
                AdminId = Guid.NewGuid(),
                UserId = emp2.UserId,
                Permissions = "Full"
            };
            var admin3 = new Admin
            {
                AdminId = Guid.NewGuid(),
                UserId = emp3.UserId,
                Permissions = "Full"
            };
            context.Admins.AddRange(admin1, admin2, admin3);

            // Rooms
            var room1 = new Room { RoomId = Guid.NewGuid(), RoomName = "Vergaderzaal A", Capacity = 10, Location = "3e verdieping" };
            var room2 = new Room { RoomId = Guid.NewGuid(), RoomName = "Vergaderzaal B", Capacity = 6, Location = "2e verdieping" };
            var room3 = new Room { RoomId = Guid.NewGuid(), RoomName = "Auditorium", Capacity = 50, Location = "Begane grond" };
            var room4 = new Room { RoomId = Guid.NewGuid(), RoomName = "Brainstorm Ruimte", Capacity = 8, Location = "1e verdieping" };
            context.Rooms.AddRange(room1, room2, room3, room4);

            // Events
            var event1 = new Event
            {
                EventId = Guid.NewGuid(),
                Title = "Team Meeting Webdev",
                Description = "Discuss project progress",
                EventDate = DateTime.UtcNow.AddDays(7),
                StartTime = TimeSpan.FromHours(14),
                EndTime = TimeSpan.FromHours(15),
                CreatedBy = emp1.UserId,
                Location = "Vergaderzaal A"
            };
            var event2 = new Event
            {
                EventId = Guid.NewGuid(),
                Title = "Project Kickoff",
                Description = "Kickoff new project",
                EventDate = DateTime.UtcNow.AddDays(14),
                StartTime = TimeSpan.FromHours(10),
                EndTime = TimeSpan.FromHours(12),
                CreatedBy = emp1.UserId,
                Location = "Auditorium"
            };
            context.Events.AddRange(event1, event2);

            context.SaveChanges();
        }
    }
}
}