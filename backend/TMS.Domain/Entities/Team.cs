namespace TMS.Domain.Entities;

public class Team
{
    public int Id { get; set; }
    public string Name { get; set; } = string.Empty;
    public int ManagerId { get; set; }
    public DateTime CreatedAt { get; set; } = DateTime.UtcNow;

    public User Manager { get; set; } = null!;
    public ICollection<User> Members { get; set; } = new List<User>();
    public ICollection<TaskItem> Tasks { get; set; } = new List<TaskItem>();
}
