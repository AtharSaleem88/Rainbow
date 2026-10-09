import { Component, computed, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule, Router } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { CartService } from '../../core/services/cart.service';
import { AuthService, SavedAddress, SavedCard } from '../../core/services/auth.service';

@Component({
  selector: 'app-checkout',
  standalone: true,
  imports: [CommonModule, RouterModule, FormsModule],
  templateUrl: './checkout.component.html',
  styleUrls: ['./checkout.component.scss']
})
export class CheckoutComponent {
  readonly cartService = inject(CartService);
  readonly authService = inject(AuthService);
  readonly router = inject(Router);

  readonly currentStep = signal<1 | 2 | 3>(1);

  // Form Fields
  billingData = {
    firstName: 'Muhammad',
    lastName: 'Athar',
    email: 'athar.saleem@example.com',
    phone: '+92 300 1234567',
    address: 'House #42, Block C, Bahria Town',
    city: 'Lahore',
    branch: 'Bahria Town Branch (Lahore)',
    notes: ''
  };

  selectedAddressId = signal<string | null>(null);
  selectedSavedCardId = signal<string | null>(null);

  selectedPaymentMethod = 'cod';
  walletAccountPhone = '';
  readonly isOrderPlaced = signal<boolean>(false);
  readonly isMobileSummaryOpen = signal<boolean>(false);
  readonly generatedOrderNumber = signal<string>('RH-' + Math.floor(100000 + Math.random() * 900000));
  
  // Checkout Items Snapshot
  readonly checkoutItems = signal<Array<any>>([]);
  readonly checkoutTotal = signal<number>(0);
  readonly checkoutSavings = signal<number>(0);
  readonly checkoutOriginalTotal = signal<number>(0);

  constructor() {
    this.syncCartSnapshot();
    const defaultAddr = this.authService.savedAddresses().find(a => a.isDefault);
    if (defaultAddr) {
      this.selectSavedAddress(defaultAddr);
    }
    const defaultCard = this.authService.savedCards().find(c => c.isDefault);
    if (defaultCard) {
      this.selectedSavedCardId.set(defaultCard.id);
    }
  }

  selectSavedAddress(addr: SavedAddress) {
    this.selectedAddressId.set(addr.id);
    const names = addr.recipientName.split(' ');
    this.billingData.firstName = names[0] || '';
    this.billingData.lastName = names.slice(1).join(' ') || '';
    this.billingData.phone = addr.phone;
    this.billingData.address = addr.addressLine;
    this.billingData.city = addr.city;
  }

  syncCartSnapshot() {
    const items = this.cartService.cartItems();
    this.checkoutItems.set([...items]);
    
    const currentCartTotal = this.cartService.cartTotal();
    this.checkoutTotal.set(currentCartTotal);

    const origTotal = items.reduce((total, item) => {
      const price = item.variant?.price ?? item.product.price;
      const originalPrice = Math.max(item.variant?.oldPrice ?? item.product.oldPrice ?? price, price);
      return total + originalPrice * item.quantity;
    }, 0);
    this.checkoutOriginalTotal.set(origTotal);
    this.checkoutSavings.set(Math.max(0, origTotal - currentCartTotal));
  }

  nextStep() {
    if (this.currentStep() === 1) {
      this.currentStep.set(2);
    } else if (this.currentStep() === 2) {
      this.placeOrder();
    }
  }

  prevStep() {
    if (this.currentStep() > 1) {
      this.currentStep.update(s => (s - 1) as any);
    }
  }

  placeOrder() {
    this.isOrderPlaced.set(true);
    this.currentStep.set(3);
    this.cartService.clearCart();
  }

  trackByCartItem = (_index: number, item: any): string => `${item.product?.id}:${item.variant?.id ?? 'default'}`;
}
