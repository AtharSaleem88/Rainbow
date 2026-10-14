import { computed, inject, Injectable, signal } from '@angular/core';
import { AuthService } from './auth.service';
import { CartService } from './cart.service';

export interface LoyaltyTransaction {
  email: string;
  orderId: string;
  date: string;
  totalAmount: number;
  points: number;
  type?: 'earned' | 'redeemed';
}

@Injectable({ providedIn: 'root' })
export class LoyaltyService {
  private readonly authService = inject(AuthService);
  private readonly cartService = inject(CartService);
  private readonly storageKey = 'rainbow-loyalty-v1';
  readonly spendPerPoint = 100;
  readonly valuePerPoint = 1;
  private readonly transactions = signal<LoyaltyTransaction[]>(this.readTransactions());
  readonly isMember = computed(() => this.authService.isLoggedIn() && !!this.memberEmail());
  readonly history = computed(() => this.isMember()
    ? this.transactions().filter(entry => entry.email === this.memberEmail())
    : []);
  readonly balance = computed(() => this.history().reduce((sum, entry) => sum + entry.points, 0));
  readonly cartPoints = computed(() => this.isMember() ? this.pointsForAmount(this.cartService.cartTotal()) : 0);

  pointsForAmount(amount: number): number {
    return Number.isFinite(amount) && amount > 0 ? Math.floor(amount / this.spendPerPoint) : 0;
  }

  creditOrder(orderId: string, totalAmount: number): number {
    if (!this.isMember() || !orderId.trim()) return 0;
    const email = this.memberEmail();
    if (this.transactions().some(entry => entry.email === email && entry.orderId === orderId && entry.type !== 'redeemed')) return 0;
    const points = this.pointsForAmount(totalAmount);
    if (points === 0) return 0;
    this.transactions.update(entries => [{ email, orderId, totalAmount, points, type: 'earned', date: new Date().toISOString() }, ...entries]);
    this.saveTransactions();
    return points;
  }

  redeemOrder(orderId: string, points: number): boolean {
    if (!this.isMember() || !orderId.trim() || !Number.isSafeInteger(points) || points <= 0 || points > this.balance()) return false;
    const email = this.memberEmail();
    if (this.transactions().some(entry => entry.email === email && entry.orderId === orderId && entry.type === 'redeemed')) return false;
    this.transactions.update(entries => [{ email, orderId, totalAmount: points * this.valuePerPoint, points: -points, type: 'redeemed', date: new Date().toISOString() }, ...entries]);
    this.saveTransactions();
    return true;
  }

  private saveTransactions() {
    try {
      localStorage.setItem(this.storageKey, JSON.stringify(this.transactions()));
    } catch {
      // Keep points available for this session when browser storage is unavailable.
    }
  }

  private memberEmail(): string {
    return this.authService.userProfile().email.trim().toLowerCase();
  }

  private readTransactions(): LoyaltyTransaction[] {
    try {
      const stored: unknown = JSON.parse(localStorage.getItem(this.storageKey) ?? '[]');
      if (!Array.isArray(stored)) return [];
      const seen = new Set<string>();
      return stored.filter((entry): entry is LoyaltyTransaction => {
        if (!entry || typeof entry.email !== 'string' || !entry.email.trim()
          || typeof entry.orderId !== 'string' || !entry.orderId.trim()
          || typeof entry.date !== 'string' || !Number.isFinite(Date.parse(entry.date))
          || !Number.isFinite(entry.totalAmount) || !Number.isSafeInteger(entry.points)
          || entry.totalAmount <= 0
          || (entry.type !== undefined && entry.type !== 'earned' && entry.type !== 'redeemed')) return false;
        if (entry.type === 'redeemed'
          ? entry.points >= 0 || entry.totalAmount !== -entry.points * this.valuePerPoint
          : entry.points <= 0 || entry.points !== this.pointsForAmount(entry.totalAmount)) return false;
        const key = JSON.stringify([entry.email, entry.orderId, entry.type === 'redeemed' ? 'redeemed' : 'earned']);
        if (seen.has(key)) return false;
        seen.add(key);
        return true;
      });
    } catch {
      return [];
    }
  }
}
