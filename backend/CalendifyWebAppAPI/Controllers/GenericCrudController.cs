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
		public virtual async Task<IActionResult> GetAll()
		{
			var items = await Set.ToListAsync();
			return Ok(items);
		}

		[HttpGet("{id}")]
		public virtual async Task<IActionResult> GetById([FromRoute] TKey id)
		{
			var entity = await Set.FindAsync(id);
			if (entity == null)
			{
				return NotFound();
			}
			return Ok(entity);
		}

		[HttpPost]
		public virtual async Task<IActionResult> Create([FromBody] TEntity entity)
		{
			await Set.AddAsync(entity);
			await _context.SaveChangesAsync();
			return Ok(entity);
		}

		[HttpPut("{id}")]
		public virtual async Task<IActionResult> Update([FromRoute] TKey id, [FromBody] TEntity updated)
		{
			var existing = await Set.FindAsync(id);
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
				if (property.PropertyInfo == null || !property.PropertyInfo.CanWrite) continue;

				var newValue = property.PropertyInfo.GetValue(updated);
				property.PropertyInfo.SetValue(existing, newValue);
			}

			await _context.SaveChangesAsync();
			return Ok(existing);
		}

		[HttpDelete("{id}")]
		public virtual async Task<IActionResult> Delete([FromRoute] TKey id)
		{
			var existing = await Set.FindAsync(id);
			if (existing == null)
			{
				return NotFound();
			}

			Set.Remove(existing);
			await _context.SaveChangesAsync();
			return Ok(new { message = "Deleted" });
		}
	}
}

