import { Component, computed, inject, signal, ElementRef, ViewChild, OnInit, OnDestroy, HostListener } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule, Router, ActivatedRoute } from '@angular/router';
import { Subscription } from 'rxjs';
import { FormsModule } from '@angular/forms';
import { AuthService, ReturnRequest, SavedAddress, SavedCard, UserOrder, normalizePhone } from '../../core/services/auth.service';
import { CartService } from '../../core/services/cart.service';
import { ProductService } from '../../core/services/product.service';
import { Product } from '../../core/models/product.model';
import { LoyaltyService } from '../../core/services/loyalty.service';
import { SeoService } from '../../core/services/seo.service';
import { AddressModalComponent } from './components/address-modal/address-modal.component';
import { CardModalComponent } from './components/card-modal/card-modal.component';
import { ReturnModalComponent } from './components/return-modal/return-modal.component';
import { ReviewModalComponent } from './components/review-modal/review-modal.component';
import { ChatAssistantComponent } from '../../shared/components/chat-assistant/chat-assistant.component';
import { WishlistService } from '../../core/services/wishlist.service';
import { AlternateModalService } from '../../core/services/alternate-modal.service';
import { OtpDialogComponent } from '../../shared/components/otp-dialog/otp-dialog.component';
import { ProductCardComponent } from '../../shared/components/product-card/product-card.component';
import { AlertService } from '../../core/services/alert.service';
import { ReceiptPdfService } from '../../core/services/receipt-pdf.service';

@Component({
  selector: 'app-account',
  standalone: true,
  imports: [CommonModule, RouterModule, FormsModule, AddressModalComponent, CardModalComponent, ReturnModalComponent, ReviewModalComponent, ChatAssistantComponent, OtpDialogComponent, ProductCardComponent],
  templateUrl: './account.component.html',
  styleUrls: ['./account.component.scss']
})
export class AccountComponent implements OnInit, OnDestroy {
  private readonly alerts = inject(AlertService);
  private readonly receiptPdf = inject(ReceiptPdfService);
  readonly jazzCashLinked = signal<boolean>(true);
  readonly easypaisaLinked = signal<boolean>(false);
  readonly codPreferred = signal<boolean>(false);
  toggleJazzCash(): void { this.jazzCashLinked.update(v => !v); }
  toggleEasypaisa(): void { this.easypaisaLinked.update(v => !v); }
  toggleCodPreferred(): void { this.codPreferred.update(v => !v); }
  
  readonly authService = inject(AuthService);
  readonly cartService = inject(CartService);
  readonly productService = inject(ProductService);
  readonly loyaltyService = inject(LoyaltyService);
  readonly seoService = inject(SeoService);
  readonly router = inject(Router);
  readonly wishlistService = inject(WishlistService);
  readonly alternateModalService = inject(AlternateModalService);
  private readonly route = inject(ActivatedRoute);
  private routeSubscription?: Subscription;

  @ViewChild('accountMainContent') accountMainContent?: ElementRef<HTMLElement>;

  activeTab = signal<'orders' | 'wishlist' | 'wallet' | 'loyalty' | 'addresses' | 'cards' | 'settings' | 'returns' | 'assistant'>('orders');
  readonly accountMenuOpen = signal(false);
  toggleAccountMenu(): void {
    this.accountMenuOpen.update(open => !open);
  }
  readonly activeSectionLabel = computed(() => ({
    orders: 'Orders & Returns', returns: 'Orders & Returns', wishlist: 'Wishlist & Buy Again',
    wallet: 'Wallet & Loyalty', loyalty: 'Wallet & Loyalty', addresses: 'Addresses',
    cards: 'Payment Methods', settings: 'Profile & Settings', assistant: 'Rainbow Assistant'
  })[this.activeTab()]);
  readonly shoppingView = signal<'wishlist' | 'buy-again'>('wishlist');
  readonly shoppingFilter = signal<'all' | 'in-stock' | 'discounted'>('all');
  readonly wishlistProducts = computed(() => this.productService.getProducts().filter(product => this.wishlistService.has(product.id)));
  readonly buyAgainProducts = computed(() => {
    const titles = this.authService.orders().flatMap(order => order.items.map(item => item.title.trim().toLowerCase()));
    return this.productService.getProducts().filter(product => titles.some(title => product.title.toLowerCase() === title || product.title.toLowerCase().includes(title)));
  });
  readonly shoppingProducts = computed(() => {
    const products = this.shoppingView() === 'wishlist' ? this.wishlistProducts() : this.buyAgainProducts();
    if (this.shoppingFilter() === 'in-stock') return products.filter(product => product.inStock);
    if (this.shoppingFilter() === 'discounted') return products.filter(product => !!product.oldPrice && product.oldPrice > product.price);
    return products;
  });
  expandedOrder = signal<{ id: string; view: 'details' | 'track' } | null>(null);
  selectedReturnDetails = signal<ReturnRequest | null>(null);
  readonly returnOrderPickerOpen = signal(false);
  readonly returnableOrders = computed(() => this.authService.orders().filter(order => order.status === 'Delivered' && this.canRequestReturn(order)));
  selectedReviewOrder = signal<UserOrder | null>(null);
  reviewToast = signal<string | null>(null);
  private reviewToastTimer: ReturnType<typeof setTimeout> | null = null;
  readonly orderView = signal<'active' | 'past' | 'returns'>('active');
  readonly pastOrderTimeRange = signal<'Last 30 Days' | 'Last 3 Months' | '2026' | 'All'>('Last 30 Days');
  readonly pastOrderStatus = signal<'All Status' | 'Delivered' | 'Cancelled'>('All Status');
  readonly activeOrdersCount = computed(() => this.authService.orders().filter(o => o.status === 'In Transit' || o.status === 'Processing').length);
  readonly liveActiveOrder = computed(() => this.authService.orders().find(o => o.status === 'In Transit' || o.status === 'Processing') ?? null);
  readonly orderStatusOptions = computed(() => ['All', 'In Transit', 'Delivered', 'Cancelled']);
  readonly orderStatusFilter = signal<'All' | 'In Transit' | 'Processing' | 'Delivered' | 'Cancelled'>('All');
  readonly orderSearch = signal('');
  readonly recentDeliveredOrder = computed(() => {
    const delivered = this.authService.orders().filter(order => order.status === 'Delivered');
    return delivered.find(o => o.id === 'RH-98234') || delivered[0];
  });
  readonly filteredOrders = computed(() => {
    const status = this.orderStatusFilter();
    const query = this.orderSearch().trim().toLowerCase();
    return this.authService.orders().filter(order => {
      const matchesStatus = status === 'All' || order.status === status;
      const searchableText = `${order.id} ${order.date} ${order.status} ${order.items.map(item => item.title).join(' ')}`.toLowerCase();
      return matchesStatus && (!query || searchableText.includes(query));
    });
  });

  // Notifications state for Profile & Settings
  readonly notifOrderUpdates = signal(true);
  readonly notifWhatsapp = signal(true);
  readonly notifDeals = signal(true);
  readonly notifPromos = signal(false);
  readonly selectedLanguage = signal('English');
  readonly selectedReceiptOrder = signal<UserOrder | null>(null);

  selectOrderView(view: 'active' | 'past' | 'returns'): void {
    this.orderView.set(view);
    this.orderStatusFilter.set('All');
    if (this.activeTab() !== 'orders' && this.activeTab() !== 'returns') {
      this.setActiveTab('orders');
    }
  }

  async clearAllWishlist(): Promise<void> {
    if (await this.alerts.confirm({ title: 'Clear wishlist?', message: 'Remove all saved products from your wishlist?', kind: 'warning', confirmText: 'Clear wishlist' })) {
      this.wishlistService.clear();
      this.reviewToast.set('Wishlist cleared.');
      if (this.reviewToastTimer) clearTimeout(this.reviewToastTimer);
      this.reviewToastTimer = setTimeout(() => this.reviewToast.set(null), 3000);
    }
  }

  moveAllToCart(): void {
    const inStock = this.wishlistProducts().filter(p => p.inStock);
    if (!inStock.length) {
      void this.alerts.show({ title: 'No items available', message: 'There are no in-stock wishlist items to add.', kind: 'info' });
      return;
    }
    inStock.forEach(item => this.cartService.addToCart(item, 1));
    this.reviewToast.set(`Moved ${inStock.length} items to your cart!`);
    if (this.reviewToastTimer) clearTimeout(this.reviewToastTimer);
    this.reviewToastTimer = setTimeout(() => this.reviewToast.set(null), 3500);
    this.cartService.openCartDrawer();
  }

  openAlternateModal(product: Product): void {
    this.alternateModalService.open(product);
  }

  removeFromWishlist(id: number): void {
    this.wishlistService.toggle(id);
  }

  toggleWishlistItem(product: Product): void {
    this.wishlistService.toggle(product.id);
  }

  addToCartSingle(product: Product): void {
    if (!product.inStock) {
      this.router.navigate(['/shop'], { queryParams: { category: product.categorySlug } });
      return;
    }
    this.cartService.addToCart(product, 1);
    this.reviewToast.set(`Added "${product.title}" to cart!`);
    if (this.reviewToastTimer) clearTimeout(this.reviewToastTimer);
    this.reviewToastTimer = setTimeout(() => this.reviewToast.set(null), 3000);
  }

  // New Address Modal State
  isAddressModalOpen = signal<boolean>(false);

  // New Card Modal State
  isCardModalOpen = signal<boolean>(false);

  // Wallet Top-up state
  topUpAmount = signal<number>(1000);
  selectedTopUpMethod = signal<'jazzcash' | 'easypaisa' | 'card'>('jazzcash');

  // Unified Wallet & Loyalty Activity State
  activityFilter = signal<'all' | 'wallet' | 'loyalty'>('all');
  autoApplyWallet = signal<boolean>(true);
  isAddFundsModalOpen = signal<boolean>(false);

  readonly recentActivities = signal([
    {
      id: 'act-1',
      type: 'loyalty' as const,
      title: 'Points Earned · Order #RH-98234',
      subtitle: 'Nov 18, 2026 · 60-Min Express Delivery',
      amountText: '+ 180 pts',
      isPositive: true,
      categoryLabel: 'Loyalty' as const,
      iconClass: 'fal fa-star',
      iconBg: 'blue' as const,
    },
    {
      id: 'act-2',
      type: 'wallet' as const,
      title: 'Paid via Wallet · Order #RH-97891',
      subtitle: 'Nov 12, 2026 · Auto-applied at checkout',
      amountText: '- Rs. 200',
      isPositive: false,
      categoryLabel: 'Wallet' as const,
      iconClass: 'fal fa-wallet',
      iconBg: 'gray' as const,
    },
    {
      id: 'act-3',
      type: 'wallet' as const,
      title: 'Refund Credited · Return #RET-3988',
      subtitle: 'Nov 10, 2026 · Olpers Milk 1L Pack',
      amountText: '+ Rs. 330',
      isPositive: true,
      categoryLabel: 'Wallet' as const,
      iconClass: 'fal fa-undo-alt',
      iconBg: 'green' as const,
    },
    {
      id: 'act-4',
      type: 'wallet' as const,
      title: 'Cashback Bonus · Monthly Promo',
      subtitle: 'Nov 01, 2026 · Rainbow Member Reward',
      amountText: '+ Rs. 320',
      isPositive: true,
      categoryLabel: 'Wallet' as const,
      iconClass: 'fal fa-gift',
      iconBg: 'green' as const,
    }
  ]);

  readonly filteredActivities = computed(() => {
    const filter = this.activityFilter();
    if (filter === 'all') return this.recentActivities();
    return this.recentActivities().filter(a => a.type === filter);
  });

  toggleAutoApplyWallet(): void {
    this.autoApplyWallet.update(val => !val);
  }

  redeemPoints(): void {
    void this.alerts.show({ title: 'Your loyalty points', message: `You have ${this.loyaltyService.balance()} points available. Points can be redeemed at checkout.`, kind: 'info' });
  }

  openAddFundsModal(): void {
    this.isAddFundsModalOpen.set(true);
  }

  closeAddFundsModal(): void {
    this.isAddFundsModalOpen.set(false);
  }

  // Profile Form Data
  profileForm = { ...this.authService.userProfile() };

  // Password update requires a server-side SMS OTP service. Keep the UI state
  // ready for that integration without generating or validating OTPs in-browser.
  passwordOtpRequested = signal(false);
  demoPasswordOpen = signal(false);
  passwordOtp = '';
  newPassword = '';
  confirmNewPassword = '';
  passwordNotice = signal<{ message: string; type: 'error' | 'success' } | null>(null);
  passwordVisible = signal(false);
  confirmPasswordVisible = signal(false);

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
    this.seoService.setMetaDescription('Manage your Rainbow account, orders, addresses, loyalty points and wallet.');
    this.routeSubscription = this.route.queryParamMap.subscribe(params => {
      if (params.get('tab') === 'wishlist') { this.shoppingView.set('wishlist'); this.activeTab.set('wishlist'); }
      else if (params.get('tab') === 'assistant') { this.activeTab.set('assistant'); }
    });
  }

  ngOnDestroy(): void {
    this.routeSubscription?.unsubscribe();
    if (this.reviewToastTimer) clearTimeout(this.reviewToastTimer);
  }

  setActiveTab(tab: 'orders' | 'wishlist' | 'wallet' | 'loyalty' | 'addresses' | 'cards' | 'settings' | 'returns' | 'assistant') {
    this.accountMenuOpen.set(false);
    if (tab === 'returns') {
      this.activeTab.set('orders');
      this.orderView.set('returns');
    } else {
      this.activeTab.set(tab);
    }
    if (window.innerWidth < 992 && this.accountMainContent?.nativeElement) {
      setTimeout(() => {
        const content = this.accountMainContent?.nativeElement;
        if (!content) return;
        const headerBottom = Math.max(0, document.getElementById('rh-nav')?.getBoundingClientRect().bottom ?? 0);
        const top = Math.max(0, window.scrollY + content.getBoundingClientRect().top - headerBottom - 12);
        const behavior = window.matchMedia('(prefers-reduced-motion: reduce)').matches ? 'auto' : 'smooth';
        window.scrollTo({ top, behavior });
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
    if (!normalizePhone(this.profileForm.phone)) {
      void this.alerts.show({ title: 'Check mobile number', message: 'Enter a valid Pakistani mobile number.', kind: 'warning' });
      return;
    }
    if (normalizePhone(this.profileForm.phone) !== normalizePhone(this.authService.userProfile().phone)) {
      this.passwordOtpRequested.set(true);
      return;
    }
    this.authService.updateProfile(this.profileForm);
    void this.alerts.show({ title: 'Changes saved', message: 'Your account settings have been updated.', kind: 'success' });
  }

  requestPasswordOtp(): void {
    this.demoPasswordOpen.set(true);
  }

  closeDemoPassword(): void {
    this.demoPasswordOpen.set(false);
  }

  closePasswordOtp(): void {
    this.passwordOtpRequested.set(false);
    this.passwordNotice.set(null);
    this.passwordOtp = '';
    this.newPassword = '';
    this.confirmNewPassword = '';
  }

  submitPasswordChange(): void {
    this.passwordNotice.set({
      type: 'error',
      message: 'Password changes need server-side OTP verification, which is not configured for this account yet.'
    });
  }

  togglePasswordVisibility(confirm = false): void {
    if (confirm) this.confirmPasswordVisible.update(value => !value);
    else this.passwordVisible.update(value => !value);
  }

  onTopUpWallet() {
    if (this.topUpAmount() > 0) {
      const added = this.topUpAmount();
      this.authService.topUpWallet(added);
      this.recentActivities.update(acts => [
        {
          id: 'act-' + Date.now(),
          type: 'wallet' as const,
          title: `Top Up via ${this.selectedTopUpMethod().toUpperCase()}`,
          subtitle: `Just now · Added funds`,
          amountText: `+ Rs. ${added}`,
          isPositive: true,
          categoryLabel: 'Wallet' as const,
          iconClass: 'fal fa-wallet',
          iconBg: 'green' as const,
        },
        ...acts
      ]);
      void this.alerts.show({ title: 'Wallet topped up', message: `Rs. ${added} was added to your Rainbow Wallet.`, kind: 'success' });
      this.closeAddFundsModal();
    }
  }

  openReturnModal(order: UserOrder) {
    this.returnOrderPickerOpen.set(false);
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

  returnItemImage(orderId: string, itemTitle: string): string | undefined {
    const name = itemTitle.trim().toLowerCase();
    return this.authService.orders().find(order => order.id === orderId)?.items.find(item => item.title.trim().toLowerCase() === name)?.image;
  }

  resetProfile(): void { this.profileForm = { ...this.authService.userProfile() }; }

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

  toggleOrderDetails(orderId: string): void {
    this.toggleOrderPanel(orderId, 'details');
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
    if (order.status !== 'Delivered') return;
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
    this.cartService.openCartDrawer();
  }

  closeReturnModal() {
    this.isReturnModalOpen.set(false);
  }

  submitReturnRequest(data: { orderId: string; items: Array<UserOrder['items'][number] & { reason: string; evidenceImage?: string }> }) {
    this.authService.requestReturn(data.orderId, data.items.map(item => ({
      itemTitle: item.title,
      reason: item.reason,
      refundAmount: item.price * item.quantity,
      evidenceImage: item.evidenceImage
    })));
    this.closeReturnModal();
    this.setActiveTab('returns');
  }

  getItemShortTitle(title: string): string {
    if (!title) return '';
    const lower = title.toLowerCase();
    if (lower.includes('guava')) return 'Guava';
    if (lower.includes('yogurt')) return 'Yogurt';
    if (lower.includes('olpers')) return 'Olpers Milk';
    if (lower.includes('egg')) return 'Farm Eggs';
    if (lower.includes('carrot')) return 'Carrots';
    if (lower.includes('mushroom')) return 'Mushrooms';
    if (lower.includes('oil')) return 'Cooking Oil';
    if (lower.includes('noodle')) return 'Knorr Noodles';
    const parts = title.split(' ');
    return parts.length > 2 ? `${parts[0]} ${parts[1]}` : title;
  }

  callRider(order: UserOrder): void {
    const riderName = 'Muhammad Rizwan';
    const phone = '+92 300 1234567';
    void this.alerts.show({ title: 'Rider details', message: `Demo rider: ${riderName} · ${phone}\nOrder #${order.id}`, kind: 'info' });
  }

  async downloadInvoice(order: UserOrder): Promise<void> {
    if (!order) return;
    try { await this.receiptPdf.download(order); }
    catch { void this.alerts.show({ title: 'Download unavailable', message: 'The receipt could not be downloaded. Please try again.', kind: 'warning' }); }
  }

  viewReceipt(order: UserOrder): void {
    if (!order) return;
    this.selectedReceiptOrder.set(order);
    setTimeout(() => document.querySelector<HTMLElement>('.rainbow-receipt-modal-dialog')?.focus());
  }

  @HostListener('document:keydown.escape') closeReceiptOnEscape(): void {
    if (this.selectedReceiptOrder()) this.closeReceiptModal();
  }

  closeReceiptModal(): void {
    this.selectedReceiptOrder.set(null);
  }

  getReceiptSubtotal(order: UserOrder | null | undefined): number {
    if (!order || !order.items) return 0;
    return order.items.reduce((sum, item) => sum + (item.price * item.quantity), 0);
  }

  getReceiptLoyaltyPoints(order: UserOrder | null | undefined): number {
    if (!order) return 0;
    return Math.round(order.totalAmount * 0.1);
  }

  getOrderForReturn(orderId: string): UserOrder {
    const found = this.authService.orders().find(o => o.id === orderId);
    if (found) return found;
    return {
      id: orderId || 'RH-97504',
      date: 'Nov 10, 2026',
      itemsCount: 1,
      totalAmount: 330,
      status: 'Delivered',
      paymentMethod: 'Rainbow Wallet',
      items: [{
        title: 'Olpers Milk 1L Pack',
        image: 'assets/images/grocery/olpers.jpg',
        quantity: 1,
        price: 330,
        weightOrUnit: '1 L',
        categorySlug: 'dairy-eggs'
      }]
    };
  }

  generateReceiptHtml(order: UserOrder): string {
    const subtotal = this.getReceiptSubtotal(order);
    const earnedPoints = this.getReceiptLoyaltyPoints(order);
    const profile = this.authService.userProfile();
    const loyaltyBalance = this.loyaltyService.balance();
    const origin = typeof window !== 'undefined' ? window.location.origin : '';
    const logoUrl = origin ? `${origin}/assets/images/logo/rainbow-logo.svg` : 'assets/images/logo/rainbow-logo.svg';

    const itemsHtml = (order.items || []).map(item => `
      <div class="rainbow-payment-receipt-item">
        <span class="rainbow-payment-receipt-quantity">${item.quantity}x</span>
        <span class="rainbow-payment-receipt-item-name">
          ${item.title}
          ${item.weightOrUnit ? `<small>${item.weightOrUnit}</small>` : ''}
        </span>
        <strong>Rs. ${(item.price * item.quantity).toLocaleString()}</strong>
      </div>
    `).join('');

    return `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Receipt - Order #${order.id} | Rainbow Cash &amp; Carry</title>
  <link rel="preconnect" href="https://fonts.googleapis.com">
  <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
  <link href="https://fonts.googleapis.com/css2?family=Poppins:wght@400;500;600;700&display=swap" rel="stylesheet">
  <style>
    * { box-sizing: border-box; margin: 0; padding: 0; }
    body {
      font-family: 'Poppins', -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif;
      background: #f0f4f9;
      color: #17234a;
      display: flex;
      flex-direction: column;
      align-items: center;
      padding: 30px 16px;
      min-height: 100vh;
      -webkit-font-smoothing: antialiased;
    }
    .receipt-print-actions {
      display: flex;
      align-items: center;
      justify-content: space-between;
      gap: 12px;
      width: 100%;
      max-width: 440px;
      margin-bottom: 20px;
      padding: 12px 18px;
      background: #ffffff;
      border: 1px solid #e1e6ed;
      border-radius: 12px;
      box-shadow: 0 4px 14px rgba(15, 23, 42, 0.06);
    }
    .receipt-print-title {
      font-size: 13px;
      font-weight: 600;
      color: #17234a;
    }
    .receipt-action-btns {
      display: flex;
      align-items: center;
      gap: 8px;
    }
    .btn-action {
      display: inline-flex;
      align-items: center;
      gap: 6px;
      padding: 7px 14px;
      border-radius: 8px;
      font-size: 12px;
      font-weight: 600;
      cursor: pointer;
      text-decoration: none;
      transition: all 0.2s ease;
      font-family: inherit;
    }
    .btn-action-primary {
      background: #2e3192;
      color: #ffffff;
      border: 1px solid #2e3192;
    }
    .btn-action-primary:hover {
      background: #1e2270;
    }
    .btn-action-secondary {
      background: #f1f5f9;
      color: #334155;
      border: 1px solid #cbd5e1;
    }
    .btn-action-secondary:hover {
      background: #e2e8f0;
    }

    .rainbow-payment-receipt {
      position: relative;
      width: 100%;
      max-width: 440px;
      padding: 24px 28px 32px;
      border: 1px solid #e1e6ed;
      border-radius: 8px;
      background: linear-gradient(to top, rgba(224,228,232,.55), rgba(255,255,255,0) 28px), linear-gradient(90deg, #f5f6f7 0%, #fff 12%, #fff 88%, #f2f4f6 100%);
      box-shadow: inset 12px 0 20px -20px rgba(55, 65, 81, .4), inset -12px 0 20px -20px rgba(55, 65, 81, .4), 0 12px 22px rgba(24, 35, 66, .14);
      text-align: left;
    }
    .rainbow-receipt-brand {
      display: grid;
      justify-items: center;
      gap: 7px;
      padding-bottom: 14px;
      border-bottom: 1px dashed #cbd4df;
      color: #607087;
      font-size: 0.68rem;
      font-weight: 600;
      letter-spacing: .06em;
      text-align: center;
    }
    .rainbow-receipt-brand img {
      display: block;
      width: 86px;
      max-width: 50%;
      height: auto;
      margin-bottom: 4px;
    }
    .rainbow-receipt-brand strong {
      color: #17234a;
      font-size: 0.95rem;
      text-align: center;
      letter-spacing: 0;
      font-weight: 600;
    }
    .rainbow-receipt-brand .rainbow-receipt-confirmed {
      color: #208449;
      font-size: 0.68rem;
      text-transform: uppercase;
      font-weight: 700;
      letter-spacing: 0.05em;
    }
    .rainbow-receipt-details {
      display: grid;
      grid-template-columns: repeat(2, minmax(0, 1fr));
      gap: 12px;
      padding: 13px 0;
      border-bottom: 1px dashed #cbd4df;
    }
    .rainbow-receipt-details > div {
      display: flex;
      min-width: 0;
      flex-direction: column;
      gap: 3px;
      text-align: left;
      overflow-wrap: anywhere;
    }
    .rainbow-receipt-details span {
      color: #78849a;
      font-size: 0.65rem;
      font-weight: 600;
      text-transform: uppercase;
      letter-spacing: 0.04em;
    }
    .rainbow-receipt-details strong, .rainbow-receipt-details p {
      margin: 0;
      color: #26324a;
      font-size: 0.75rem;
      line-height: 1.4;
    }
    .rainbow-receipt-details strong {
      font-weight: 600;
    }
    .rainbow-payment-receipt-title {
      display: flex;
      align-items: center;
      gap: 8px;
      margin-top: 14px;
      margin-bottom: 10px;
      color: #17192e;
      font-size: 0.95rem;
      font-weight: 600;
    }
    .rainbow-payment-receipt-items {
      display: grid;
      gap: 9px;
      margin-bottom: 8px;
      padding-bottom: 12px;
      border-bottom: 1px solid #e5e9f1;
    }
    .rainbow-payment-receipt-item {
      display: grid;
      grid-template-columns: 28px minmax(0, 1fr) auto;
      align-items: start;
      gap: 8px;
      color: #42495a;
      font-size: 0.82rem;
      line-height: 1.35;
    }
    .rainbow-payment-receipt-quantity {
      color: #2e3192;
      font-weight: 600;
    }
    .rainbow-payment-receipt-item-name {
      min-width: 0;
      color: #26324a;
    }
    .rainbow-payment-receipt-item-name small {
      display: block;
      color: #858b9a;
      font-size: 0.72rem;
    }
    .rainbow-payment-receipt-item strong {
      color: #20263a;
      font-variant-numeric: tabular-nums;
      white-space: nowrap;
      font-weight: 600;
    }
    .rainbow-payment-receipt-row, .rainbow-payment-receipt-total {
      display: grid;
      grid-template-columns: minmax(0, 1fr) auto;
      align-items: baseline;
      gap: 16px;
      font-size: 0.85rem;
      line-height: 1.5;
      margin-bottom: 4px;
    }
    .rainbow-payment-receipt-row {
      color: #4f566b;
    }
    .rainbow-payment-receipt-row strong, .rainbow-payment-receipt-total strong:last-child {
      color: #17192e;
      font-variant-numeric: tabular-nums;
      white-space: nowrap;
      font-weight: 600;
    }
    .rainbow-payment-receipt-row strong.text-success {
      color: #208449;
    }
    .rainbow-payment-receipt-total {
      margin-top: 8px;
      padding-top: 10px;
      border-top: 1px solid #e8ecf3;
      color: #17192e;
      font-size: 0.95rem;
      font-weight: 700;
    }
    .rainbow-payment-receipt-total strong:first-child {
      color: #17234a;
      font-weight: 700;
    }
    .rainbow-receipt-loyalty {
      margin-top: 14px;
      padding-top: 12px;
      border-top: 1px dashed #cbd4df;
      color: #53617a;
      font-size: 0.73rem;
      line-height: 1.5;
      text-align: center;
    }
    .rainbow-receipt-loyalty strong {
      color: #17234a;
    }

    @media print {
      body {
        background: #ffffff !important;
        padding: 0 !important;
      }
      .no-print {
        display: none !important;
      }
      .rainbow-payment-receipt {
        border: none !important;
        box-shadow: none !important;
        padding: 0 !important;
        max-width: 100% !important;
        width: 100% !important;
      }
      @page {
        margin: 10mm;
        size: auto;
      }
    }
  </style>
</head>
<body>
  <div class="no-print receipt-print-actions">
    <span class="receipt-print-title">Receipt #${order.id}</span>
    <div class="receipt-action-btns">
      <button type="button" class="btn-action btn-action-primary" onclick="window.print()">
        Save as PDF / Print
      </button>
      <button type="button" class="btn-action btn-action-secondary" onclick="window.close()">
        Close
      </button>
    </div>
  </div>

  <section class="rainbow-payment-receipt" aria-label="Official receipt">
    <div class="rainbow-receipt-brand">
      <img src="${logoUrl}" alt="Rainbow Cash &amp; Carry" onerror="this.style.display='none'">
      <span class="rainbow-receipt-confirmed">Order placed successfully</span>
      <strong>Thank you for shopping with us!</strong>
      <span>ORDER ${order.id}</span>
    </div>

    <div class="rainbow-receipt-details">
      <div>
        <span>Delivery address</span>
        <strong>${profile.name}</strong>
        <p>${profile.address}</p>
        <p>${profile.phone}</p>
      </div>
      <div>
        <span>Delivery method</span>
        <strong>Instant Express Delivery</strong>
        <p>In 40 minutes (${order.date})</p>
      </div>
      <div>
        <span>Branch</span>
        <strong>Bahria Town Branch</strong>
      </div>
      <div>
        <span>Payment method</span>
        <strong>${order.paymentMethod}</strong>
      </div>
    </div>

    <div class="rainbow-payment-receipt-title">
      Payment Summary
    </div>

    <div class="rainbow-payment-receipt-items">
      ${itemsHtml}
    </div>

    <div class="rainbow-payment-receipt-row">
      <span>Items total</span>
      <strong>Rs. ${subtotal.toLocaleString()}</strong>
    </div>

    <div class="rainbow-payment-receipt-row">
      <span>Delivery fee</span>
      <strong class="text-success">Free</strong>
    </div>

    <div class="rainbow-payment-receipt-total">
      <strong>Remaining payable</strong>
      <strong>Rs. ${order.totalAmount.toLocaleString()}</strong>
    </div>

    <div class="rainbow-receipt-loyalty">
      You earned <strong>${earnedPoints} loyalty points</strong>. Your balance is ${loyaltyBalance.toLocaleString()} points.
    </div>
  </section>

  <script>
    window.addEventListener('load', function() {
      setTimeout(function() {
        if (!window.location.search.includes('noprint')) {
          window.print();
        }
      }, 450);
    });
  </script>
</body>
</html>`;
  }

  downloadReceiptFile(order: UserOrder): void {
    if (!order) return;
    void this.downloadInvoice(order);
  }

  printReceipt(order: UserOrder): void {
    if (!order) return;
    const html = this.generateReceiptHtml(order);
    const printWindow = window.open('', '_blank', 'width=520,height=800,menubar=no,toolbar=no,location=no,status=no,titlebar=no');
    if (printWindow) {
      printWindow.document.open();
      printWindow.document.write(html);
      printWindow.document.close();
    } else {
      this.downloadReceiptFile(order);
    }
  }

  onLogout() {
    this.authService.logout();
    this.router.navigate(['/login']);
  }
}
