import { Component, OnInit } from '@angular/core';
import { DashboardService } from '../../core/services/dashboard.service';
import { DashboardData, TaskItem } from '../../core/models/models';
import { AuthService } from '../../core/services/auth.service';
import { Router } from '@angular/router';

@Component({
  selector: 'app-dashboard',
  template: `
    <div class="main-content fade-in">
      <div class="page-header">
        <div>
          <h1>Dashboard</h1>
          <p class="text-muted mb-0">Welcome back, {{ userName }}</p>
        </div>
        <button class="btn btn-primary" routerLink="/tasks/new">
          <i class="bi bi-plus-lg me-1"></i>New Task
        </button>
      </div>

      <div *ngIf="loading" class="spinner-overlay">
        <div class="spinner-border text-primary" role="status"></div>
      </div>

      <div *ngIf="!loading && data">
        <!-- Stat Cards -->
        <div class="row g-3 mb-4">
          <div class="col-6 col-md-3">
            <div class="stat-card stat-total">
              <div class="stat-value">{{ data.totalTasks }}</div>
              <div class="stat-label">Total Tasks</div>
            </div>
          </div>
          <div class="col-6 col-md-3">
            <div class="stat-card stat-todo">
              <div class="stat-value">{{ getStatusCount('ToDo') }}</div>
              <div class="stat-label">To Do</div>
            </div>
          </div>
          <div class="col-6 col-md-3">
            <div class="stat-card stat-inprogress">
              <div class="stat-value">{{ getStatusCount('InProgress') }}</div>
              <div class="stat-label">In Progress</div>
            </div>
          </div>
          <div class="col-6 col-md-3">
            <div class="stat-card stat-done">
              <div class="stat-value">{{ getStatusCount('Done') }}</div>
              <div class="stat-label">Completed</div>
            </div>
          </div>
        </div>

        <div class="row g-4">
          <!-- Recent Tasks -->
          <div class="col-lg-6">
            <div class="card">
              <div class="card-header d-flex justify-content-between align-items-center">
                <span><i class="bi bi-clock-history me-2"></i>Recent Tasks</span>
                <a routerLink="/tasks" class="small text-decoration-none" style="color: var(--primary);">View all</a>
              </div>
              <div class="card-body p-0">
                <div *ngIf="data.recentTasks.length === 0" class="empty-state py-4">
                  <i class="bi bi-inbox"></i>
                  <p class="mb-0">No tasks yet</p>
                </div>
                <div *ngFor="let task of data.recentTasks" class="d-flex align-items-center p-3 border-bottom"
                     style="cursor: pointer;" (click)="viewTask(task.id)">
                  <div class="flex-grow-1">
                    <div class="fw-medium">{{ task.title }}</div>
                    <small class="text-muted">{{ task.assignedToUserName || 'Unassigned' }}</small>
                  </div>
                  <span class="badge" [ngClass]="getStatusClass(task.status)">{{ task.status }}</span>
                </div>
              </div>
            </div>
          </div>

          <!-- Upcoming Deadlines -->
          <div class="col-lg-6">
            <div class="card">
              <div class="card-header">
                <i class="bi bi-calendar-event me-2"></i>Upcoming Deadlines
              </div>
              <div class="card-body p-0">
                <div *ngIf="data.upcomingDeadlines.length === 0" class="empty-state py-4">
                  <i class="bi bi-calendar-check"></i>
                  <p class="mb-0">No upcoming deadlines</p>
                </div>
                <div *ngFor="let task of data.upcomingDeadlines" class="d-flex align-items-center p-3 border-bottom"
                     style="cursor: pointer;" (click)="viewTask(task.id)">
                  <div class="flex-grow-1">
                    <div class="fw-medium">{{ task.title }}</div>
                    <small class="text-muted">
                      <i class="bi bi-calendar3 me-1"></i>{{ task.deadline | date:'mediumDate' }}
                    </small>
                  </div>
                  <span class="badge" [ngClass]="getPriorityClass(task.priority)">{{ task.priority }}</span>
                </div>
              </div>
            </div>
          </div>
        </div>

        <!-- Priority Distribution -->
        <div class="row g-3 mt-2">
          <div class="col-md-4" *ngFor="let p of data.priorityCounts">
            <div class="card p-3">
              <div class="d-flex align-items-center">
                <span class="badge me-2" [ngClass]="getPriorityClass(p.priority)" style="font-size: 0.85rem;">
                  {{ p.priority }}
                </span>
                <span class="text-muted small">Priority</span>
                <span class="ms-auto fw-bold" style="font-size: 1.25rem;">{{ p.count }}</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  `
})
export class DashboardComponent implements OnInit {
  data: DashboardData | null = null;
  loading = true;
  userName = '';

  constructor(
    private dashboardService: DashboardService,
    private authService: AuthService,
    private router: Router
  ) {}

  ngOnInit(): void {
    this.userName = this.authService.getCurrentUser()?.fullName || '';
    this.dashboardService.getDashboard().subscribe({
      next: (data) => { this.data = data; this.loading = false; },
      error: () => { this.loading = false; }
    });
  }

  getStatusCount(status: string): number {
    return this.data?.statusCounts.find(s => s.status === status)?.count || 0;
  }

  getStatusClass(status: string): string {
    const map: Record<string, string> = { 'ToDo': 'badge-todo', 'InProgress': 'badge-inprogress', 'Done': 'badge-done' };
    return map[status] || 'badge-secondary';
  }

  getPriorityClass(priority: string): string {
    const map: Record<string, string> = { 'Low': 'badge-low', 'Medium': 'badge-medium', 'High': 'badge-high' };
    return map[priority] || 'badge-secondary';
  }

  viewTask(id: number): void {
    this.router.navigate(['/tasks', id]);
  }
}
