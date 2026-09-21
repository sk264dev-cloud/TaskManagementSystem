using System.Security.Claims;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using TMS.Application.DTOs.Teams;
using TMS.Application.Interfaces;

namespace TMS.API.Controllers;

[ApiController]
[Route("api/[controller]")]
[Authorize]
public class TeamsController : ControllerBase
{
    private readonly ITeamService _teamService;

    public TeamsController(ITeamService teamService)
    {
        _teamService = teamService;
    }

    [HttpGet]
    public async Task<ActionResult<List<TeamResponse>>> GetTeams()
    {
        var teams = await _teamService.GetTeamsAsync(GetUserId(), GetUserRole());
        return Ok(teams);
    }

    [HttpGet("{id}")]
    public async Task<ActionResult<TeamResponse>> GetTeam(int id)
    {
        var team = await _teamService.GetTeamByIdAsync(id);
        if (team == null) return NotFound();
        return Ok(team);
    }

    [HttpPost]
    [Authorize(Roles = "Admin")]
    public async Task<ActionResult<TeamResponse>> CreateTeam([FromBody] CreateTeamRequest request)
    {
        var team = await _teamService.CreateTeamAsync(request);
        return CreatedAtAction(nameof(GetTeam), new { id = team.Id }, team);
    }

    [HttpPut("{id}")]
    [Authorize(Roles = "Admin")]
    public async Task<ActionResult<TeamResponse>> UpdateTeam(int id, [FromBody] UpdateTeamRequest request)
    {
        var team = await _teamService.UpdateTeamAsync(id, request);
        return Ok(team);
    }

    [HttpDelete("{id}")]
    [Authorize(Roles = "Admin")]
    public async Task<ActionResult> DeleteTeam(int id)
    {
        await _teamService.DeleteTeamAsync(id);
        return NoContent();
    }

    [HttpPost("{teamId}/members")]
    [Authorize(Roles = "Admin,Manager")]
    public async Task<ActionResult> AssignMember(int teamId, [FromBody] AssignMemberRequest request)
    {
        await _teamService.AssignMemberAsync(teamId, request);
        return NoContent();
    }

    [HttpDelete("{teamId}/members/{userId}")]
    [Authorize(Roles = "Admin,Manager")]
    public async Task<ActionResult> RemoveMember(int teamId, int userId)
    {
        await _teamService.RemoveMemberAsync(teamId, userId);
        return NoContent();
    }

    private int GetUserId() => int.Parse(User.FindFirstValue(ClaimTypes.NameIdentifier)!);
    private string GetUserRole() => User.FindFirstValue(ClaimTypes.Role)!;
}
