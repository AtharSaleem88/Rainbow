import { Component, computed, effect, inject, signal, OnInit, ElementRef, HostListener, ViewChild } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule, Router } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { CartService } from '../../core/services/cart.service';
import { LoyaltyService } from '../../core/services/loyalty.service';
import { CheckoutPaymentService, PaymentBreakdown } from '../../core/services/checkout-payment.service';
import { AuthService, SavedAddress, SavedCard } from '../../core/services/auth.service';
import { SeoService } from '../../core/services/seo.service';
import { APP_CONFIG } from '../../core/core.config';
import { CheckoutStepperComponent } from './components/checkout-stepper/checkout-stepper.component';
import { CheckoutSummaryComponent } from './components/checkout-summary/checkout-summary.component';

@Component({
  selector: 'app-checkout',
  standalone: true,
  imports: [CommonModule, RouterModule, FormsModule, CheckoutStepperComponent, CheckoutSummaryComponent],
  templateUrl: './checkout.component.html',
  styleUrls: ['./checkout.component.scss']
})
export class CheckoutComponent implements OnInit {
  @ViewChild('branchControl') branchControl?: ElementRef<HTMLElement>;

  readonly branches = APP_CONFIG.branches;
  branchMenuOpen = false;

  readonly cartService = inject(CartService);
  readonly loyaltyService = inject(LoyaltyService);
  readonly authService = inject(AuthService);
  readonly router = inject(Router);
  private readonly paymentService = inject(CheckoutPaymentService);
  private readonly seoService = inject(SeoService);

  readonly earnedLoyaltyPoints = signal(0);
  readonly useWallet = signal(false);
  readonly useLoyaltyPoints = signal(false);
  readonly tipOptions = [0, 50, 100, 200, 300];
  readonly tipAmount = signal(0);
  readonly saveTipPreference = signal(false);
  readonly paymentError = signal('');
  readonly completedPayment = signal<PaymentBreakdown | null>(null);
  readonly payment = computed(() => this.completedPayment() ?? this.paymentService.quote(this.cartService.cartTotal(), this.useWallet(), this.useLoyaltyPoints(), this.tipAmount()));
  readonly pointsToEarn = computed(() => this.loyaltyService.isMember() ? this.loyaltyService.pointsForAmount(this.payment().earningAmount) : 0);

  readonly currentStep = signal<1 | 2 | 3>(1);

  // Delivery Schedule State for Checkout
  readonly isScheduleModalOpen = signal(false);
  readonly selectedDate = signal<string>('Today');
  readonly selectedTimeSlot = signal<string>('2:00pm - 4:00pm');
  readonly availableDates = [
    { label: 'Today', value: 'Today', dateStr: 'Today, Oct 8' },
    { label: 'Tomorrow', value: 'Tomorrow', dateStr: 'Tomorrow, Oct 9' },
    { label: 'Friday', value: 'Friday', dateStr: 'Friday, Oct 10' }
  ];
  readonly availableTimeSlots = [
    '10:00am - 12:00pm',
    '12:00pm - 2:00pm',
    '2:00pm - 4:00pm',
    '4:00pm - 6:00pm',
    '6:00pm - 8:00pm'
  ];

  selectInstantDelivery() {
    this.cartService.setDeliveryType('instant');
  }

  selectScheduledDelivery() {
    this.cartService.setDeliveryType('scheduled');
    this.openScheduleModal();
  }

  openScheduleModal() {
    this.selectedDate.set(this.cartService.selectedDeliveryDate());
    this.selectedTimeSlot.set(this.cartService.selectedDeliveryTimeSlot());
    this.isScheduleModalOpen.set(true);
  }

  closeScheduleModal() {
    this.isScheduleModalOpen.set(false);
  }

  confirmSchedule() {
    this.cartService.setScheduledDelivery(this.selectedDate(), this.selectedTimeSlot());
    this.closeScheduleModal();
  }

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
  jazzCashPhone = '';
  easypaisaPhone = '';
  cardDetails = { holder: '', number: '', expiry: '', cvv: '' };
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
    effect(() => {
      const key = this.tipPreferenceKey();
      try {
        const stored: unknown = JSON.parse(localStorage.getItem(key) ?? 'null');
        const valid = typeof stored === 'number' && this.tipOptions.includes(stored);
        this.tipAmount.set(valid ? stored : 0);
        this.saveTipPreference.set(valid);
      } catch {
        this.tipAmount.set(0);
        this.saveTipPreference.set(false);
      }
    });
    effect(() => {
      if (!this.isOrderPlaced()) this.syncCartSnapshot();
    });
    const defaultAddr = this.authService.savedAddresses().find(a => a.isDefault);
    if (defaultAddr) {
      this.selectSavedAddress(defaultAddr);
    }
    const defaultCard = this.authService.savedCards().find(c => c.isDefault);
    if (defaultCard) {
      this.selectedSavedCardId.set(defaultCard.id);
    }
  }

  ngOnInit() {
    this.seoService.setPageTitle('Checkout');
    this.seoService.setMetaDescription('Secure checkout for your Rainbow Cash & Carry order.');
    this.scrollToTop();
    if (!this.cartService.deliveryType()) {
      this.cartService.setDeliveryType('instant');
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

  selectBranch(branch: string) {
    this.billingData.branch = branch;
    this.branchMenuOpen = false;
    this.branchControl?.nativeElement.querySelector('button')?.focus();
  }

  @HostListener('document:click', ['$event'])
  closeBranchMenuOnOutsideClick(event: MouseEvent) {
    if (this.branchMenuOpen && !this.branchControl?.nativeElement.contains(event.target as Node)) {
      this.branchMenuOpen = false;
    }
  }

  @HostListener('document:keydown.escape')
  closeBranchMenuOnEscape() {
    if (this.branchMenuOpen) {
      this.branchMenuOpen = false;
      this.branchControl?.nativeElement.querySelector('button')?.focus();
    }
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

  goToStep(step: 1 | 2) {
    this.currentStep.set(step);
    this.scrollToTop();
  }

  nextStep() {
    if (this.currentStep() === 1) {
      this.currentStep.set(2);
      this.scrollToTop();
    } else if (this.currentStep() === 2) {
      this.placeOrder();
    }
  }

  prevStep() {
    if (this.currentStep() > 1) {
      this.currentStep.update(s => (s - 1) as any);
      this.scrollToTop();
    }
  }

  selectTip(amount: number) {
    if (!this.tipOptions.includes(amount)) return;
    this.tipAmount.set(amount);
    this.persistTipPreference();
  }

  selectPaymentMethod(method: string): void {
    this.selectedPaymentMethod = method;
    this.paymentError.set('');
  }

  private validatePaymentDetails(): string {
    if (this.payment().payable <= 0 || this.selectedPaymentMethod === 'cod') return '';

    if (this.selectedPaymentMethod === 'jazzcash' || this.selectedPaymentMethod === 'easypaisa') {
      const number = (this.selectedPaymentMethod === 'jazzcash' ? this.jazzCashPhone : this.easypaisaPhone).replace(/\D/g, '');
      return /^(03\d{9}|923\d{9})$/.test(number) ? '' : 'Enter a valid 11-digit Pakistani mobile number for your selected wallet.';
    }

    if (this.selectedPaymentMethod === 'card') {
      const cardNumber = this.cardDetails.number.replace(/\D/g, '');
      if (!this.cardDetails.holder.trim()) return 'Enter the cardholder name.';
      if (!/^\d{13,19}$/.test(cardNumber)) return 'Enter a valid card number.';

      const expiry = /^(0[1-9]|1[0-2])\s*\/\s*(\d{2})$/.exec(this.cardDetails.expiry.trim());
      if (!expiry) return 'Enter the card expiry as MM/YY.';
      const now = new Date();
      const expiryYear = 2000 + Number(expiry[2]);
      const expiryMonth = Number(expiry[1]);
      if (expiryYear < now.getFullYear() || (expiryYear === now.getFullYear() && expiryMonth < now.getMonth() + 1)) {
        return 'Enter a card expiry date that has not passed.';
      }
      if (!/^\d{3,4}$/.test(this.cardDetails.cvv.trim())) return 'Enter a valid 3 or 4 digit security code.';
    }

    return '';
  }

  setSaveTipPreference(save: boolean) {
    this.saveTipPreference.set(save);
    this.persistTipPreference();
  }

  private tipPreferenceKey(): string {
    const member = this.authService.isLoggedIn() ? this.authService.userProfile().email.trim().toLowerCase() : 'guest';
    return `rainbow-rider-tip-v1:${member}`;
  }

  private persistTipPreference() {
    try {
      const key = this.tipPreferenceKey();
      if (this.saveTipPreference()) localStorage.setItem(key, JSON.stringify(this.tipAmount()));
      else localStorage.removeItem(key);
    } catch {
      // The current tip selection still works if browser storage is unavailable.
    }
  }

  placeOrder() {
    if (this.isOrderPlaced() || this.currentStep() !== 2 || this.cartService.cartItems().length === 0) return;
    const detailsError = this.validatePaymentDetails();
    if (detailsError) {
      this.paymentError.set(detailsError);
      return;
    }
    this.syncCartSnapshot();
    const payment = this.paymentService.settle(this.generatedOrderNumber(), this.checkoutTotal(), this.useWallet(), this.useLoyaltyPoints(), this.tipAmount());
    if (!payment) {
      this.paymentError.set('Unable to apply your balances. Please review your payment options and try again.');
      return;
    }
    this.completedPayment.set(payment);
    this.paymentError.set('');
    this.cardDetails = { holder: '', number: '', expiry: '', cvv: '' };
    this.earnedLoyaltyPoints.set(this.loyaltyService.creditOrder(this.generatedOrderNumber(), payment.earningAmount));
    this.isOrderPlaced.set(true);
    this.currentStep.set(3);
    this.cartService.clearCart();
    this.scrollToTop();
  }

  private scrollToTop() {
    if (typeof window === 'undefined') return;

    // 1. Defocus active input/button to prevent mobile browsers from anchoring scroll to focused element
    if (document.activeElement instanceof HTMLElement) {
      document.activeElement.blur();
    }

    // 2. Immediate synchronous reset
    window.scrollTo(0, 0);
    if (document.documentElement) document.documentElement.scrollTop = 0;
    if (document.body) document.body.scrollTop = 0;

    // 3. Post-render RAF scroll to ensure new step's top is in view
    requestAnimationFrame(() => {
      window.scrollTo(0, 0);
      const topEl = document.getElementById('checkout-top') || document.querySelector('.rainbow-checkout-header');
      if (topEl) {
        topEl.scrollIntoView({ behavior: 'auto', block: 'start' });
      }
    });

    // 4. Fallback timeout for mobile virtual keyboard dismissal / async layout stabilization
    setTimeout(() => {
      window.scrollTo(0, 0);
      if (document.documentElement) document.documentElement.scrollTop = 0;
      if (document.body) document.body.scrollTop = 0;
      const topEl = document.getElementById('checkout-top') || document.querySelector('.rainbow-checkout-header');
      if (topEl) {
        topEl.scrollIntoView({ behavior: 'auto', block: 'start' });
      }
    }, 60);
  }

  trackByCartItem = (_index: number, item: any): string => `${item.product?.id}:${item.variant?.id ?? 'default'}`;
}
