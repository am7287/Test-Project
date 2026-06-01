import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Injectable, inject } from '@angular/core';
import { Observable } from 'rxjs';

import { AuthService } from './auth.service';

export interface Order {
  id: number;
  userId: number;
  productId: number;
  quantity: number;
  totalAmount: number;
}

@Injectable({ providedIn: 'root' })
export class OrderService {
  private readonly http = inject(HttpClient);
  private readonly auth = inject(AuthService);
  private readonly baseUrl = 'http://localhost:8080/api/orders';

  placeOrder(productId: number, quantity: number): Observable<Order> {
    return this.http.post<Order>(this.baseUrl, { productId, quantity }, { headers: this.headers() });
  }

  history(): Observable<Order[]> {
    return this.http.get<Order[]>(`${this.baseUrl}/history`, { headers: this.headers() });
  }

  private headers(): HttpHeaders {
    return new HttpHeaders({ Authorization: `Bearer ${this.auth.token() ?? ''}` });
  }
}
