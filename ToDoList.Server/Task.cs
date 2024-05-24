﻿namespace ToDoList.Server {
 public class Task {
  public int Id { get; set; }
  public string Name { get; set; }
  public string Description { get; set; }
  public bool IsComplete { get; set; }
  public DateTime? DueDate { get; set; }
 }
}
