using CalendifyWebAppAPI.Data;
using CalendifyWebAppAPI.Models;
using CalendifyWebAppAPI.Services.Interfaces;
using Microsoft.EntityFrameworkCore;

namespace CalendifyWebAppAPI.Services
{
    public class GroupService : IGroupService
    {
        private readonly AppDbContext _db;

        public GroupService(AppDbContext db)
        {
            _db = db;
        }

        public Group Create(Group group)
        {
            _db.Groups.Add(group);
            _db.SaveChanges();
            return group;
        }

        public Group? Update(int groupId, Group updated)
        {
            var found = _db.Groups.Find(groupId);
            if (found == null) return null;
            found.GroupName = updated.GroupName;
            found.Description = updated.Description;
            _db.SaveChanges();
            return found;
        }

        public bool Delete(int groupId)
        {
            var found = _db.Groups.Find(groupId);
            if (found == null) return false;
            _db.Groups.Remove(found);
            _db.SaveChanges();
            return true;
        }

        public Group? GetById(int groupId) => _db.Groups.Find(groupId);
        public IEnumerable<Group> GetAll() => _db.Groups.AsNoTracking().ToList();
    }
}


