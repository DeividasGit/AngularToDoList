using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;

namespace ToDoList.Server.Controllers {
 [ApiController]
 [Route("[controller]")]
 public class TaskController(ApplicationDbContext context) : Controller {
  private readonly ApplicationDbContext _context = context;

  [HttpGet]
  public async Task<ActionResult<IEnumerable<Task>>> GetTaskList() {
   return await _context.Tasks.ToListAsync();
  }
  [HttpGet("{id}")]
  public async Task<ActionResult<Task>> GetTask(int id) {
   var task = await _context.Tasks.FindAsync(id);

   if (task == null) {
    return NotFound();
   }

   return task;
  }
  [HttpPost]
  public async Task<ActionResult<Task>> PostTask(Task task) {
   _context.Tasks.Add(task);
   await _context.SaveChangesAsync();

   return CreatedAtAction("GetTask", new { id = task.Id }, task);
  }
  [HttpDelete("{id}")]
  public async Task<IActionResult> DeleteTask(int id) {
   var task = await _context.Tasks.FindAsync(id);
   if (task == null) {
    return NotFound();
   }

   _context.Tasks.Remove(task);
   await _context.SaveChangesAsync();

   return NoContent();
  }
  [HttpPut("{id}")]
  public async Task<IActionResult> PutTask(int id, Task task) {
   if (id != task.Id) {
    return BadRequest();
   }

   _context.Entry(task).State = EntityState.Modified;

   try {
    await _context.SaveChangesAsync();
   } catch (DbUpdateConcurrencyException) {
    if (!TaskExists(id)) {
     return NotFound();
    } else {
     throw;
    }
   }

   return NoContent();
  }

  private bool TaskExists(int id) {
   return _context.Tasks.Any(e => e.Id == id);
  }
 }
}
