import { CommonModule } from '@angular/common';
import { Component } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { Router, RouterLink } from '@angular/router';

import { AuthService } from '../core/auth.service';

@Component({
  selector: 'app-register-page',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterLink],
  template: `
    <div class="login-page">
      <section class="card login-card">
        <span class="chip">New customer</span>
        <h1>Create a SmartCart account</h1>
        <form (ngSubmit)="register()" class="login-form">
          <label>
            Username
            <input type="text" [(ngModel)]="username" name="username" minlength="3" required />
          </label>
          <label>
            Password
            <input type="password" [(ngModel)]="password" name="password" minlength="6" required />
          </label>
          <button type="submit" class="primary-btn">Register</button>
        </form>
        @if (error) {
          <p class="error-text">Registration failed. Choose another username or check your entries.</p>
        }
        <p>Already registered? <a routerLink="/login">Login here.</a></p>
      </section>
    </div>
  `
})
export class RegisterPageComponent {
  username = '';
  password = '';
  error = false;

  constructor(private authService: AuthService, private router: Router) {}

  register(): void {
    this.error = false;
    this.authService.register(this.username, this.password).subscribe({
      next: () => this.router.navigate(['/products']),
      error: () => this.error = true
    });
  }
}
