import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { TaskService } from '../../../core/services/task.service';
import { TaskItem, TaskFilter } from '../../../core/models/models';

@Component({
  selector: 'app-task-list',
  template: `
    <div class="main-content fade-in">
      <div class="page-header">
        <h1>Tasks</h1>
        <button class="btn btn-primary" routerLink="/tasks/new">
          <i class="bi bi-plus-lg me-1"></i>New Task
        </button>
      </div>

      <!-- Filters -->
      <div class="card mb-4">
        <div class="card-body">
          <div class="row g-3">
            <div class="col-md-3">
              <input type="text" class="form-control" placeholder="Search tasks..."
                     [(ngModel)]="filter.searchTerm" (input)="loadTasks()" id="task-search">
            </div>
            <div class="col-md-2">
              <select class="form-select" [(ngModel)]="filter.status" (change)="loadTasks()" id="filter-status">
                <option value="">All Statuses</option>
                <option value="ToDo">To Do</option>
                <option value="InProgress">In Progress</option>
                <option value="Done">Done</option>
              </select>
            </div>
            <div class="col-md-2">
              <select class="form-select" [(ngModel)]="filter.priority" (change)="loadTasks()" id="filter-priority">
                <option value="">All Priorities</option>
                <option value="Low">Low</option>
                <option value="Medium">Medium</option>
                <option value="High">High</option>
              </select>
            </div>
            <div class="col-md-2">
              <input type="date" class="form-control" [(ngModel)]="filter.deadlineFrom"
                     (change)="loadTasks()" placeholder="From" id="filter-from">
            </div>
            <div class="col-md-2">
              <input type="date" class="form-control" [(ngModel)]="filter.deadlineTo"
                     (change)="loadTasks()" placeholder="To" id="filter-to">
            </div>
            <div class="col-md-1 d-flex align-items-center">
              <button class="btn btn-outline-secondary btn-sm w-100" (click)="clearFilters()" title="Clear filters">
                <i class="bi bi-x-lg"></i>
              </button>
            </div>
          </div>
        </div>
      </div>

      <div *ngIf="loading" class="spinner-overlay">
        <div class="spinner-border text-primary" role="status"></div>
      </div>

      <!-- Task Table -->
      <div class="card" *ngIf="!loading">
        <div class="table-responsive">
          <table class="table mb-0">
            <thead>
              <tr>
                <th>Title</th>
                <th>Status</th>
                <th>Priority</th>
                <th>Assigned To</th>
                <th>Deadline</th>
                <th>Team</th>
                <th class="text-end">Actions</th>
              </tr>
            </thead>
            <tbody>
              <tr *ngIf="tasks.length === 0">
                <td colspan="7">
                  <div class="empty-state">
                    <i class="bi bi-inbox d-block"></i>
                    <h5>No tasks found</h5>
                    <p>Create a new task to get started.</p>
                  </div>
                </td>
              </tr>
              <tr *ngFor="let task of paginatedTasks" style="cursor: pointer;" (click)="viewTask(task.id)">
                <td>
                  <div class="fw-medium">{{ task.title }}</div>
                  <small class="text-muted" *ngIf="task.commentCount > 0">
                    <i class="bi bi-chat-dots me-1"></i>{{ task.commentCount }}
                  </small>
                </td>
                <td><span class="badge" [ngClass]="getStatusClass(task.status)">{{ formatStatus(task.status) }}</span></td>
                <td><span class="badge" [ngClass]="getPriorityClass(task.priority)">{{ task.priority }}</span></td>
                <td>{{ task.assignedToUserName || '—' }}</td>
                <td>
                  <span *ngIf="task.deadline">{{ task.deadline | date:'mediumDate' }}</span>
                  <span *ngIf="!task.deadline" class="text-muted">—</span>
                </td>
                <td>{{ task.teamName || '—' }}</td>
                <td class="text-end" (click)="$event.stopPropagation()">
                  <button class="btn btn-sm btn-outline-primary me-1" [routerLink]="['/tasks', task.id, 'edit']"
                          title="Edit" id="edit-task-{{task.id}}">
                    <i class="bi bi-pencil"></i>
                  </button>
                  <button class="btn btn-sm btn-outline-danger" (click)="deleteTask(task.id)"
                          title="Delete" id="delete-task-{{task.id}}">
                    <i class="bi bi-trash"></i>
                  </button>
                </td>
              </tr>
            </tbody>
          </table>
        </div>

        <!-- 5-Record Pagination Footer -->
        <div class="card-footer bg-white border-0 py-3 d-flex flex-column flex-md-row justify-content-between align-items-center gap-2"
             *ngIf="tasks.length > 0">
          <div class="text-muted small">
            Showing {{ startIndex + 1 }} to {{ endIndex }} of {{ tasks.length }} tasks
          </div>
          <nav aria-label="Tasks pagination">
            <ul class="pagination pagination-sm mb-0">
              <li class="page-item" [class.disabled]="currentPage === 1">
                <a class="page-link cursor-pointer" (click)="setPage(currentPage - 1)">
                  <i class="bi bi-chevron-left"></i> Previous
                </a>
              </li>
              <li class="page-item" *ngFor="let page of pages" [class.active]="currentPage === page">
                <a class="page-link cursor-pointer" (click)="setPage(page)">{{ page }}</a>
              </li>
              <li class="page-item" [class.disabled]="currentPage === totalPages">
                <a class="page-link cursor-pointer" (click)="setPage(currentPage + 1)">
                  Next <i class="bi bi-chevron-right"></i>
                </a>
              </li>
            </ul>
          </nav>
        </div>
      </div>
    </div>
  `,
  styles: [`
    .cursor-pointer { cursor: pointer; }
    .pagination .page-link { color: #4f46e5; }
    .pagination .page-item.active .page-link { background-color: #4f46e5; border-color: #4f46e5; color: white; }
  `]
})
export class TaskListComponent implements OnInit {
  tasks: TaskItem[] = [];
  loading = true;
  filter: TaskFilter = {};
  pageSize = 5;
  currentPage = 1;

  constructor(private taskService: TaskService, private router: Router) {}

  ngOnInit(): void { this.loadTasks(); }

  loadTasks(): void {
    this.taskService.getTasks(this.filter).subscribe({
      next: (tasks) => {
        this.tasks = tasks;
        this.loading = false;
        this.currentPage = 1;
      },
      error: () => { this.loading = false; }
    });
  }

  get totalPages(): number {
    return Math.ceil(this.tasks.length / this.pageSize) || 1;
  }

  get startIndex(): number {
    return (this.currentPage - 1) * this.pageSize;
  }

  get endIndex(): number {
    return Math.min(this.startIndex + this.pageSize, this.tasks.length);
  }

  get paginatedTasks(): TaskItem[] {
    return this.tasks.slice(this.startIndex, this.endIndex);
  }

  get pages(): number[] {
    return Array.from({ length: this.totalPages }, (_, i) => i + 1);
  }

  setPage(page: number): void {
    if (page >= 1 && page <= this.totalPages) {
      this.currentPage = page;
    }
  }

  clearFilters(): void {
    this.filter = {};
    this.loadTasks();
  }

  viewTask(id: number): void { this.router.navigate(['/tasks', id]); }

  deleteTask(id: number): void {
    if (confirm('Are you sure you want to delete this task?')) {
      this.taskService.deleteTask(id).subscribe(() => this.loadTasks());
    }
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
