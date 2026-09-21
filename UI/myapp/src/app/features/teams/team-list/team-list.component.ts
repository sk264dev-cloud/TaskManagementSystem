import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { TeamService } from '../../../core/services/team.service';
import { AuthService } from '../../../core/services/auth.service';
import { Team } from '../../../core/models/models';

@Component({
  selector: 'app-team-list',
  template: `
    <div class="main-content fade-in">
      <div class="page-header">
        <h1>Teams</h1>
        <button class="btn btn-primary" routerLink="/teams/new"
                *ngIf="authService.hasRole('Admin')">
          <i class="bi bi-plus-lg me-1"></i>New Team
        </button>
      </div>

      <div *ngIf="loading" class="spinner-overlay">
        <div class="spinner-border text-primary" role="status"></div>
      </div>

      <div class="row g-4" *ngIf="!loading">
        <div *ngIf="teams.length === 0" class="col-12">
          <div class="empty-state">
            <i class="bi bi-people d-block"></i>
            <h5>No teams found</h5>
            <p>Teams will appear here once created by an admin.</p>
          </div>
        </div>

        <div class="col-md-6 col-lg-4" *ngFor="let team of paginatedTeams">
          <div class="card h-100" style="cursor: pointer;" (click)="viewTeam(team.id)">
            <div class="card-body">
              <div class="d-flex justify-content-between align-items-start mb-3">
                <h5 class="card-title mb-0">{{ team.name }}</h5>
                <span class="badge badge-todo">{{ team.members.length }} members</span>
              </div>
              <p class="text-muted small mb-3">
                <i class="bi bi-person-badge me-1"></i>Manager: {{ team.managerName }}
              </p>
              <div class="d-flex flex-wrap gap-1">
                <span *ngFor="let m of team.members.slice(0, 5)"
                      class="badge bg-light text-dark" style="font-size: 0.75rem;">
                  {{ m.fullName }}
                </span>
                <span *ngIf="team.members.length > 5"
                      class="badge bg-light text-muted" style="font-size: 0.75rem;">
                  +{{ team.members.length - 5 }} more
                </span>
              </div>
            </div>
            <div class="card-footer bg-transparent text-muted small">
              Created {{ team.createdAt | date:'mediumDate' }}
            </div>
          </div>
        </div>

        <!-- 5-Record Pagination Footer -->
        <div class="col-12 mt-4" *ngIf="teams.length > 0">
          <div class="card border-0 shadow-sm py-2 px-3 d-flex flex-column flex-md-row justify-content-between align-items-center gap-2">
            <div class="text-muted small">
              Showing {{ startIndex + 1 }} to {{ endIndex }} of {{ teams.length }} teams
            </div>
            <nav aria-label="Teams pagination">
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
    </div>
  `,
  styles: [`
    .cursor-pointer { cursor: pointer; }
    .pagination .page-link { color: #4f46e5; }
    .pagination .page-item.active .page-link { background-color: #4f46e5; border-color: #4f46e5; color: white; }
  `]
})
export class TeamListComponent implements OnInit {
  teams: Team[] = [];
  loading = true;
  pageSize = 5;
  currentPage = 1;

  constructor(
    private teamService: TeamService,
    public authService: AuthService,
    private router: Router
  ) {}

  ngOnInit(): void {
    this.teamService.getTeams().subscribe({
      next: (teams) => {
        this.teams = teams;
        this.loading = false;
        this.currentPage = 1;
      },
      error: () => { this.loading = false; }
    });
  }

  get totalPages(): number {
    return Math.ceil(this.teams.length / this.pageSize) || 1;
  }

  get startIndex(): number {
    return (this.currentPage - 1) * this.pageSize;
  }

  get endIndex(): number {
    return Math.min(this.startIndex + this.pageSize, this.teams.length);
  }

  get paginatedTeams(): Team[] {
    return this.teams.slice(this.startIndex, this.endIndex);
  }

  get pages(): number[] {
    return Array.from({ length: this.totalPages }, (_, i) => i + 1);
  }

  setPage(page: number): void {
    if (page >= 1 && page <= this.totalPages) {
      this.currentPage = page;
    }
  }

  viewTeam(id: number): void {
    this.router.navigate(['/teams', id]);
  }
}
