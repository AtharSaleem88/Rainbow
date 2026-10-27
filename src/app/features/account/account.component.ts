import { Component, computed, inject, signal, ElementRef, ViewChild, OnInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule, Router } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { AuthService, ReturnRequest, SavedAddress, SavedCard, UserOrder } from '../../core/services/auth.service';
import { CartService } from '../../core/services/cart.service';
import { ProductService } from '../../core/services/product.service';
import { Product } from '../../core/models/product.model';
import { LoyaltyService } from '../../core/services/loyalty.service';
import { SeoService } from '../../core/services/seo.service';
import { AddressModalComponent } from './components/address-modal/address-modal.component';
import { CardModalComponent } from './components/card-modal/card-modal.component';
import { ReturnModalComponent } from './components/return-modal/return-modal.component';
import { ReviewModalComponent } from './components/review-modal/review-modal.component';

@Component({
  selector: 'app-account',
  standalone: true,
  imports: [CommonModule, RouterModule, FormsModule, AddressModalComponent, CardModalComponent, ReturnModalComponent, ReviewModalComponent],
  templateUrl: './account.component.html',
  styleUrls: ['./account.component.scss']
})
export class AccountComponent implements OnInit, OnDestroy {
  readonly authService = inject(AuthService);
  readonly cartService = inject(CartService);
  readonly productService = inject(ProductService);
  readonly loyaltyService = inject(LoyaltyService);
  readonly seoService = inject(SeoService);
  readonly router = inject(Router);

  @ViewChild('accountMainContent') accountMainContent?: ElementRef<HTMLElement>;

  activeTab = signal<'orders' | 'wallet' | 'loyalty' | 'addresses' | 'cards' | 'settings' | 'returns'>('orders');
  expandedOrder = signal<{ id: string; view: 'details' | 'track' } | null>(null);
  selectedReturnDetails = signal<ReturnRequest | null>(null);
  selectedReviewOrder = signal<UserOrder | null>(null);
  reviewToast = signal<string | null>(null);
  private reviewToastTimer: ReturnType<typeof setTimeout> | null = null;
  readonly orderStatusOptions = ['All', 'In Transit', 'Delivered', 'Cancelled'] as const;
  readonly orderStatusFilter = signal<(typeof this.orderStatusOptions)[number]>('All');
  readonly filteredOrders = computed(() => this.orderStatusFilter() === 'All'
    ? this.authService.orders()
    : this.authService.orders().filter(order => order.status === this.orderStatusFilter()));

  // New Address Modal State
  isAddressModalOpen = signal<boolean>(false);

  // New Card Modal State
  isCardModalOpen = signal<boolean>(false);

  // Wallet Top-up state
  topUpAmount = signal<number>(1000);
  selectedTopUpMethod = signal<'jazzcash' | 'easypaisa' | 'card'>('jazzcash');

  // Profile Form Data
  profileForm = { ...this.authService.userProfile() };

  // New Return Modal State
  isReturnModalOpen = signal<boolean>(false);
  returnForm: { orderId: string; orderDate: string; items: UserOrder['items']; returnedItemTitles: string[] } = {
    orderId: '',
    orderDate: '',
    items: [],
    returnedItemTitles: []
  };

  ngOnInit(): void {
    this.seoService.setPageTitle('My Account');
    this.seoService.setMetaDescription('Manage your Rainbow Cash & Carry account, orders, addresses, loyalty points and wallet.');
  }

  ngOnDestroy(): void {
    if (this.reviewToastTimer) clearTimeout(this.reviewToastTimer);
  }

  setActiveTab(tab: 'orders' | 'wallet' | 'loyalty' | 'addresses' | 'cards' | 'settings' | 'returns') {
    this.activeTab.set(tab);
    if (window.innerWidth < 992 && this.accountMainContent?.nativeElement) {
      setTimeout(() => {
        this.accountMainContent?.nativeElement.scrollIntoView({ behavior: 'smooth', block: 'start' });
      }, 50);
    }
  }

  // Address Handlers
  openAddressModal() {
    this.isAddressModalOpen.set(true);
  }

  closeAddressModal() {
    this.isAddressModalOpen.set(false);
  }

  submitAddress(data: Omit<SavedAddress, 'id'>) {
    this.authService.addAddress(data);
    this.closeAddressModal();
  }

  deleteAddress(id: string) {
    this.authService.deleteAddress(id);
  }

  setDefaultAddress(id: string) {
    this.authService.setDefaultAddress(id);
  }

  // Card Handlers
  openCardModal() {
    this.isCardModalOpen.set(true);
  }

  closeCardModal() {
    this.isCardModalOpen.set(false);
  }

  submitCard(data: { cardHolder: string; rawCardNumber: string; expiryDate: string; brand: 'visa' | 'mastercard' | 'unionpay'; isDefault: boolean }) {
    this.authService.addCard(data);
    this.closeCardModal();
  }

  deleteCard(id: string) {
    this.authService.deleteCard(id);
  }

  setDefaultCard(id: string) {
    this.authService.setDefaultCard(id);
  }

  onSaveProfile() {
    this.authService.updateProfile(this.profileForm);
    alert('Account settings updated successfully!');
  }

  onTopUpWallet() {
    if (this.topUpAmount() > 0) {
      this.authService.topUpWallet(this.topUpAmount());
      alert(`Rs. ${this.topUpAmount()} added to your Rainbow Wallet!`);
    }
  }

  openReturnModal(order: UserOrder) {
    this.returnForm = {
      orderId: order.id,
      orderDate: order.date,
      items: [...order.items],
      returnedItemTitles: this.authService.returns()
        .filter(request => request.orderId === order.id)
        .flatMap(request => request.items.map(item => item.itemTitle.trim().toLowerCase()))
    };
    this.isReturnModalOpen.set(true);
  }

  canRequestReturn(order: UserOrder): boolean {
    const orderedAt = new Date(order.date).getTime();
    if (!Number.isFinite(orderedAt)) return false;

    const alreadyReturned = new Set(
      this.authService.returns()
        .filter(request => request.orderId === order.id)
        .flatMap(request => request.items.map(item => item.itemTitle.trim().toLowerCase()))
    );

    return order.items.some(item => {
      const title = item.title.trim().toLowerCase();
      const windowHours = item.categorySlug?.toLowerCase() === 'ultra-fresh' ? 24 : 72;
      return !alreadyReturned.has(title) && Date.now() < orderedAt + windowHours * 60 * 60 * 1000;
    });
  }

  getOrderItemReturn(orderId: string, itemTitle: string): ReturnRequest | undefined {
    const title = itemTitle.trim().toLowerCase();
    return this.authService.returns().find(request =>
      request.orderId === orderId && request.items.some(item => item.itemTitle.trim().toLowerCase() === title)
    );
  }

  toggleOrderPanel(orderId: string, view: 'details' | 'track'): void {
    const current = this.expandedOrder();
    this.expandedOrder.set(current?.id === orderId && current.view === view ? null : { id: orderId, view });
  }

  showOrderDetails(order: UserOrder): void {
    const returnRequest = this.authService.returns().find(request => request.orderId === order.id);
    if (returnRequest) {
      this.selectedReturnDetails.set(returnRequest);
      return;
    }
    this.toggleOrderPanel(order.id, 'details');
  }

  closeReturnDetails(): void {
    this.selectedReturnDetails.set(null);
  }

  openReviewModal(order: UserOrder): void {
    if (order.status !== 'Delivered' || this.authService.getOrderReview(order.id)) return;
    this.selectedReviewOrder.set(order);
  }

  closeReviewModal(): void {
    this.selectedReviewOrder.set(null);
  }

  submitOrderReview(data: { rating: number; feedback: string }): void {
    const order = this.selectedReviewOrder();
    if (order && this.authService.submitOrderReview(order.id, data.rating, data.feedback)) {
      this.closeReviewModal();
      this.reviewToast.set('Review saved. Thank you for your feedback!');
      if (this.reviewToastTimer) clearTimeout(this.reviewToastTimer);
      this.reviewToastTimer = setTimeout(() => this.reviewToast.set(null), 4000);
    }
  }

  dismissReviewToast(): void {
    if (this.reviewToastTimer) clearTimeout(this.reviewToastTimer);
    this.reviewToastTimer = null;
    this.reviewToast.set(null);
  }

  reorder(order: UserOrder): void {
    const catalog = this.productService.getProducts();
    const orderNumber = Number(order.id.replace(/\D/g, '')) || 0;
    order.items.forEach((item, index) => {
      const product = catalog.find(candidate => candidate.title.toLowerCase() === item.title.toLowerCase())
        ?? {
          id: -(orderNumber * 100 + index + 1),
          title: item.title,
          category: 'Grocery',
          categorySlug: item.categorySlug ?? 'grocery',
          brand: 'Rainbow',
          price: item.price,
          rating: 0,
          reviewCount: 0,
          image: item.image,
          inStock: true
        } satisfies Product;
      this.cartService.addToCart(product, item.quantity);
    });
    this.router.navigate(['/cart']);
  }

  closeReturnModal() {
    this.isReturnModalOpen.set(false);
  }

  submitReturnRequest(data: { orderId: string; items: Array<UserOrder['items'][number] & { reason: string }> }) {
    this.authService.requestReturn(data.orderId, data.items.map(item => ({
      itemTitle: item.title,
      reason: item.reason,
      refundAmount: item.price * item.quantity
    })));
    this.closeReturnModal();
    this.setActiveTab('returns');
  }

  onLogout() {
    this.authService.logout();
    this.router.navigate(['/login']);
  }
}
