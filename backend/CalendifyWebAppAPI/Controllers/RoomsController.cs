using Microsoft.AspNetCore.Mvc;
using CalendifyWebAppAPI.Data;
using CalendifyWebAppAPI.Models;

namespace CalendifyWebAppAPI.Controllers
{
	[ApiController]
	[Route("api/[controller]")]
	public class RoomsController : GenericCrudController<Room, int>
	{
		public RoomsController(AppDbContext context) : base(context) { }
	}
}
