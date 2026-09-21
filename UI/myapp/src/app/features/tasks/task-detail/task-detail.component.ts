import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { TaskService } from '../../../core/services/task.service';
import { CommentService } from '../../../core/services/comment.service';
import { TaskItem, Comment } from '../../../core/models/models';
import { AuthService } from '../../../core/services/auth.service';

@Component({
  selector: 'app-task-detail',
  template: `
    <div class="main-content fade-in" *ngIf="task">
      <div class="page-header">
        <div>
          <nav>
            <a routerLink="/tasks" class="text-decoration-none small" style="color: var(--primary);">
              <i class="bi bi-arrow-left me-1"></i>Back to Tasks
            </a>
          </nav>
          <h1 class="mt-2">{{ task.title }}</h1>
        </div>
        <div class="d-flex gap-2">
          <button class="btn btn-outline-primary" [routerLink]="['/tasks', task.id, 'edit']">
            <i class="bi bi-pencil me-1"></i>Edit
          </button>
          <button class="btn btn-outline-danger" (click)="deleteTask()">
            <i class="bi bi-trash me-1"></i>Delete
          </button>
        </div>
      </div>

      <div class="row g-4">
        <!-- Task Details -->
        <div class="col-lg-8">
          <div class="card mb-4">
            <div class="card-body">
              <h6 class="text-muted mb-3">Description</h6>
              <p *ngIf="task.description">{{ task.description }}</p>
              <p *ngIf="!task.description" class="text-muted fst-italic">No description provided.</p>
            </div>
          </div>

          <!-- Status Quick Update -->
          <div class="card mb-4">
            <div class="card-body">
              <h6 class="text-muted mb-3">Update Status</h6>
              <div class="btn-group w-100">
                <button *ngFor="let s of statuses" class="btn"
                        [class.btn-primary]="task.status === s.value"
                        [class.btn-outline-secondary]="task.status !== s.value"
                        (click)="updateStatus(s.value)">
                  {{ s.label }}
                </button>
              </div>
            </div>
          </div>

          <!-- Comments -->
          <div class="card">
            <div class="card-header">
              <i class="bi bi-chat-dots me-2"></i>Comments ({{ comments.length }})
            </div>
            <div class="card-body">
              <div class="d-flex mb-3">
                <input type="text" class="form-control me-2" [(ngModel)]="newComment"
                       placeholder="Write a comment..." (keyup.enter)="addComment()" id="comment-input">
                <button class="btn btn-primary" (click)="addComment()" [disabled]="!newComment.trim()" id="comment-submit">
                  <i class="bi bi-send"></i>
                </button>
              </div>

              <div *ngIf="comments.length === 0" class="text-center text-muted py-3">
                <i class="bi bi-chat d-block mb-2" style="font-size: 1.5rem; opacity: 0.5;"></i>
                No comments yet. Be the first to comment!
              </div>

              <div *ngFor="let comment of comments" class="d-flex mb-3 pb-3 border-bottom">
                <div class="rounded-circle d-flex align-items-center justify-content-center me-3"
                     style="width: 36px; height: 36px; background: var(--primary-light); color: white; font-weight: 600; font-size: 0.85rem; flex-shrink: 0;">
                  {{ comment.userName.charAt(0) }}
                </div>
                <div class="flex-grow-1">
                  <div class="d-flex justify-content-between">
                    <span class="fw-medium">{{ comment.userName }}</span>
                    <small class="text-muted">{{ comment.createdAt | date:'short' }}</small>
                  </div>
                  <p class="mb-0 mt-1">{{ comment.comment }}</p>
                </div>
              </div>
            </div>
          </div>
        </div>

        <!-- Sidebar -->
        <div class="col-lg-4">
          <div class="card">
            <div class="card-body">
              <h6 class="text-muted mb-3">Details</h6>
              <div class="mb-3">
                <small class="text-muted d-block">Status</small>
                <span class="badge" [ngClass]="getStatusClass(task.status)">{{ formatStatus(task.status) }}</span>
              </div>
              <div class="mb-3">
                <small class="text-muted d-block">Priority</small>
                <span class="badge" [ngClass]="getPriorityClass(task.priority)">{{ task.priority }}</span>
              </div>
              <div class="mb-3">
                <small class="text-muted d-block">Assigned To</small>
                <span>{{ task.assignedToUserName || 'Unassigned' }}</span>
              </div>
              <div class="mb-3">
                <small class="text-muted d-block">Created By</small>
                <span>{{ task.createdByUserName }}</span>
              </div>
              <div class="mb-3" *ngIf="task.teamName">
                <small class="text-muted d-block">Team</small>
                <span>{{ task.teamName }}</span>
              </div>
              <div class="mb-3" *ngIf="task.deadline">
                <small class="text-muted d-block">Deadline</small>
                <span>{{ task.deadline | date:'mediumDate' }}</span>
              </div>
              <div class="mb-3">
                <small class="text-muted d-block">Created</small>
                <span>{{ task.createdAt | date:'medium' }}</span>
              </div>
              <div>
                <small class="text-muted d-block">Last Updated</small>
                <span>{{ task.updatedAt | date:'medium' }}</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>

    <div *ngIf="!task && !loading" class="main-content">
      <div class="empty-state">
        <i class="bi bi-exclamation-triangle d-block"></i>
        <h5>Task not found</h5>
        <a routerLink="/tasks" class="btn btn-primary mt-2">Back to Tasks</a>
      </div>
    </div>
  `
})
export class TaskDetailComponent implements OnInit {
  task: TaskItem | null = null;
  comments: Comment[] = [];
  newComment = '';
  loading = true;
  statuses = [
    { value: 'ToDo', label: 'To Do' },
    { value: 'InProgress', label: 'In Progress' },
    { value: 'Done', label: 'Done' }
  ];

  constructor(
    private taskService: TaskService,
    private commentService: CommentService,
    private authService: AuthService,
    private route: ActivatedRoute,
    private router: Router
  ) {}

  ngOnInit(): void {
    const id = +this.route.snapshot.paramMap.get('id')!;
    this.loadTask(id);
    this.loadComments(id);
  }

  loadTask(id: number): void {
    this.taskService.getTask(id).subscribe({
      next: (task) => { this.task = task; this.loading = false; },
      error: () => { this.loading = false; }
    });
  }

  loadComments(id: number): void {
    this.commentService.getComments(id).subscribe(comments => this.comments = comments);
  }

  addComment(): void {
    if (!this.newComment.trim() || !this.task) return;
    this.commentService.addComment(this.task.id, this.newComment).subscribe(comment => {
      this.comments.unshift(comment);
      this.newComment = '';
    });
  }

  updateStatus(status: string): void {
    if (!this.task || this.task.status === status) return;
    this.taskService.updateTaskStatus(this.task.id, status).subscribe(() => {
      this.task!.status = status;
    });
  }

  deleteTask(): void {
    if (!this.task || !confirm('Delete this task?')) return;
    this.taskService.deleteTask(this.task.id).subscribe(() => this.router.navigate(['/tasks']));
  }

  getStatusClass(status: string): string {
    const map: Record<string, string> = { 'ToDo': 'badge-todo', 'InProgress': 'badge-inprogress', 'Done': 'badge-done' };
    return map[status] || '';
  }

  getPriorityClass(priority: string): string {
    const map: Record<string, string> = { 'Low': 'badge-low', 'Medium': 'badge-medium', 'High': 'badge-high' };
    return map[priority] || '';
  }

  formatStatus(status: string): string {
    const map: Record<string, string> = { 'ToDo': 'To Do', 'InProgress': 'In Progress', 'Done': 'Done' };
    return map[status] || status;
  }
}
