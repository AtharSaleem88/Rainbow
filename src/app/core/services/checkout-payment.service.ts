import { inject, Injectable } from '@angular/core';
import { AuthService, normalizePhone } from './auth.service';
import { LoyaltyService } from './loyalty.service';

export interface PaymentBreakdown {
  tipAmount: number;
  pointsUsed: number;
  loyaltyDiscount: number;
  walletApplied: number;
  payable: number;
  earningAmount: number;
}

// Demo promotion; first-order eligibility is not verified by a backend.
export function promoDiscount(total: number, code: string): number {
  if (code.trim().toUpperCase() !== 'RAINBOW10' || !Number.isFinite(total) || total <= 0) return 0;
  return Math.round(Math.round(total * 100) * 0.1) / 100;
}

// Calculate in paisa so partial payments cannot introduce rounding differences.
export function calculatePayment(total: number, wallet: number, points: number, useWallet: boolean, usePoints: boolean, valuePerPoint: number, tipAmount = 0): PaymentBreakdown {
  const cents = (amount: number) => Number.isFinite(amount) && amount > 0 ? Math.round(amount * 100) : 0;
  const totalCents = cents(total);
  const pointValue = cents(valuePerPoint);
  const availablePoints = Number.isSafeInteger(points) && points > 0 ? points : 0;
  const pointsUsed = usePoints && pointValue > 0 ? Math.min(availablePoints, Math.floor(totalCents / pointValue)) : 0;
  const loyaltyCents = pointsUsed * pointValue;
  const remainder = totalCents - loyaltyCents;
  const tipCents = cents(tipAmount);
  const walletCents = useWallet ? Math.min(cents(wallet), remainder + tipCents) : 0;
  return { tipAmount: tipCents / 100, pointsUsed, loyaltyDiscount: loyaltyCents / 100, walletApplied: walletCents / 100, payable: (remainder + tipCents - walletCents) / 100, earningAmount: remainder / 100 };
}

@Injectable({ providedIn: 'root' })
export class CheckoutPaymentService {
  private readonly authService = inject(AuthService);
  private readonly loyaltyService = inject(LoyaltyService);
  private readonly settledOrders = new Set<string>();

  quote(total: number, useWallet: boolean, usePoints: boolean, tipAmount = 0): PaymentBreakdown {
    return calculatePayment(total, this.authService.walletBalance(), this.loyaltyService.balance(),
      useWallet && this.authService.isLoggedIn(), usePoints && this.loyaltyService.isMember(), this.loyaltyService.valuePerPoint, tipAmount);
  }

  settle(orderId: string, total: number, useWallet: boolean, usePoints: boolean, tipAmount = 0): PaymentBreakdown | null {
    const key = JSON.stringify([normalizePhone(this.authService.userProfile().phone) || 'guest', orderId]);
    if (!orderId.trim() || !Number.isFinite(total) || total <= 0 || !Number.isFinite(tipAmount) || tipAmount < 0 || this.settledOrders.has(key)) return null;
    const payment = this.quote(total, useWallet, usePoints, tipAmount);
    if (payment.pointsUsed > 0 && !this.loyaltyService.redeemOrder(orderId, payment.pointsUsed)) return null;
    if (payment.walletApplied > 0) {
      this.authService.debitWallet(payment.walletApplied);
    }
    this.settledOrders.add(key);
    return payment;
  }
}
