import { Component } from '@angular/core';
import { AuthService } from './core/services/auth.service';

@Component({
  selector: 'app-root',
  template: `
    <app-loading-spinner></app-loading-spinner>
    <app-navbar *ngIf="authService.isLoggedIn()"></app-navbar>
    <router-outlet></router-outlet>
  `,
  styles: []
})
export class AppComponent {
  constructor(public authService: AuthService) {}
}
