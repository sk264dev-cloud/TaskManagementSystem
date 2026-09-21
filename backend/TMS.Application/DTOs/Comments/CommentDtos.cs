namespace TMS.Application.DTOs.Comments;

public record CreateCommentRequest(string Comment);

public record CommentResponse(
    int Id,
    int TaskId,
    int UserId,
    string UserName,
    string Comment,
    DateTime CreatedAt);
