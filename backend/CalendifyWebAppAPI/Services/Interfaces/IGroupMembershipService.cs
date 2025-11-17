using CalendifyWebAppAPI.Models;

namespace CalendifyWebAppAPI.Services.Interfaces
{
    public interface IGroupMembershipService
    {
        GroupMembership AddMember(GroupMembership membership);
        bool RemoveMember(int userId, int groupId);
        IEnumerable<GroupMembership> GetByGroupId(int groupId);
        IEnumerable<GroupMembership> GetByUserId(int userId);
    }
}


