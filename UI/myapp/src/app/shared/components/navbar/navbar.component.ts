import { Component, OnInit, HostListener, ElementRef } from '@angular/core';
import { Router, NavigationEnd } from '@angular/router';
import { filter } from 'rxjs/operators';
import { AuthService } from '../../../core/services/auth.service';
import { NotificationService } from '../../../core/services/notification.service';

@Component({
  selector: 'app-navbar',
  template: `
    <nav class="navbar navbar-expand-lg navbar-custom">
      <div class="container">
        <a class="navbar-brand" routerLink="/dashboard">
          <i class="bi bi-kanban me-2"></i>TaskFlow
        </a>
        <button class="navbar-toggler" type="button" (click)="isCollapsed = !isCollapsed"
                style="border-color: rgba(255,255,255,0.3);">
          <i class="bi bi-list" style="color: white; font-size: 1.5rem;"></i>
        </button>
        <div class="collapse navbar-collapse" [class.show]="!isCollapsed" id="navbarNav">
          <ul class="navbar-nav me-auto">
            <li class="nav-item">
              <a class="nav-link" routerLink="/dashboard" routerLinkActive="active">
                <i class="bi bi-speedometer2 me-1"></i>Dashboard
              </a>
            </li>
            <li class="nav-item">
              <a class="nav-link" routerLink="/tasks" routerLinkActive="active">
                <i class="bi bi-check2-square me-1"></i>Tasks
              </a>
            </li>
            <li class="nav-item">
              <a class="nav-link" routerLink="/teams" routerLinkActive="active">
                <i class="bi bi-people me-1"></i>Teams
              </a>
            </li>
            <li class="nav-item" *ngIf="userRole === 'Admin'">
              <a class="nav-link" routerLink="/users" routerLinkActive="active">
                <i class="bi bi-person-gear me-1"></i>Users
              </a>
            </li>
          </ul>
          <ul class="navbar-nav align-items-center">
            <li class="nav-item me-2">
              <a class="nav-link notification-badge" routerLink="/notifications" routerLinkActive="active" title="Notifications">
                <i class="bi bi-bell"></i>
                <span class="badge-count" *ngIf="unreadCount > 0">{{ unreadCount }}</span>
              </a>
            </li>
            <li class="nav-item dropdown position-relative me-2" [class.show]="dropdownOpen">
              <a class="nav-link dropdown-toggle d-flex align-items-center" 
                 role="button" 
                 (click)="toggleDropdown($event)"
                 style="cursor: pointer;">
                <i class="bi bi-person-circle me-1"></i>{{ userName || 'User' }}
                <span class="badge bg-light text-dark ms-2" style="font-size: 0.7rem;">{{ userRole }}</span>
              </a>
              <ul class="dropdown-menu dropdown-menu-end shadow" [class.show]="dropdownOpen" style="position: absolute; right: 0; min-width: 190px;">
                <li><span class="dropdown-item-text text-muted small">{{ userName }}</span></li>
                <li><span class="dropdown-item-text text-muted small">Role: <strong>{{ userRole }}</strong></span></li>
                <li><hr class="dropdown-divider"></li>
                <li *ngIf="userRole === 'Admin'">
                  <a class="dropdown-item" routerLink="/users">
                    <i class="bi bi-person-gear me-2"></i>Manage Users
                  </a>
                </li>
                <li>
                  <a class="dropdown-item text-danger" href="javascript:void(0)" (click)="logout($event)">
                    <i class="bi bi-box-arrow-right me-2"></i>Logout
                  </a>
                </li>
              </ul>
            </li>
            <li class="nav-item ms-lg-1">
              <button class="btn btn-outline-light btn-sm d-flex align-items-center px-3 py-1" 
                      (click)="logout($event)" 
                      title="Logout">
                <i class="bi bi-box-arrow-right me-1"></i>
                <span>Logout</span>
              </button>
            </li>
          </ul>
        </div>
      </div>
    </nav>
  `,
  styles: [`
    .dropdown-menu { border-radius: 8px; box-shadow: 0 10px 25px rgba(0,0,0,0.15); border: 1px solid var(--border); }
    .dropdown-item { font-size: 0.9rem; padding: 0.5rem 1rem; cursor: pointer; }
    .dropdown-item:hover { background: var(--surface); }
  `]
})
export class NavbarComponent implements OnInit {
  userName = '';
  userRole = '';
  unreadCount = 0;
  dropdownOpen = false;
  isCollapsed = true;

  constructor(
    private authService: AuthService,
    private notificationService: NotificationService,
    private router: Router,
    private elementRef: ElementRef
  ) {}

  @HostListener('document:click', ['$event'])
  onDocumentClick(event: MouseEvent): void {
    if (!this.elementRef.nativeElement.contains(event.target)) {
      this.dropdownOpen = false;
    }
  }

  toggleDropdown(event: MouseEvent): void {
    event.preventDefault();
    event.stopPropagation();
    this.dropdownOpen = !this.dropdownOpen;
  }

  ngOnInit(): void {
    this.authService.currentUser$.subscribe(user => {
      this.userName = user?.fullName || '';
      this.userRole = user?.role || '';
    });

    this.notificationService.unreadCount$.subscribe(count => {
      this.unreadCount = count;
    });

    this.router.events.pipe(
      filter(event => event instanceof NavigationEnd)
    ).subscribe(() => {
      this.dropdownOpen = false;
      this.isCollapsed = true;
      if (this.authService.isLoggedIn()) {
        this.notificationService.refreshUnreadCount();
      }
    });

    if (this.authService.isLoggedIn()) {
      this.notificationService.refreshUnreadCount();
    }
  }

  logout(event?: Event): void {
    if (event) {
      event.preventDefault();
    }
    this.dropdownOpen = false;
    this.authService.logout();
  }
}
