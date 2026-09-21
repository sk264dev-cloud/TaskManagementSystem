using TMS.Application.DTOs.Tasks;

namespace TMS.Application.DTOs.Dashboard;

public record DashboardResponse(
    int TotalTasks,
    List<StatusCount> StatusCounts,
    List<PriorityCount> PriorityCounts,
    List<TaskResponse> RecentTasks,
    List<TaskResponse> UpcomingDeadlines);

public record StatusCount(string Status, int Count);

public record PriorityCount(string Priority, int Count);
