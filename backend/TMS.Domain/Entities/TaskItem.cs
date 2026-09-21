using TMS.Domain.Enums;

namespace TMS.Domain.Entities;

public class TaskItem
{
    public int Id { get; set; }
    public string Title { get; set; } = string.Empty;
    public string? Description { get; set; }
    public TaskItemStatus Status { get; set; } = TaskItemStatus.ToDo;
    public TaskPriority Priority { get; set; } = TaskPriority.Medium;
    public DateTime? Deadline { get; set; }
    public int? AssignedToUserId { get; set; }
    public int CreatedByUserId { get; set; }
    public int? TeamId { get; set; }
    public DateTime CreatedAt { get; set; } = DateTime.UtcNow;
    public DateTime UpdatedAt { get; set; } = DateTime.UtcNow;

    public User? AssignedToUser { get; set; }
    public User CreatedByUser { get; set; } = null!;
    public Team? Team { get; set; }
    public ICollection<TaskComment> Comments { get; set; } = new List<TaskComment>();
}
