import { Injectable, signal } from '@angular/core';

@Injectable({ providedIn: 'root' })
export class WishlistService {
  private readonly storageKey = 'rainbow-demo-wishlist-v1';
  readonly productIds = signal<number[]>(this.read());

  has(id: number): boolean { return this.productIds().includes(id); }
  clear(): void {
    this.productIds.set([]);
    try { localStorage.setItem(this.storageKey, '[]'); } catch { /* Keep the current session usable. */ }
  }
  toggle(id: number): boolean {
    const added = !this.has(id);
    this.productIds.update(ids => added ? [...ids, id] : ids.filter(item => item !== id));
    try { localStorage.setItem(this.storageKey, JSON.stringify(this.productIds())); } catch { /* Keep the current session usable. */ }
    return added;
  }
  private read(): number[] {
    try {
      const value: unknown = JSON.parse(localStorage.getItem(this.storageKey) ?? '[]');
      if (Array.isArray(value) && localStorage.getItem(this.storageKey) !== null) {
        return [...new Set(value.filter((id): id is number => Number.isSafeInteger(id) && id > 0))];
      }
      return [801, 802, 803, 804, 805, 806, 807, 808, 101, 102, 103, 105];
    } catch {
      return [801, 802, 803, 804, 805, 806, 807, 808, 101, 102, 103, 105];
    }
  }
}
