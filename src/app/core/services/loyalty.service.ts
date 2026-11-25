import { computed, inject, Injectable, signal } from '@angular/core';
import { AuthService, normalizePhone } from './auth.service';
import { CartService } from './cart.service';

export interface LoyaltyTransaction {
  phone?: string;
  /** Kept only to preserve legacy email-keyed demo records. */
  email?: string;
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
  readonly isMember = computed(() => this.authService.isLoggedIn() && !!this.memberPhone());
  readonly history = computed(() => this.isMember()
    ? this.transactions().filter(entry => entry.phone === this.memberPhone())
    : []);
  readonly balance = computed(() => this.history().reduce((sum, entry) => sum + entry.points, 0));
  readonly cartPoints = computed(() => this.isMember() ? this.pointsForAmount(this.cartService.cartTotal()) : 0);

  pointsForAmount(amount: number): number {
    return Number.isFinite(amount) && amount > 0 ? Math.floor(amount / this.spendPerPoint) : 0;
  }

  creditOrder(orderId: string, totalAmount: number): number {
    if (!this.isMember() || !orderId.trim()) return 0;
    const phone = this.memberPhone();
    if (this.transactions().some(entry => entry.phone === phone && entry.orderId === orderId && entry.type !== 'redeemed')) return 0;
    const points = this.pointsForAmount(totalAmount);
    if (points === 0) return 0;
    this.transactions.update(entries => [{ phone, orderId, totalAmount, points, type: 'earned', date: new Date().toISOString() }, ...entries]);
    this.saveTransactions();
    return points;
  }

  redeemOrder(orderId: string, points: number): boolean {
    if (!this.isMember() || !orderId.trim() || !Number.isSafeInteger(points) || points <= 0 || points > this.balance()) return false;
    const phone = this.memberPhone();
    if (this.transactions().some(entry => entry.phone === phone && entry.orderId === orderId && entry.type === 'redeemed')) return false;
    this.transactions.update(entries => [{ phone, orderId, totalAmount: points * this.valuePerPoint, points: -points, type: 'redeemed', date: new Date().toISOString() }, ...entries]);
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

  private memberPhone(): string {
    return normalizePhone(this.authService.userProfile().phone);
  }

  private readTransactions(): LoyaltyTransaction[] {
    try {
      const stored: unknown = JSON.parse(localStorage.getItem(this.storageKey) ?? '[]');
      if (Array.isArray(stored) && stored.length > 0) {
        const seen = new Set<string>();
        const valid = stored.filter((entry): entry is LoyaltyTransaction => {
          if (!entry || !(typeof entry.phone === 'string' && normalizePhone(entry.phone)) && !(typeof entry.email === 'string' && entry.email.trim())
            || typeof entry.orderId !== 'string' || !entry.orderId.trim()
            || typeof entry.date !== 'string' || !Number.isFinite(Date.parse(entry.date))
            || !Number.isFinite(entry.totalAmount) || !Number.isSafeInteger(entry.points)
            || entry.totalAmount <= 0
            || (entry.type !== undefined && entry.type !== 'earned' && entry.type !== 'redeemed')) return false;
          if (entry.type === 'redeemed'
            ? entry.points >= 0 || entry.totalAmount !== -entry.points * this.valuePerPoint
            : entry.points <= 0 || entry.points !== this.pointsForAmount(entry.totalAmount)) return false;
          if (entry.phone) entry.phone = normalizePhone(entry.phone);
          // Only the known preloaded demo account has a reliable legacy mapping.
          if (!entry.phone && entry.email?.trim().toLowerCase() === 'muhammad.athar@gmail.com') entry.phone = '923107779651';
          const key = JSON.stringify([entry.phone || entry.email?.trim().toLowerCase(), entry.orderId, entry.type === 'redeemed' ? 'redeemed' : 'earned']);
          if (seen.has(key)) return false;
          seen.add(key);
          return true;
        });
        if (valid.length > 0) return valid;
      }
      return [
        {
          phone: '923107779651',
          orderId: 'RH-98234',
          date: '2026-11-18T12:00:00.000Z',
          totalAmount: 12000,
          points: 1200,
          type: 'earned'
        }
      ];
    } catch {
      return [
        {
          phone: '923107779651',
          orderId: 'RH-98234',
          date: '2026-11-18T12:00:00.000Z',
          totalAmount: 12000,
          points: 1200,
          type: 'earned'
        }
      ];
    }
  }
}
