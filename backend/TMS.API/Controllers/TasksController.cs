using System.Security.Claims;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using TMS.Application.DTOs.Tasks;
using TMS.Application.Interfaces;

namespace TMS.API.Controllers;

[ApiController]
[Route("api/[controller]")]
[Authorize]
public class TasksController : ControllerBase
{
    private readonly ITaskService _taskService;

    public TasksController(ITaskService taskService)
    {
        _taskService = taskService;
    }

    [HttpGet]
    public async Task<ActionResult<List<TaskResponse>>> GetTasks([FromQuery] TaskFilterRequest filter)
    {
        var userId = GetUserId();
        var role = GetUserRole();
        var tasks = await _taskService.GetTasksAsync(filter, userId, role);
        return Ok(tasks);
    }

    [HttpGet("{id}")]
    public async Task<ActionResult<TaskResponse>> GetTask(int id)
    {
        var task = await _taskService.GetTaskByIdAsync(id, GetUserId(), GetUserRole());
        if (task == null) return NotFound();
        return Ok(task);
    }

    [HttpPost]
    public async Task<ActionResult<TaskResponse>> CreateTask([FromBody] CreateTaskRequest request)
    {
        var task = await _taskService.CreateTaskAsync(request, GetUserId());
        return CreatedAtAction(nameof(GetTask), new { id = task.Id }, task);
    }

    [HttpPut("{id}")]
    public async Task<ActionResult<TaskResponse>> UpdateTask(int id, [FromBody] UpdateTaskRequest request)
    {
        var task = await _taskService.UpdateTaskAsync(id, request, GetUserId(), GetUserRole());
        return Ok(task);
    }

    [HttpPatch("{id}/status")]
    public async Task<ActionResult> UpdateTaskStatus(int id, [FromBody] UpdateTaskStatusRequest request)
    {
        await _taskService.UpdateTaskStatusAsync(id, request, GetUserId());
        return NoContent();
    }

    [HttpDelete("{id}")]
    public async Task<ActionResult> DeleteTask(int id)
    {
        await _taskService.DeleteTaskAsync(id, GetUserId(), GetUserRole());
        return NoContent();
    }

    private int GetUserId() => int.Parse(User.FindFirstValue(ClaimTypes.NameIdentifier)!);
    private string GetUserRole() => User.FindFirstValue(ClaimTypes.Role)!;
}
