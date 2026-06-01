import { CommonModule } from '@angular/common';
import { Component } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';

import { AuthService } from '../core/auth.service';

@Component({
  selector: 'app-login-page',
  standalone: true,
  imports: [CommonModule, FormsModule],
  template: `
    <div class="login-page">
      <section class="card login-card">
        <div class="login-header">
          <span class="chip">Welcome back</span>
          <h1>Login to SmartCart</h1>
          <p>Sign in to place orders and view order history.</p>
        </div>

        <form (ngSubmit)="handleLogin()" class="login-form">
          <label>
            Username
            <input type="text" [(ngModel)]="username" name="username" placeholder="demo" required />
          </label>

          <label>
            Password
            <input type="password" [(ngModel)]="password" name="password" placeholder="demo123" required />
          </label>

          <button type="submit" class="primary-btn">Login</button>
        </form>

        <div class="login-footer">
          <p><strong>Customer demo:</strong> demo / demo123 &nbsp; <strong>Admin:</strong> admin / admin123</p>
          @if (showError) {
            <p class="error-text">Username or password is incorrect. Ensure the backend services are running.</p>
          }
        </div>
      </section>
    </div>
  `
})
export class LoginPageComponent {
  username = '';
  password = '';
  showError = false;

  constructor(private authService: AuthService, private router: Router) {}

  handleLogin(): void {
    this.showError = false;
    this.authService.login(this.username, this.password).subscribe({
      next: () => this.router.navigate(['/products']),
      error: () => this.showError = true
    });
  }
}
