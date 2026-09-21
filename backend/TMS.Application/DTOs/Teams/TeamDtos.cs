namespace TMS.Application.DTOs.Teams;

public record CreateTeamRequest(string Name, int ManagerId);

public record UpdateTeamRequest(string Name, int ManagerId);

public record AssignMemberRequest(int UserId);

public record TeamResponse(
    int Id,
    string Name,
    int ManagerId,
    string ManagerName,
    DateTime CreatedAt,
    List<TeamMemberResponse> Members);

public record TeamMemberResponse(int Id, string FullName, string Email, string Role);
