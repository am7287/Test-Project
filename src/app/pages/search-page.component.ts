import { CommonModule } from '@angular/common';
import { Component } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { RouterLink } from '@angular/router';

import { Product } from '../core/product.model';
import { ProductService } from '../core/product.service';

@Component({
  selector: 'app-search-page',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterLink],
  template: `
    <section class="card search-card">
      <div>
        <span class="chip">Search bar</span>
        <h1>Find the product you want</h1>
        <p>Search the SmartCart catalog by product name or description.</p>
      </div>
      <div class="search-row">
        <input type="text" placeholder="Try phone, laptop, perfume..." [(ngModel)]="query" />
        <button class="primary-btn" (click)="runSearch()">Search</button>
      </div>
    </section>

    <section class="search-suggestions">
      <div class="suggestion-card card">
        <h3>Popular right now</h3>
        <div class="suggestion-tags">
          <button class="tag-btn" (click)="quickSearch('headphones')">Headphones</button>
          <button class="tag-btn" (click)="quickSearch('watch')">Watch</button>
          <button class="tag-btn" (click)="quickSearch('keyboard')">Keyboard</button>
        </div>
      </div>
      <div class="suggestion-card card">
        <h3>Shopping tips</h3>
        <ul class="tip-list">
          <li>Search by a short product keyword.</li>
          <li>Stock levels update whenever an order is placed.</li>
          <li>Administrators maintain the product catalog.</li>
        </ul>
      </div>
    </section>

    @if (loading) {
      <p class="status-text">Searching...</p>
    } @else if (results.length === 0 && hasSearched) {
      <p class="status-text">No products found. Try another keyword.</p>
    } @else if (results.length > 0) {
      <section class="product-grid">
        @for (product of results; track product.id) {
          <article class="product-card card">
            <img [src]="imageFor(product)" [alt]="product.title" loading="lazy" />
            <div class="product-meta">
              <span class="chip">{{ product.category ?? 'General' }}</span>
              <span class="rating">&#9733; {{ product.rating | number: '1.1-1' }}</span>
            </div>
            <h3>{{ product.title }}</h3>
            <p>{{ product.description }}</p>
            <div class="price-row">
              <strong>\${{ product.price }}</strong>
              <a [routerLink]="['/product', product.id]" class="primary-btn">View product</a>
            </div>
          </article>
        }
      </section>
    }
  `
})
export class SearchPageComponent {
  query = '';
  results: Product[] = [];
  loading = false;
  hasSearched = false;

  constructor(private productService: ProductService) {}

  runSearch(): void {
    this.loading = true;
    this.hasSearched = true;
    this.productService.searchProducts(this.query).subscribe({
      next: (products) => {
        this.results = products;
        this.loading = false;
      },
      error: () => {
        this.results = [];
        this.loading = false;
      }
    });
  }

  imageFor(product: Product): string {
    return product.thumbnail || product.images?.[0] || '';
  }

  quickSearch(value: string): void {
    this.query = value;
    this.runSearch();
  }
}
