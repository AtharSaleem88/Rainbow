import { inject, Injectable } from '@angular/core';
import { AuthService } from './auth.service';
import { LoyaltyService } from './loyalty.service';

export interface PaymentBreakdown {
  pointsUsed: number;
  loyaltyDiscount: number;
  walletApplied: number;
  payable: number;
  earningAmount: number;
}

// Calculate in paisa so partial payments cannot introduce rounding differences.
export function calculatePayment(total: number, wallet: number, points: number, useWallet: boolean, usePoints: boolean, valuePerPoint: number): PaymentBreakdown {
  const cents = (amount: number) => Number.isFinite(amount) && amount > 0 ? Math.round(amount * 100) : 0;
  const totalCents = cents(total);
  const pointValue = cents(valuePerPoint);
  const availablePoints = Number.isSafeInteger(points) && points > 0 ? points : 0;
  const pointsUsed = usePoints && pointValue > 0 ? Math.min(availablePoints, Math.floor(totalCents / pointValue)) : 0;
  const loyaltyCents = pointsUsed * pointValue;
  const remainder = totalCents - loyaltyCents;
  const walletCents = useWallet ? Math.min(cents(wallet), remainder) : 0;
  return { pointsUsed, loyaltyDiscount: loyaltyCents / 100, walletApplied: walletCents / 100, payable: (remainder - walletCents) / 100, earningAmount: remainder / 100 };
}

@Injectable({ providedIn: 'root' })
export class CheckoutPaymentService {
  private readonly authService = inject(AuthService);
  private readonly loyaltyService = inject(LoyaltyService);
  private readonly settledOrders = new Set<string>();

  quote(total: number, useWallet: boolean, usePoints: boolean): PaymentBreakdown {
    return calculatePayment(total, this.authService.walletBalance(), this.loyaltyService.balance(),
      useWallet && this.authService.isLoggedIn(), usePoints && this.loyaltyService.isMember(), this.loyaltyService.valuePerPoint);
  }

  settle(orderId: string, total: number, useWallet: boolean, usePoints: boolean): PaymentBreakdown | null {
    const key = JSON.stringify([this.authService.userProfile().email.trim().toLowerCase(), orderId]);
    if (!orderId.trim() || !Number.isFinite(total) || total <= 0 || this.settledOrders.has(key)) return null;
    const payment = this.quote(total, useWallet, usePoints);
    if (payment.pointsUsed > 0 && !this.loyaltyService.redeemOrder(orderId, payment.pointsUsed)) return null;
    if (payment.walletApplied > 0) {
      this.authService.walletBalance.update(balance => Math.round((balance - payment.walletApplied) * 100) / 100);
    }
    this.settledOrders.add(key);
    return payment;
  }
}
