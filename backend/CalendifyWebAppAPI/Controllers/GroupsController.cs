using Microsoft.AspNetCore.Mvc;
using CalendifyWebAppAPI.Data;
using CalendifyWebAppAPI.Models;

namespace CalendifyWebAppAPI.Controllers
{
    [ApiController]
    [Route("api/[controller]")]
    public class GroupsController : GenericCrudController<Group, int>
    {
        public GroupsController(AppDbContext context) : base(context) { }
    }
}

