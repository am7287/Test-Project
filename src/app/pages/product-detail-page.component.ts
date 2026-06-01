import { CommonModule } from '@angular/common';
import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, RouterLink } from '@angular/router';

import { CartService } from '../core/cart.service';
import { Product, Review } from '../core/product.model';
import { ProductService } from '../core/product.service';

@Component({
  selector: 'app-product-detail-page',
  standalone: true,
  imports: [CommonModule, RouterLink],
  template: `
    @if (loading) {
      <p class="status-text">Loading product...</p>
    } @else if (error || !product) {
      <p class="status-text error-text">Unable to load this product.</p>
    } @else {
      <section class="detail-layout">
        <div class="detail-image card">
          <img [src]="imageFor(product)" [alt]="product.title" />
        </div>

        <div class="detail-info">
          <span class="chip secondary-chip">Product details</span>
          <span class="chip">{{ product.category ?? 'General' }}</span>
          <h1>{{ product.title }}</h1>
          <p>{{ product.description }}</p>

          <div class="detail-metrics">
            <div class="metric">
              <span>Price:</span>
              <strong>\${{ product.price }}</strong>
            </div>
            <div class="metric">
              <span>Rating:</span>
              <strong>{{ product.rating | number: '1.1-1' }}</strong>
            </div>
            <div class="metric">
              <span>Stock:</span>
              <strong>{{ product.stock }}</strong>
            </div>
          </div>

          <div class="detail-actions">
            <div class="qty-row">
              <button class="qty-btn" (click)="changeQty(-1)">-</button>
              <span>{{ quantity }}</span>
              <button class="qty-btn" (click)="changeQty(1)">+</button>
            </div>
            <button class="primary-btn" (click)="addToCart(product)">Add to cart</button>
            <a routerLink="/products" class="secondary-btn">Back to products</a>
          </div>

          @if (added) {
            <p class="status-text">Added to cart.</p>
          }
        </div>
      </section>

      <section class="reviews card">
        <h2>Customer reviews</h2>
        <div class="review-grid">
          @for (review of reviews; track review.name) {
            <div class="review">
              <div class="review-head">
                <strong>{{ review.name }}</strong>
                <span>&#9733; {{ review.rating }}</span>
              </div>
              <p>{{ review.text }}</p>
            </div>
          }
        </div>
      </section>
    }
  `
})
export class ProductDetailPageComponent implements OnInit {
  product?: Product;
  reviews: Review[] = [];
  loading = true;
  error = false;
  quantity = 1;
  added = false;

  constructor(
    private route: ActivatedRoute,
    private productService: ProductService,
    private cartService: CartService
  ) {}

  ngOnInit(): void {
    const id = Number(this.route.snapshot.paramMap.get('id'));
    if (!id) {
      this.error = true;
      this.loading = false;
      return;
    }

    this.productService.getProduct(id).subscribe({
      next: (product) => {
        this.product = product;
        this.reviews = this.productService.getReviews(id);
        this.loading = false;
      },
      error: () => {
        this.error = true;
        this.loading = false;
      }
    });
  }

  imageFor(product: Product): string {
    return product.thumbnail || product.images?.[0] || '';
  }

  changeQty(delta: number): void {
    const next = this.quantity + delta;
    this.quantity = Math.max(1, next);
  }

  addToCart(product: Product): void {
    this.cartService.addToCart(product, this.quantity);
    this.added = true;
    setTimeout(() => {
      this.added = false;
    }, 1500);
  }
}
