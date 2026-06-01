import { HttpClient } from '@angular/common/http';
import { Injectable, inject } from '@angular/core';
import { BehaviorSubject, Observable, tap } from 'rxjs';

export interface AuthResponse {
  token: string;
  id: number;
  username: string;
  role: 'USER' | 'ADMIN';
}

@Injectable({ providedIn: 'root' })
export class AuthService {
  private readonly http = inject(HttpClient);
  private readonly storageKey = 'smartcart-auth';
  private readonly baseUrl = 'http://localhost:8080/api/auth';
  private readonly loggedInSubject = new BehaviorSubject<boolean>(this.isLoggedIn());

  readonly isLoggedIn$ = this.loggedInSubject.asObservable();

  login(username: string, password: string): Observable<AuthResponse> {
    return this.http.post<AuthResponse>(`${this.baseUrl}/login`, { username, password })
      .pipe(tap((response) => this.store(response)));
  }

  register(username: string, password: string): Observable<AuthResponse> {
    return this.http.post<AuthResponse>(`${this.baseUrl}/register`, { username, password })
      .pipe(tap((response) => this.store(response)));
  }

  logout(): void {
    localStorage.removeItem(this.storageKey);
    this.loggedInSubject.next(false);
  }

  isLoggedIn(): boolean {
    return !!this.current()?.token;
  }

  token(): string | null {
    return this.current()?.token ?? null;
  }

  private store(response: AuthResponse): void {
    localStorage.setItem(this.storageKey, JSON.stringify(response));
    this.loggedInSubject.next(true);
  }

  private current(): AuthResponse | null {
    try {
      const value = localStorage.getItem(this.storageKey);
      return value ? JSON.parse(value) as AuthResponse : null;
    } catch {
      return null;
    }
  }
}
