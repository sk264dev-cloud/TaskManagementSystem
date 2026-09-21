using Microsoft.EntityFrameworkCore;
using TMS.Application.DTOs.Comments;
using TMS.Application.Interfaces;
using TMS.Domain.Entities;
using TMS.Infrastructure.Data;

namespace TMS.Infrastructure.Services;

public class CommentService : ICommentService
{
    private readonly AppDbContext _db;

    public CommentService(AppDbContext db)
    {
        _db = db;
    }

    public async Task<List<CommentResponse>> GetCommentsAsync(int taskId)
    {
        return await _db.TaskComments
            .Include(c => c.User)
            .Where(c => c.TaskId == taskId)
            .OrderByDescending(c => c.CreatedAt)
            .Select(c => new CommentResponse(
                c.Id, c.TaskId, c.UserId,
                c.User.FullName, c.Comment, c.CreatedAt))
            .ToListAsync();
    }

    public async Task<CommentResponse> AddCommentAsync(int taskId, CreateCommentRequest request, int userId)
    {
        var task = await _db.Tasks.FindAsync(taskId)
            ?? throw new KeyNotFoundException("Task not found.");

        var comment = new TaskComment
        {
            TaskId = taskId,
            UserId = userId,
            Comment = request.Comment
        };

        _db.TaskComments.Add(comment);
        await _db.SaveChangesAsync();

        var user = await _db.Users.FindAsync(userId);
        return new CommentResponse(comment.Id, taskId, userId, user?.FullName ?? "", comment.Comment, comment.CreatedAt);
    }
}
