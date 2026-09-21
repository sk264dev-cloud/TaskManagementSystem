using System.Security.Claims;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using TMS.Application.DTOs.Comments;
using TMS.Application.Interfaces;

namespace TMS.API.Controllers;

[ApiController]
[Route("api/tasks/{taskId}/comments")]
[Authorize]
public class CommentsController : ControllerBase
{
    private readonly ICommentService _commentService;

    public CommentsController(ICommentService commentService)
    {
        _commentService = commentService;
    }

    [HttpGet]
    public async Task<ActionResult<List<CommentResponse>>> GetComments(int taskId)
    {
        var comments = await _commentService.GetCommentsAsync(taskId);
        return Ok(comments);
    }

    [HttpPost]
    public async Task<ActionResult<CommentResponse>> AddComment(int taskId, [FromBody] CreateCommentRequest request)
    {
        var userId = int.Parse(User.FindFirstValue(ClaimTypes.NameIdentifier)!);
        var comment = await _commentService.AddCommentAsync(taskId, request, userId);
        return CreatedAtAction(nameof(GetComments), new { taskId }, comment);
    }
}
