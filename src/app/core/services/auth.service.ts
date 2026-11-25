import { Injectable, signal, computed } from '@angular/core';

/** Canonical Pakistani mobile identity; reject numbers that cannot receive SMS. */
export function normalizePhone(phone: string): string {
  const value = (phone || '').trim();
  if (!/^\+?[\d\s()-]+$/.test(value)) return '';
  const digits = value.replace(/\D/g, '');
  const local = digits.startsWith('92') ? '0' + digits.slice(2) : digits;
  return /^03\d{9}$/.test(local) ? '92' + local.slice(1) : '';
}

export interface UserProfile {
  name: string;
  email: string;
  phone: string;
  address: string;
  city: string;
  avatar?: string;
  memberSince: string;
  dob?: string;
  isEmailVerified?: boolean;
  isPhoneVerified?: boolean;
}

export interface SavedAddress {
  id: string;
  label: string;
  recipientName: string;
  phone: string;
  addressLine: string;
  city: string;
  isDefault: boolean;
  branchZone?: string;
  riderNote?: string;
  isMapPinned?: boolean;
}

export interface SavedCard {
  id: string;
  cardHolder: string;
  cardNumber: string; // Stored as masked e.g. "**** **** **** 4821"
  expiryDate: string;
  cardBrand: 'visa' | 'mastercard' | 'unionpay';
  isDefault: boolean;
}

export interface UserOrder {
  id: string;
  date: string;
  itemsCount: number;
  totalAmount: number;
  deliveryCharge?: number;
  status: 'Delivered' | 'In Transit' | 'Processing' | 'Cancelled';
  paymentMethod: string;
  items: Array<{
    title: string;
    image: string;
    quantity: number;
    price: number;
    weightOrUnit?: string;
    categorySlug?: string;
  }>;
}

export interface ReturnRequestItem {
  itemTitle: string;
  reason: string;
  refundAmount: number;
  evidenceImage?: string;
}

export interface ReturnRequest {
  id: string;
  orderId: string;
  date: string;
  items: ReturnRequestItem[];
  refundAmount: number;
  status: 'Approved' | 'Pending' | 'Rejected';
  stageBadge?: string;
  stage?: number;
  method?: string;
}

export interface OrderReview {
  orderId: string;
  rating: number;
  feedback: string;
  createdAt: string;
}

@Injectable({
  providedIn: 'root'
})
export class AuthService {
  // Authentication State
  private readonly authStorageKey = 'rainbow-auth-v1';
  private readonly authPhoneStorageKey = 'rainbow-phone-v1';
  readonly isLoggedIn = signal<boolean>(this.readLoginState());

  private readLoginState(): boolean {
    try { return localStorage.getItem(this.authStorageKey) === 'signed-in' && !!normalizePhone(localStorage.getItem(this.authPhoneStorageKey) || ''); }
    catch { return false; }
  }

  private saveLoginState(signedIn: boolean): void {
    try { localStorage.setItem(this.authStorageKey, signedIn ? 'signed-in' : 'signed-out'); }
    catch { /* Keep the current session usable when storage is unavailable. */ }
  }

  private readLoginPhone(): string {
    try { return this.isLoggedIn() ? localStorage.getItem(this.authPhoneStorageKey) || '' : ''; }
    catch { return ''; }
  }

  // User Profile Data
  readonly userProfile = signal<UserProfile>({
    name: 'Muhammad Athar',
    email: 'muhammad.athar@gmail.com',
    phone: this.readLoginPhone() || '+92 310 777 9651',
    address: 'House 42-B, Street 7, CC-Block, Sector D, Bahria Town, Lahore',
    city: 'Lahore',
    memberSince: 'Oct 2024',
    dob: '12 March 1994',
    isEmailVerified: true,
    isPhoneVerified: true
  });

  // Saved Delivery Addresses
  readonly savedAddresses = signal<SavedAddress[]>([
    {
      id: 'addr-1',
      label: 'Home',
      recipientName: 'Muhammad Athar',
      phone: '+92 310 777 9651',
      addressLine: 'House 42-B, Street 7, CC-Block, Sector D, Bahria Town, Lahore',
      city: 'Lahore',
      isDefault: true,
      branchZone: 'Bahria Town Branch · 60-Min Express',
      riderNote: 'Ring main gate bell, leave groceries with guard if busy.',
      isMapPinned: true
    },
    {
      id: 'addr-2',
      label: 'Office',
      recipientName: 'Muhammad Athar',
      phone: '+92 310 777 9651',
      addressLine: 'Office 304, 3rd Floor, Arfa Software Technology Park, Ferozepur Rd, Lahore',
      city: 'Lahore',
      isDefault: false,
      branchZone: 'Model Town Branch · 60-Min Express',
      riderNote: 'Call on arrival at ground-floor reception desk.',
      isMapPinned: true
    },
    {
      id: 'addr-3',
      label: "Parents' Home",
      recipientName: 'Athar Residence',
      phone: '+92 321 445 8820',
      addressLine: 'House 18, Block K, Main Boulevard, Gulberg III, Lahore',
      city: 'Lahore',
      isDefault: false,
      branchZone: 'Gulberg Branch · 60-Min Express',
      riderNote: 'Call 5 minutes before reaching the gate.',
      isMapPinned: true
    }
  ]);

  // Saved Payment Cards
  readonly savedCards = signal<SavedCard[]>([
    {
      id: 'card-1',
      cardHolder: 'Muhammad Athar',
      cardNumber: '•••• •••• •••• 4821',
      expiryDate: '12/28',
      cardBrand: 'visa',
      isDefault: true
    },
    {
      id: 'card-2',
      cardHolder: 'Muhammad Athar',
      cardNumber: '•••• •••• •••• 9012',
      expiryDate: '08/27',
      cardBrand: 'mastercard',
      isDefault: false
    }
  ]);

  // Wallet Balance
  readonly walletBalance = signal<number>(this.readWalletBalance());

  private readWalletBalance(phone = normalizePhone(this.userProfile().phone)): number {
    if (!phone || !this.isLoggedIn()) return 0;
    try {
      const saved = localStorage.getItem(`rainbow-wallet-v1:${phone}`);
      if (saved !== null) {
        const amount = Number(saved);
        return Number.isFinite(amount) && amount >= 0 ? amount : 0;
      }
    } catch { /* Use the demo default when storage is unavailable. */ }
    return phone === '923107779651' ? 450 : 0;
  }

  private saveWalletBalance(): void {
    const phone = normalizePhone(this.userProfile().phone);
    if (!phone || !this.isLoggedIn()) return;
    try { localStorage.setItem(`rainbow-wallet-v1:${phone}`, String(this.walletBalance())); } catch { /* Keep this session usable. */ }
  }

  // Orders History
  readonly orders = signal<UserOrder[]>([
    {
      id: 'RH-98412',
      date: this.formatOrderDate(0),
      itemsCount: 3,
      totalAmount: 1830,
      deliveryCharge: 0,
      status: 'In Transit',
      paymentMethod: 'Rainbow Wallet',
      items: [
        { title: 'Fresh Organic Guava', image: 'assets/images/ultra_fresh/fresh-organic-guava.png', quantity: 2, price: 180, weightOrUnit: '1 kg', categorySlug: 'ultra-fresh' },
        { title: 'Pure Farm Milk Yogurt', image: 'assets/images/ultra_fresh/Yogurt.png', quantity: 1, price: 150, weightOrUnit: '500 g', categorySlug: 'dairy-eggs' },
        { title: 'Farm Fresh Eggs', image: 'assets/images/ultra_fresh/grocerry-fresh-eggs.jpeg', quantity: 3, price: 440, weightOrUnit: 'Pack of 12', categorySlug: 'dairy-eggs' }
      ]
    },
    {
      id: 'RH-98234',
      date: this.formatOrderDate(0),
      itemsCount: 3,
      totalAmount: 1830,
      deliveryCharge: 0,
      status: 'Delivered',
      paymentMethod: 'Rainbow Wallet',
      items: [
        { title: 'Fresh Organic Guava', image: 'assets/images/ultra_fresh/fresh-organic-guava.png', quantity: 1, price: 360, weightOrUnit: '1 kg', categorySlug: 'ultra-fresh' },
        { title: 'Pure Farm Milk Yogurt', image: 'assets/images/ultra_fresh/Yogurt.png', quantity: 1, price: 150, weightOrUnit: '500 g', categorySlug: 'dairy-eggs' },
        { title: 'Farm Fresh Eggs', image: 'assets/images/ultra_fresh/grocerry-fresh-eggs.jpeg', quantity: 3, price: 440, weightOrUnit: 'Pack of 12', categorySlug: 'dairy-eggs' }
      ]
    },
    {
      id: 'RH-97891',
      date: 'Nov 12, 2026',
      itemsCount: 5,
      totalAmount: 2450,
      deliveryCharge: 0,
      status: 'Delivered',
      paymentMethod: 'Cash on Delivery',
      items: [
        { title: 'Whole Wheat Bread Large', image: 'assets/images/grocery/bread.png', quantity: 1, price: 160, weightOrUnit: 'Large', categorySlug: 'bakery' },
        { title: 'Farm Fresh Eggs', image: 'assets/images/ultra_fresh/grocerry-fresh-eggs.jpeg', quantity: 2, price: 420, weightOrUnit: 'Pack of 12', categorySlug: 'dairy-eggs' },
        { title: 'Fresh Red Apples', image: 'assets/images/ultra_fresh/apple.png', quantity: 1, price: 380, weightOrUnit: '1 kg', categorySlug: 'ultra-fresh' },
        { title: 'Fresh Carrots', image: 'assets/images/ultra_fresh/carrot.webp', quantity: 1, price: 90, weightOrUnit: '500 g', categorySlug: 'ultra-fresh' },
        { title: 'Pure Farm Milk Yogurt', image: 'assets/images/ultra_fresh/Yogurt.png', quantity: 2, price: 150, weightOrUnit: '500 g', categorySlug: 'dairy-eggs' }
      ]
    },
    {
      id: 'RH-92842',
      date: 'Oct 27, 2026',
      itemsCount: 3,
      totalAmount: 750,
      deliveryCharge: 0,
      status: 'Delivered',
      paymentMethod: 'Cash on Delivery',
      items: [
        { title: 'Fresh Organic Guava', image: 'assets/images/ultra_fresh/fresh-organic-guava.png', quantity: 1, price: 180, categorySlug: 'ultra-fresh' },
        { title: 'Pure Farm Milk Yogurt', image: 'assets/images/ultra_fresh/Yogurt.png', quantity: 1, price: 150, categorySlug: 'dairy-eggs' },
        { title: 'Farm Fresh Eggs', image: 'assets/images/ultra_fresh/grocerry-fresh-eggs.jpeg', quantity: 1, price: 420, categorySlug: 'dairy-eggs' }
      ]
    }
  ]);

  // Returns Requests
  readonly returns = signal<ReturnRequest[]>([
    {
      id: 'RET-4021',
      orderId: 'RH-98110',
      date: 'Nov 20, 2026',
      items: [{ itemTitle: 'Fresh Farm Tomatoes (1 kg)', reason: 'Damaged / Bruised item', refundAmount: 240, evidenceImage: 'assets/images/ultra_fresh/tomatoes.png' }],
      refundAmount: 240,
      status: 'Pending',
      stageBadge: 'Pickup Scheduled',
      stage: 2,
      method: 'Rainbow Wallet'
    },
    {
      id: 'RET-3988',
      orderId: 'RH-97504',
      date: 'Nov 10, 2026',
      items: [{ itemTitle: 'Farm Fresh Eggs (Pack of 12)', reason: 'Damaged packaging', refundAmount: 330, evidenceImage: 'assets/images/ultra_fresh/grocerry-fresh-eggs.jpeg' }],
      refundAmount: 330,
      status: 'Approved',
      stageBadge: 'Refunded',
      stage: 3,
      method: 'Rainbow Wallet'
    }
  ]);

  readonly orderReviews = signal<OrderReview[]>(this.loadOrderReviews());

  getOrderReview(orderId: string): OrderReview | undefined {
    return this.orderReviews().find(review => review.orderId === orderId);
  }

  submitOrderReview(orderId: string, rating: number, feedback: string): boolean {
    const order = this.orders().find(candidate => candidate.id === orderId);
    if (order?.status !== 'Delivered' || this.getOrderReview(orderId) || !Number.isInteger(rating) || rating < 1 || rating > 5) return false;

    const review: OrderReview = {
      orderId,
      rating,
      feedback: feedback.trim().slice(0, 300),
      createdAt: new Date().toISOString()
    };
    this.orderReviews.update(reviews => [...reviews, review]);
    try {
      if (typeof window !== 'undefined') window.localStorage.setItem('rainbow.orderReviews.v1', JSON.stringify(this.orderReviews()));
    } catch {
      // Keep the review in this session when browser storage is unavailable.
    }
    return true;
  }

  private loadOrderReviews(): OrderReview[] {
    try {
      if (typeof window === 'undefined') return [];
      const saved = JSON.parse(window.localStorage.getItem('rainbow.orderReviews.v1') ?? '[]');
      if (!Array.isArray(saved)) return [];
      return saved.filter((review): review is OrderReview =>
        typeof review?.orderId === 'string' && Number.isInteger(review.rating) && review.rating >= 1 && review.rating <= 5 &&
        typeof review.feedback === 'string' && typeof review.createdAt === 'string'
      );
    } catch {
      return [];
    }
  }

  login(phone: string): boolean {
    const normalized = normalizePhone(phone);
    if (!normalized) return false;
    this.saveWalletBalance();
    this.isLoggedIn.set(true);
    this.saveLoginState(true);
    this.userProfile.update(profile => ({ ...profile, phone: normalized, isPhoneVerified: false }));
    this.walletBalance.set(this.readWalletBalance(normalized));
    try { localStorage.setItem(this.authPhoneStorageKey, normalized); } catch { /* Session state remains available in memory. */ }
    return true;
  }

  logout() {
    this.saveWalletBalance();
    this.isLoggedIn.set(false);
    this.saveLoginState(false);
  }

  topUpWallet(amount: number) {
    if (amount > 0) {
      this.walletBalance.update(bal => bal + amount);
      this.saveWalletBalance();
    }
  }

  debitWallet(amount: number): void {
    this.walletBalance.update(balance => Math.round((balance - amount) * 100) / 100);
    this.saveWalletBalance();
  }

  updateProfile(updated: Partial<UserProfile>) {
    this.userProfile.update(profile => ({ ...profile, ...updated }));
  }

  // Address Actions
  addAddress(address: Omit<SavedAddress, 'id'>) {
    const id = 'addr-' + Math.floor(1000 + Math.random() * 9000);
    const newAddress: SavedAddress = { ...address, id };
    if (newAddress.isDefault) {
      this.savedAddresses.update(list => list.map(a => ({ ...a, isDefault: false })));
    }
    this.savedAddresses.update(list => [...list, newAddress]);
  }

  deleteAddress(id: string) {
    this.savedAddresses.update(list => list.filter(a => a.id !== id));
  }

  setDefaultAddress(id: string) {
    this.savedAddresses.update(list => list.map(a => ({ ...a, isDefault: a.id === id })));
  }

  // Card Actions
  addCard(card: { cardHolder: string; rawCardNumber: string; expiryDate: string; brand?: 'visa' | 'mastercard' | 'unionpay'; isDefault?: boolean }) {
    const id = 'card-' + Math.floor(1000 + Math.random() * 9000);
    const masked = '•••• •••• •••• ' + card.rawCardNumber.slice(-4);
    const newCard: SavedCard = {
      id,
      cardHolder: card.cardHolder,
      cardNumber: masked,
      expiryDate: card.expiryDate,
      cardBrand: card.brand ?? 'visa',
      isDefault: card.isDefault ?? false
    };
    if (newCard.isDefault) {
      this.savedCards.update(list => list.map(c => ({ ...c, isDefault: false })));
    }
    this.savedCards.update(list => [...list, newCard]);
  }

  deleteCard(id: string) {
    this.savedCards.update(list => list.filter(c => c.id !== id));
  }

  setDefaultCard(id: string) {
    this.savedCards.update(list => list.map(c => ({ ...c, isDefault: c.id === id })));
  }

  requestReturn(orderId: string, items: ReturnRequestItem[]) {
    const requestedTitles = new Set(
      this.returns()
        .filter(request => request.orderId === orderId)
        .flatMap(request => request.items.map(item => item.itemTitle.trim().toLowerCase()))
    );
    const uniqueItems = items.filter(item => {
      const key = item.itemTitle.trim().toLowerCase();
      if (!key || requestedTitles.has(key)) return false;
      requestedTitles.add(key);
      return true;
    });
    if (uniqueItems.length === 0) return;
    const newReturn: ReturnRequest = {
      id: 'RET-' + Math.floor(1000 + Math.random() * 9000),
      orderId,
      date: new Date().toLocaleDateString('en-US', { month: 'short', day: '2-digit', year: 'numeric' }),
      items: [...uniqueItems],
      refundAmount: uniqueItems.reduce((total, item) => total + item.refundAmount, 0),
      status: 'Pending'
    };
    this.returns.update(list => [newReturn, ...list]);
  }

  private formatOrderDate(daysAgo: number): string {
    const date = new Date();
    date.setDate(date.getDate() - daysAgo);
    return date.toLocaleDateString('en-US', { month: 'short', day: '2-digit', year: 'numeric' });
  }
}
