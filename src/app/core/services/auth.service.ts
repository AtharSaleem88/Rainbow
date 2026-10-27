import { Injectable, signal, computed } from '@angular/core';

export interface UserProfile {
  name: string;
  email: string;
  phone: string;
  address: string;
  city: string;
  avatar?: string;
  memberSince: string;
}

export interface SavedAddress {
  id: string;
  label: 'Home' | 'Office' | 'Other';
  recipientName: string;
  phone: string;
  addressLine: string;
  city: string;
  isDefault: boolean;
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
  status: 'Delivered' | 'In Transit' | 'Processing' | 'Cancelled';
  paymentMethod: string;
  items: Array<{
    title: string;
    image: string;
    quantity: number;
    price: number;
    categorySlug?: string;
  }>;
}

export interface ReturnRequestItem {
  itemTitle: string;
  reason: string;
  refundAmount: number;
}

export interface ReturnRequest {
  id: string;
  orderId: string;
  date: string;
  items: ReturnRequestItem[];
  refundAmount: number;
  status: 'Approved' | 'Pending' | 'Rejected';
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
  readonly isLoggedIn = signal<boolean>(true); // Default to true for demo experience

  // User Profile Data
  readonly userProfile = signal<UserProfile>({
    name: 'Muhammad Athar',
    email: 'athar.saleem@example.com',
    phone: '+92 300 1234567',
    address: 'House #42, Block C, Bahria Town',
    city: 'Lahore',
    memberSince: 'Oct 2024'
  });

  // Saved Delivery Addresses
  readonly savedAddresses = signal<SavedAddress[]>([
    {
      id: 'addr-1',
      label: 'Home',
      recipientName: 'Muhammad Athar',
      phone: '+92 300 1234567',
      addressLine: 'House #42, Block C, Bahria Town',
      city: 'Lahore',
      isDefault: true
    },
    {
      id: 'addr-2',
      label: 'Office',
      recipientName: 'Muhammad Athar',
      phone: '+92 321 7654321',
      addressLine: 'Floor 4, Software Park, Gulberg III',
      city: 'Lahore',
      isDefault: false
    }
  ]);

  // Saved Payment Cards
  readonly savedCards = signal<SavedCard[]>([
    {
      id: 'card-1',
      cardHolder: 'M Athar Saleem',
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
  readonly walletBalance = signal<number>(2500);

  // Orders History
  readonly orders = signal<UserOrder[]>([
    {
      id: 'RH-92842',
      date: 'Oct 27, 2026',
      itemsCount: 3,
      totalAmount: 750,
      status: 'Delivered',
      paymentMethod: 'Cash on Delivery',
      items: [
        { title: 'Fresh Organic Guava', image: 'assets/images/ultra_fresh/fresh-organic-guava.png', quantity: 1, price: 180, categorySlug: 'ultra-fresh' },
        { title: 'Pure Farm Milk Yogurt', image: 'assets/images/ultra_fresh/Yogurt.jpg', quantity: 1, price: 150, categorySlug: 'dairy-eggs' },
        { title: 'Farm Fresh Eggs', image: 'assets/images/ultra_fresh/grocerry-fresh-eggs.jpeg', quantity: 1, price: 420, categorySlug: 'dairy-eggs' }
      ]
    },
    {
      id: 'RH-98234',
      date: this.formatOrderDate(0),
      itemsCount: 3,
      totalAmount: 1850,
      status: 'Delivered',
      paymentMethod: 'Rainbow Wallet',
      items: [
        { title: 'Fresh Organic Guava', image: 'assets/images/ultra_fresh/fresh-organic-guava.png', quantity: 2, price: 180, categorySlug: 'ultra-fresh' },
        { title: 'Pure Farm Milk Yogurt', image: 'assets/images/ultra_fresh/Yogurt.jpg', quantity: 1, price: 150, categorySlug: 'dairy-eggs' },
        { title: 'Olpers Milk 1L', image: 'assets/images/grocery/olpers.jpg', quantity: 3, price: 440, categorySlug: 'dairy-eggs' }
      ]
    },
    {
      id: 'RH-92658',
      date: 'Oct 26, 2026',
      itemsCount: 2,
      totalAmount: 490,
      status: 'Delivered',
      paymentMethod: 'Rainbow Wallet',
      items: [
        { title: 'Fresh Carrots', image: 'assets/images/ultra_fresh/carrot.webp', quantity: 2, price: 90, categorySlug: 'ultra-fresh' },
        { title: 'Fresh Mushrooms', image: 'assets/images/ultra_fresh/mashroom.jpg', quantity: 1, price: 310, categorySlug: 'ultra-fresh' }
      ]
    },
    {
      id: 'RH-92761',
      date: 'Oct 26, 2026',
      itemsCount: 2,
      totalAmount: 660,
      status: 'Delivered',
      paymentMethod: 'Cash on Delivery',
      items: [
        { title: 'Fresh Organic Guava', image: 'assets/images/ultra_fresh/fresh-organic-guava.png', quantity: 2, price: 180, categorySlug: 'ultra-fresh' },
        { title: 'Pure Farm Milk Yogurt', image: 'assets/images/ultra_fresh/Yogurt.jpg', quantity: 2, price: 150, categorySlug: 'dairy-eggs' }
      ]
    },
    {
      id: 'RH-92510',
      date: 'Oct 25, 2026',
      itemsCount: 2,
      totalAmount: 330,
      status: 'Delivered',
      paymentMethod: 'Cash on Delivery',
      items: [
        { title: 'Fresh Organic Guava', image: 'assets/images/ultra_fresh/fresh-organic-guava.png', quantity: 1, price: 180, categorySlug: 'ultra-fresh' },
        { title: 'Pure Farm Milk Yogurt', image: 'assets/images/ultra_fresh/Yogurt.jpg', quantity: 1, price: 150, categorySlug: 'dairy-eggs' }
      ]
    },
    {
      id: 'RH-92406',
      date: 'Oct 24, 2026',
      itemsCount: 2,
      totalAmount: 660,
      status: 'Delivered',
      paymentMethod: 'Cash on Delivery',
      items: [
        { title: 'Curly Kale', image: 'assets/images/ultra_fresh/Curly-Kale.webp', quantity: 1, price: 240, categorySlug: 'ultra-fresh' },
        { title: 'Farm Fresh Eggs', image: 'assets/images/ultra_fresh/grocerry-fresh-eggs.jpeg', quantity: 1, price: 420, categorySlug: 'dairy-eggs' }
      ]
    },
    {
      id: 'RH-92376',
      date: 'Oct 23, 2026',
      itemsCount: 3,
      totalAmount: 720,
      status: 'Delivered',
      paymentMethod: 'Rainbow Wallet',
      items: [
        { title: 'Farm Fresh Eggs', image: 'assets/images/ultra_fresh/grocerry-fresh-eggs.jpeg', quantity: 1, price: 420, categorySlug: 'dairy-eggs' },
        { title: 'Fresh Carrots', image: 'assets/images/ultra_fresh/carrot.webp', quantity: 2, price: 90, categorySlug: 'ultra-fresh' },
        { title: 'Fresh Spinach', image: 'assets/images/ultra_fresh/Palak.jpg', quantity: 1, price: 120, categorySlug: 'ultra-fresh' }
      ]
    },
    {
      id: 'RH-88942',
      date: this.formatOrderDate(2),
      itemsCount: 1,
      totalAmount: 950,
      status: 'Delivered',
      paymentMethod: 'Cash on Delivery',
      items: [
        { title: 'National Cooking Oil 5L', image: 'assets/images/grocery/oil.jpg', quantity: 1, price: 950, categorySlug: 'cooking-essentials' }
      ]
    },
    {
      id: 'RH-77120',
      date: this.formatOrderDate(4),
      itemsCount: 2,
      totalAmount: 620,
      status: 'In Transit',
      paymentMethod: 'JazzCash Wallet',
      items: [
        { title: 'Knorr Noodles Chicken Pack', image: 'assets/images/grocery/noodles.jpg', quantity: 2, price: 310, categorySlug: 'instant-food' }
      ]
    }
  ]);

  // Returns Requests
  readonly returns = signal<ReturnRequest[]>([
    {
      id: 'RET-1042',
      orderId: 'RH-88942',
      date: 'Oct 03, 2026',
      items: [{ itemTitle: 'National Cooking Oil 5L', reason: 'Packaging Seal Damaged', refundAmount: 950 }],
      refundAmount: 950,
      status: 'Approved'
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

  login(email: string) {
    this.isLoggedIn.set(true);
    if (email) {
      this.userProfile.update(profile => ({ ...profile, email }));
    }
  }

  logout() {
    this.isLoggedIn.set(false);
  }

  topUpWallet(amount: number) {
    if (amount > 0) {
      this.walletBalance.update(bal => bal + amount);
    }
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
