import { CommonModule } from '@angular/common';
import { Component, OnInit } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { RouterLink } from '@angular/router';

import { Product } from '../core/product.model';
import { ProductService } from '../core/product.service';

@Component({
  selector: 'app-product-list-page',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterLink],
  template: `
    <section class="hero">
      <div>
        <span class="chip">SmartCart catalog</span>
        <span class="chip secondary-chip">Product list</span>
        <h1>Shop the everyday essentials</h1>
        <p>Browse inventory managed by the SmartCart product microservice.</p>
      </div>
    </section>

    <section class="promo-row">
      <div class="promo-card promo-sunrise">
        <span class="promo-label">Fresh finds</span>
        <h3>Trending essentials</h3>
        <p>Curated picks with the best ratings this week.</p>
      </div>
      <div class="promo-card promo-lime">
        <span class="promo-label">Daily deal</span>
        <h3>Extra savings</h3>
        <p>Limited stock offers across top categories.</p>
      </div>
      <div class="promo-card promo-sky">
        <span class="promo-label">Fast delivery</span>
        <h3>48-hour dispatch</h3>
        <p>Most items ship within two business days.</p>
      </div>
    </section>

    <section class="filters card">
      <input
        type="text"
        placeholder="Search in this list..."
        [(ngModel)]="searchTerm"
      />
      <select [(ngModel)]="selectedCategory">
        @for (category of categories; track category) {
          <option [value]="category">{{ category === 'All' ? 'All' : formatCategory(category) }}</option>
        }
      </select>
    </section>

    @if (loading) {
      <p class="status-text">Loading products...</p>
    } @else if (error) {
      <p class="status-text error-text">Unable to load products. Please try again.</p>
    } @else {
      <section class="product-grid">
        @for (product of filteredProducts(); track product.id) {
          <article class="product-card card">
            <img [src]="imageFor(product)" [alt]="product.title" loading="lazy" />
            <div class="product-meta">
              <span class="chip">{{ formatCategory(product.category) }}</span>
              <span class="rating">&#9733; {{ product.rating | number: '1.1-1' }}</span>
            </div>
            <h3>{{ product.title }}</h3>
            <p>{{ product.description }}</p>
            <div class="price-row">
              <div class="meta-lines">
                <span><strong>Price:</strong> \${{ product.price }}</span>
                <span><strong>Stock:</strong> {{ product.stock }}</span>
                <span><strong>Rating:</strong> {{ product.rating | number: '1.1-1' }}</span>
              </div>
              <a [routerLink]="['/product', product.id]" class="primary-btn">View product</a>
            </div>
          </article>
        }
      </section>
    }
  `
})
export class ProductListPageComponent implements OnInit {
  products: Product[] = [];
  categories: string[] = ['All'];
  selectedCategory = 'All';
  searchTerm = '';
  loading = true;
  error = false;

  constructor(private productService: ProductService) {}

  ngOnInit(): void {
    this.productService.getProducts(0).subscribe({
      next: (products) => {
        this.products = this.pickTopByCategory(products, 6);
        const uniqueCategories = Array.from(
          new Set(this.products.map((product) => product.category ?? 'General'))
        );
        this.categories = ['All', ...uniqueCategories];
        this.loading = false;
      },
      error: () => {
        this.error = true;
        this.loading = false;
      }
    });
  }

  filteredProducts(): Product[] {
    return this.products.filter((product) => {
      const matchesSearch = this.searchTerm
        ? product.title.toLowerCase().includes(this.searchTerm.toLowerCase())
        : true;
      const matchesCategory =
        this.selectedCategory === 'All' || product.category === this.selectedCategory;
      return matchesSearch && matchesCategory;
    });
  }

  imageFor(product: Product): string {
    return product.thumbnail || product.images?.[0] || '';
  }

  formatCategory(category?: string): string {
    const value = (category ?? 'General').replace(/-/g, ' ');
    return value
      .split(' ')
      .map((word) => (word ? word[0].toUpperCase() + word.slice(1) : ''))
      .join(' ');
  }

  private pickTopByCategory(products: Product[], perCategory: number): Product[] {
    const grouped = new Map<string, Product[]>();

    products.forEach((product) => {
      const key = product.category ?? 'General';
      if (!grouped.has(key)) {
        grouped.set(key, []);
      }
      grouped.get(key)!.push(product);
    });

    const selected: Product[] = [];
    grouped.forEach((items) => {
      const sorted = [...items].sort((a, b) => (b.rating ?? 0) - (a.rating ?? 0));
      sorted.sort((a, b) => {
        const ratingDelta = (b.rating ?? 0) - (a.rating ?? 0);
        if (ratingDelta !== 0) {
          return ratingDelta;
        }
        return this.reviewCountFor(b) - this.reviewCountFor(a);
      });
      selected.push(...sorted.slice(0, perCategory));
    });

    return selected;
  }

  private reviewCountFor(product: Product): number {
    return (product.id % 50) + 10;
  }
}
