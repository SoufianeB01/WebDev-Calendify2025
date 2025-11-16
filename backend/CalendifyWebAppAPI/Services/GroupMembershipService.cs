using CalendifyWebAppAPI.Data;
using CalendifyWebAppAPI.Models;
using CalendifyWebAppAPI.Services.Interfaces;
using Microsoft.EntityFrameworkCore;

namespace CalendifyWebAppAPI.Services
{
    public class GroupMembershipService : IGroupMembershipService
    {
        private readonly AppDbContext _db;

        public GroupMembershipService(AppDbContext db)
        {
            _db = db;
        }

        public GroupMembership AddMember(GroupMembership membership)
        {
            if (_db.Employees.Find(membership.UserId) == null)
                throw new InvalidOperationException("User not found");
            if (_db.Groups.Find(membership.GroupId) == null)
                throw new InvalidOperationException("Group not found");
            var exists = _db.GroupMemberships.FirstOrDefault(m => m.UserId == membership.UserId && m.GroupId == membership.GroupId);
            if (exists != null)
                throw new InvalidOperationException("User is already a member of this group");
            _db.GroupMemberships.Add(membership);
            _db.SaveChanges();
            return membership;
        }

        public bool RemoveMember(int userId, int groupId)
        {
            var found = _db.GroupMemberships.FirstOrDefault(m => m.UserId == userId && m.GroupId == groupId);
            if (found == null) return false;
            _db.GroupMemberships.Remove(found);
            _db.SaveChanges();
            return true;
        }

        public IEnumerable<GroupMembership> GetByGroupId(int groupId) =>
            _db.GroupMemberships.AsNoTracking().Where(m => m.GroupId == groupId).ToList();

        public IEnumerable<GroupMembership> GetByUserId(int userId) =>
            _db.GroupMemberships.AsNoTracking().Where(m => m.UserId == userId).ToList();
    }
}


