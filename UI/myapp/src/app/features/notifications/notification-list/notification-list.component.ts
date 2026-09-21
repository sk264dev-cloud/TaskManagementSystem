import { Component, OnInit } from '@angular/core';
import { NotificationService } from '../../../core/services/notification.service';
import { Notification } from '../../../core/models/models';
import { Router } from '@angular/router';

@Component({
  selector: 'app-notification-list',
  template: `
    <div class="main-content fade-in">
      <div class="page-header">
        <h1>Notifications</h1>
        <button class="btn btn-outline-primary" (click)="markAllRead()"
                *ngIf="notifications.length > 0" id="mark-all-read">
          <i class="bi bi-check2-all me-1"></i>Mark all as read
        </button>
      </div>

      <div *ngIf="loading" class="spinner-overlay">
        <div class="spinner-border text-primary" role="status"></div>
      </div>

      <div *ngIf="!loading">
        <div *ngIf="notifications.length === 0" class="empty-state">
          <i class="bi bi-bell-slash d-block"></i>
          <h5>No notifications</h5>
          <p>You're all caught up!</p>
        </div>

        <div class="card" *ngIf="notifications.length > 0">
          <div *ngFor="let n of notifications" class="d-flex align-items-start p-3 border-bottom"
               [class.bg-light]="!n.isRead" style="cursor: pointer;"
               (click)="onNotificationClick(n)">
            <div class="rounded-circle d-flex align-items-center justify-content-center me-3 flex-shrink-0"
                 [style.background]="n.type === 'Assignment' ? 'var(--primary-light)' : 'var(--warning)'"
                 style="width: 36px; height: 36px; color: white;">
              <i [class]="n.type === 'Assignment' ? 'bi bi-person-plus' : 'bi bi-arrow-repeat'"></i>
            </div>
            <div class="flex-grow-1">
              <div class="d-flex justify-content-between">
                <p class="mb-1" [class.fw-semibold]="!n.isRead">{{ n.message }}</p>
                <div class="d-flex align-items-center gap-2 ms-2">
                  <span *ngIf="!n.isRead" class="badge bg-primary" style="font-size: 0.65rem;">New</span>
                </div>
              </div>
              <small class="text-muted">
                <i class="bi bi-clock me-1"></i>{{ n.createdAt | date:'short' }}
                <span *ngIf="n.type" class="ms-2">
                  · {{ n.type === 'Assignment' ? 'Task Assignment' : 'Status Update' }}
                </span>
              </small>
            </div>
          </div>
        </div>
      </div>
    </div>
  `
})
export class NotificationListComponent implements OnInit {
  notifications: Notification[] = [];
  loading = true;

  constructor(
    private notificationService: NotificationService,
    private router: Router
  ) {}

  ngOnInit(): void {
    this.notificationService.getNotifications().subscribe({
      next: (notifications) => { this.notifications = notifications; this.loading = false; },
      error: () => { this.loading = false; }
    });
  }

  onNotificationClick(n: Notification): void {
    if (!n.isRead) {
      this.notificationService.markAsRead(n.id).subscribe(() => {
        n.isRead = true;
      });
    }
    if (n.taskId) {
      this.router.navigate(['/tasks', n.taskId]);
    }
  }

  markAllRead(): void {
    this.notificationService.markAllAsRead().subscribe(() => {
      this.notifications.forEach(n => n.isRead = true);
    });
  }
}
