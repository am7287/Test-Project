import { Component, OnInit } from '@angular/core';
import { RouterLink } from '@angular/router';

import { AuthService } from '../core/auth.service';

@Component({
  selector: 'app-logout-page',
  standalone: true,
  imports: [RouterLink],
  template: `
    <section class="card logout-card">
      <span class="chip">Signed out</span>
      <h1>You are logged out</h1>
      <p>Thanks for visiting SmartCart. Come back anytime.</p>
      <a routerLink="/login" class="primary-btn">Return to Login</a>
    </section>
  `
})
export class LogoutPageComponent implements OnInit {
  constructor(private authService: AuthService) {}

  ngOnInit(): void {
    this.authService.logout();
  }
}
