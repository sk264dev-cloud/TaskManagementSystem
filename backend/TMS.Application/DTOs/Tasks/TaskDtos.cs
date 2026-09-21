namespace TMS.Application.DTOs.Tasks;

public record CreateTaskRequest(
    string Title,
    string? Description,
    string Priority,
    DateTime? Deadline,
    int? AssignedToUserId,
    int? TeamId);

public record UpdateTaskRequest(
    string Title,
    string? Description,
    string Priority,
    string Status,
    DateTime? Deadline,
    int? AssignedToUserId,
    int? TeamId);

public record UpdateTaskStatusRequest(string Status);

public record TaskResponse(
    int Id,
    string Title,
    string? Description,
    string Status,
    string Priority,
    DateTime? Deadline,
    int? AssignedToUserId,
    string? AssignedToUserName,
    int CreatedByUserId,
    string CreatedByUserName,
    int? TeamId,
    string? TeamName,
    DateTime CreatedAt,
    DateTime UpdatedAt,
    int CommentCount);

public record TaskFilterRequest
{
    public string? Status { get; init; }
    public string? Priority { get; init; }
    public DateTime? DeadlineFrom { get; init; }
    public DateTime? DeadlineTo { get; init; }
    public int? TeamId { get; init; }
    public int? AssignedToUserId { get; init; }
    public string? SearchTerm { get; init; }
}
