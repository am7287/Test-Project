import { Injectable } from '@angular/core';
import { BehaviorSubject } from 'rxjs';

import { Product } from './product.model';

export interface CartItem {
  product: Product;
  quantity: number;
}

@Injectable({ providedIn: 'root' })
export class CartService {
  private readonly storageKey = 'smartcart-cart';
  private readonly itemsSubject = new BehaviorSubject<CartItem[]>(this.load());

  readonly items$ = this.itemsSubject.asObservable();

  addToCart(product: Product, quantity = 1): void {
    const items = [...this.itemsSubject.value];
    const existing = items.find((item) => item.product.id === product.id);

    if (existing) {
      existing.quantity += quantity;
    } else {
      items.push({ product, quantity });
    }

    this.save(items);
  }

  updateQuantity(productId: number, quantity: number): void {
    const items = this.itemsSubject.value
      .map((item) =>
        item.product.id === productId ? { ...item, quantity } : item
      )
      .filter((item) => item.quantity > 0);
    this.save(items);
  }

  remove(productId: number): void {
    const items = this.itemsSubject.value.filter((item) => item.product.id !== productId);
    this.save(items);
  }

  clear(): void {
    this.save([]);
  }

  getTotal(items: CartItem[]): number {
    return items.reduce((sum, item) => sum + item.product.price * item.quantity, 0);
  }

  private save(items: CartItem[]): void {
    localStorage.setItem(this.storageKey, JSON.stringify(items));
    this.itemsSubject.next(items);
  }

  private load(): CartItem[] {
    const raw = localStorage.getItem(this.storageKey);
    if (!raw) {
      return [];
    }
    try {
      return JSON.parse(raw) as CartItem[];
    } catch {
      return [];
    }
  }
}
