using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using CalendifyWebAppAPI.Data;
using System.Linq;

namespace CalendifyWebAppAPI.Controllers
{
	public abstract class GenericCrudController<TEntity, TKey> : ControllerBase
		where TEntity : class
	{
		protected readonly AppDbContext _context;
		protected DbSet<TEntity> Set => _context.Set<TEntity>();

		protected GenericCrudController(AppDbContext context)
		{
			_context = context;
		}

		[HttpGet]
		public virtual IActionResult GetAll()
		{
			var items = Set.ToList();
			return Ok(items);
		}

		[HttpGet("{id}")]
		public virtual IActionResult GetById([FromRoute] TKey id)
		{
			var entity = Set.Find(id);
			if (entity == null)
			{
				return NotFound();
			}

			return Ok(entity);
		}

		[HttpPost]
		public virtual IActionResult Create([FromBody] TEntity entity)
		{
			Set.Add(entity);
			_context.SaveChanges();
			return Ok(entity);
		}

		[HttpPut("{id}")]
		public virtual IActionResult Update([FromRoute] TKey id, [FromBody] TEntity updated)
		{
			var existing = Set.Find(id);
			if (existing == null)
			{
				return NotFound();
			}
			var entityType = _context.Model.FindEntityType(typeof(TEntity));
			if (entityType == null)
			{
				return BadRequest(new { message = "Entity metadata not found" });
			}

			var keyNames = entityType.FindPrimaryKey()?.Properties.Select(p => p.Name).ToHashSet() ?? new HashSet<string>();
			foreach (var property in entityType.GetProperties())
			{
				if (keyNames.Contains(property.Name)) continue;
				// Skip navigations (should nt be in GetProperties, but guard)
				if (property.PropertyInfo == null || !property.PropertyInfo.CanWrite) continue;

				var newValue = property.PropertyInfo.GetValue(updated);
				property.PropertyInfo.SetValue(existing, newValue);
			}

			_context.SaveChanges();
			return Ok(existing);
		}

		[HttpDelete("{id}")]
		public virtual IActionResult Delete([FromRoute] TKey id)
		{
			var existing = Set.Find(id);
			if (existing == null)
			{
				return NotFound();
			}

			Set.Remove(existing);
			_context.SaveChanges();
			return Ok(new { message = "Deleted" });
		}
	}
}

