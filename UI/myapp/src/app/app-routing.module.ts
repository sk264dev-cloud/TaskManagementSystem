import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { AuthGuard } from './core/guards/auth.guard';
import { RoleGuard } from './core/guards/auth.guard';

import { LoginComponent } from './features/auth/login/login.component';
import { RegisterComponent } from './features/auth/register/register.component';
import { DashboardComponent } from './features/dashboard/dashboard.component';
import { TaskListComponent } from './features/tasks/task-list/task-list.component';
import { TaskFormComponent } from './features/tasks/task-form/task-form.component';
import { TaskDetailComponent } from './features/tasks/task-detail/task-detail.component';
import { TeamListComponent } from './features/teams/team-list/team-list.component';
import { TeamFormComponent } from './features/teams/team-form/team-form.component';
import { TeamDetailComponent } from './features/teams/team-detail/team-detail.component';
import { NotificationListComponent } from './features/notifications/notification-list/notification-list.component';
import { UserListComponent } from './features/users/user-list/user-list.component';

const routes: Routes = [
  { path: '', redirectTo: '/dashboard', pathMatch: 'full' },
  { path: 'login', component: LoginComponent },
  { path: 'register', component: RegisterComponent },
  { path: 'dashboard', component: DashboardComponent, canActivate: [AuthGuard] },
  {
    path: 'users', component: UserListComponent,
    canActivate: [AuthGuard, RoleGuard],
    data: { roles: ['Admin'] }
  },
  { path: 'tasks', component: TaskListComponent, canActivate: [AuthGuard] },
  { path: 'tasks/new', component: TaskFormComponent, canActivate: [AuthGuard] },
  { path: 'tasks/:id', component: TaskDetailComponent, canActivate: [AuthGuard] },
  { path: 'tasks/:id/edit', component: TaskFormComponent, canActivate: [AuthGuard] },
  { path: 'teams', component: TeamListComponent, canActivate: [AuthGuard] },
  {
    path: 'teams/new', component: TeamFormComponent,
    canActivate: [AuthGuard, RoleGuard],
    data: { roles: ['Admin'] }
  },
  { path: 'teams/:id', component: TeamDetailComponent, canActivate: [AuthGuard] },
  {
    path: 'teams/:id/edit', component: TeamFormComponent,
    canActivate: [AuthGuard, RoleGuard],
    data: { roles: ['Admin'] }
  },
  { path: 'notifications', component: NotificationListComponent, canActivate: [AuthGuard] },
  { path: '**', redirectTo: '/dashboard' }
];

@NgModule({
  imports: [RouterModule.forRoot(routes)],
  exports: [RouterModule]
})
export class AppRoutingModule { }
