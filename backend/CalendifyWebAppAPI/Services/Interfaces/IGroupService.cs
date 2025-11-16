using CalendifyWebAppAPI.Models;

namespace CalendifyWebAppAPI.Services.Interfaces
{
    public interface IGroupService
    {
        Group Create(Group group);
        Group? Update(int groupId, Group updated);
        bool Delete(int groupId);
        Group? GetById(int groupId);
        IEnumerable<Group> GetAll();
    }
}


