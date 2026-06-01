import { CommonModule } from '@angular/common';
import { Component, OnInit } from '@angular/core';
import { RouterLink } from '@angular/router';

import { Order, OrderService } from '../core/order.service';

@Component({
  selector: 'app-order-history-page',
  standalone: true,
  imports: [CommonModule, RouterLink],
  template: `
    <section class="card cart-header">
      <div>
        <span class="chip">Orders</span>
        <h1>Order history</h1>
        <p>All products purchased from your SmartCart account.</p>
      </div>
      <a routerLink="/products" class="secondary-btn">Continue shopping</a>
    </section>
    @if (loading) {
      <p class="status-text">Loading orders...</p>
    } @else if (error) {
      <p class="status-text error-text">Unable to load your orders.</p>
    } @else if (orders.length === 0) {
      <section class="card empty-cart"><p>You have not placed an order yet.</p></section>
    } @else {
      <section class="cart-grid">
        @for (order of orders; track order.id) {
          <article class="card cart-summary">
            <div>
              <strong>Order #{{ order.id }}</strong>
              <p>Product #{{ order.productId }} &middot; Quantity {{ order.quantity }}</p>
            </div>
            <strong>\${{ order.totalAmount | number: '1.2-2' }}</strong>
          </article>
        }
      </section>
    }
  `
})
export class OrderHistoryPageComponent implements OnInit {
  orders: Order[] = [];
  loading = true;
  error = false;

  constructor(private orderService: OrderService) {}

  ngOnInit(): void {
    this.orderService.history().subscribe({
      next: (orders) => {
        this.orders = orders;
        this.loading = false;
      },
      error: () => {
        this.error = true;
        this.loading = false;
      }
    });
  }
}
