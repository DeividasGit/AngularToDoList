using Microsoft.EntityFrameworkCore;

namespace ToDoList.Server {
 public class ApplicationDbContext : DbContext {
  public ApplicationDbContext(DbContextOptions<ApplicationDbContext> options)
      : base(options) {
  }

  public DbSet<Task> Tasks { get; set; }
 }
}
