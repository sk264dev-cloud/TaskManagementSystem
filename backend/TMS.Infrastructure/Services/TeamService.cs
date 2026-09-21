using Microsoft.EntityFrameworkCore;
using TMS.Application.DTOs.Teams;
using TMS.Application.Interfaces;
using TMS.Domain.Entities;
using TMS.Domain.Enums;
using TMS.Infrastructure.Data;

namespace TMS.Infrastructure.Services;

public class TeamService : ITeamService
{
    private readonly AppDbContext _db;

    public TeamService(AppDbContext db)
    {
        _db = db;
    }

    public async Task<List<TeamResponse>> GetTeamsAsync(int userId, string userRole)
    {
        var query = _db.Teams
            .Include(t => t.Manager)
            .Include(t => t.Members)
            .AsQueryable();

        if (userRole == nameof(UserRole.Manager))
        {
            query = query.Where(t => t.ManagerId == userId);
        }
        else if (userRole == nameof(UserRole.User))
        {
            query = query.Where(t => t.Members.Any(m => m.Id == userId));
        }

        return await query.Select(t => MapToResponse(t)).ToListAsync();
    }

    public async Task<TeamResponse?> GetTeamByIdAsync(int id)
    {
        var team = await _db.Teams
            .Include(t => t.Manager)
            .Include(t => t.Members)
            .FirstOrDefaultAsync(t => t.Id == id);

        return team == null ? null : MapToResponse(team);
    }

    public async Task<TeamResponse> CreateTeamAsync(CreateTeamRequest request)
    {
        var manager = await _db.Users.FindAsync(request.ManagerId)
            ?? throw new KeyNotFoundException("Manager user not found.");

        if (manager.Role != UserRole.Manager && manager.Role != UserRole.Admin)
            throw new InvalidOperationException("The assigned manager must have a Manager or Admin role.");

        if (await _db.Teams.AnyAsync(t => t.Name == request.Name))
            throw new InvalidOperationException("A team with this name already exists.");

        var team = new Team
        {
            Name = request.Name,
            ManagerId = request.ManagerId
        };

        _db.Teams.Add(team);
        await _db.SaveChangesAsync();

        manager.TeamId = team.Id;
        await _db.SaveChangesAsync();

        return await GetTeamByIdAsync(team.Id) ?? throw new Exception("Team creation failed.");
    }

    public async Task<TeamResponse> UpdateTeamAsync(int id, UpdateTeamRequest request)
    {
        var team = await _db.Teams.FindAsync(id) ?? throw new KeyNotFoundException("Team not found.");

        if (await _db.Teams.AnyAsync(t => t.Name == request.Name && t.Id != id))
            throw new InvalidOperationException("A team with this name already exists.");

        team.Name = request.Name;
        team.ManagerId = request.ManagerId;
        await _db.SaveChangesAsync();

        return await GetTeamByIdAsync(id) ?? throw new Exception("Team update failed.");
    }

    public async Task DeleteTeamAsync(int id)
    {
        var team = await _db.Teams
            .Include(t => t.Members)
            .FirstOrDefaultAsync(t => t.Id == id)
            ?? throw new KeyNotFoundException("Team not found.");

        foreach (var member in team.Members)
            member.TeamId = null;

        _db.Teams.Remove(team);
        await _db.SaveChangesAsync();
    }

    public async Task AssignMemberAsync(int teamId, AssignMemberRequest request)
    {
        var team = await _db.Teams.FindAsync(teamId) ?? throw new KeyNotFoundException("Team not found.");
        var user = await _db.Users.FindAsync(request.UserId) ?? throw new KeyNotFoundException("User not found.");

        user.TeamId = teamId;
        await _db.SaveChangesAsync();
    }

    public async Task RemoveMemberAsync(int teamId, int userId)
    {
        var user = await _db.Users.FirstOrDefaultAsync(u => u.Id == userId && u.TeamId == teamId)
            ?? throw new KeyNotFoundException("User is not a member of this team.");

        user.TeamId = null;
        await _db.SaveChangesAsync();
    }

    private static TeamResponse MapToResponse(Team t) => new(
        t.Id, t.Name, t.ManagerId,
        t.Manager?.FullName ?? "",
        t.CreatedAt,
        t.Members?.Select(m => new TeamMemberResponse(m.Id, m.FullName, m.Email, m.Role.ToString())).ToList() ?? new());
}
