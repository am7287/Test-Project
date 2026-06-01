import { AsyncPipe, CommonModule } from '@angular/common';
import { Component, inject } from '@angular/core';
import { RouterLink } from '@angular/router';
import { forkJoin } from 'rxjs';

import { CartItem, CartService } from '../core/cart.service';
import { OrderService } from '../core/order.service';

@Component({
  selector: 'app-cart-page',
  standalone: true,
  imports: [CommonModule, RouterLink, AsyncPipe],
  template: `
    <section class="cart-header card">
      <div>
        <span class="chip">Cart</span>
        <h1>Your cart</h1>
        <p>Adjust quantities or remove items before checkout.</p>
      </div>
      <button class="secondary-btn" (click)="clearCart()">Clear cart</button>
    </section>

    @if (items$ | async; as items) {
      @if (items.length === 0) {
        <section class="card empty-cart">
          <h2>Your cart is empty</h2>
          <p>Browse the products and add your favorites.</p>
          <a routerLink="/products" class="primary-btn">Go to products</a>
        </section>
      } @else {
        <section class="cart-grid">
          @for (item of items; track item.product.id) {
            <article class="cart-item card">
              <img [src]="item.product.thumbnail" [alt]="item.product.title" />
              <div class="cart-info">
                <h3>{{ item.product.title }}</h3>
                <p class="muted">\${{ item.product.price }} each</p>
                <div class="qty-row">
                  <button class="qty-btn" (click)="decrease(item)">-</button>
                  <span>{{ item.quantity }}</span>
                  <button class="qty-btn" (click)="increase(item)">+</button>
                </div>
              </div>
              <div class="cart-total">
                <strong>\${{ item.product.price * item.quantity }}</strong>
                <button class="link-btn" (click)="remove(item)">Remove</button>
              </div>
            </article>
          }
        </section>

        <section class="cart-summary card">
          <div>
            <span>Total</span>
            <strong>\${{ getTotal(items) }}</strong>
          </div>
          <button class="primary-btn" (click)="checkout(items)" [disabled]="placingOrder">Place order</button>
        </section>
      }
    }
    @if (message) {
      <p class="status-text" [class.error-text]="checkoutFailed">{{ message }}</p>
    }
  `
})
export class CartPageComponent {
  private readonly cartService = inject(CartService);
  private readonly orderService = inject(OrderService);
  readonly items$ = this.cartService.items$;
  placingOrder = false;
  checkoutFailed = false;
  message = '';

  getTotal(items: CartItem[]): number {
    return this.cartService.getTotal(items);
  }

  increase(item: CartItem): void {
    this.cartService.updateQuantity(item.product.id, item.quantity + 1);
  }

  decrease(item: CartItem): void {
    this.cartService.updateQuantity(item.product.id, item.quantity - 1);
  }

  remove(item: CartItem): void {
    this.cartService.remove(item.product.id);
  }

  clearCart(): void {
    this.cartService.clear();
  }

  checkout(items: CartItem[]): void {
    this.placingOrder = true;
    this.checkoutFailed = false;
    this.message = '';
    forkJoin(items.map((item) => this.orderService.placeOrder(item.product.id, item.quantity))).subscribe({
      next: () => {
        this.cartService.clear();
        this.message = 'Order placed successfully. View it under My Orders.';
        this.placingOrder = false;
      },
      error: () => {
        this.message = 'Order could not be placed. Check stock or try again later.';
        this.checkoutFailed = true;
        this.placingOrder = false;
      }
    });
  }
}
