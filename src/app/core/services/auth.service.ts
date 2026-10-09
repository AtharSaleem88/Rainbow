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
  }>;
}

export interface ReturnRequest {
  id: string;
  orderId: string;
  date: string;
  itemTitle: string;
  reason: string;
  refundAmount: number;
  status: 'Approved' | 'Pending' | 'Rejected';
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
      id: 'RH-98234',
      date: 'Oct 06, 2026',
      itemsCount: 3,
      totalAmount: 1850,
      status: 'Delivered',
      paymentMethod: 'Rainbow Wallet',
      items: [
        { title: 'Fresh Organic Guava', image: 'assets/images/ultra_fresh/gwa.jpg', quantity: 2, price: 180 },
        { title: 'Pure Farm Milk Yogurt', image: 'assets/images/ultra_fresh/Yogurt.jpg', quantity: 1, price: 150 },
        { title: 'Olpers Milk 1L', image: 'assets/images/grocery/olpers.jpg', quantity: 3, price: 440 }
      ]
    },
    {
      id: 'RH-88942',
      date: 'Oct 02, 2026',
      itemsCount: 1,
      totalAmount: 950,
      status: 'Delivered',
      paymentMethod: 'Cash on Delivery',
      items: [
        { title: 'National Cooking Oil 5L', image: 'assets/images/grocery/oil.jpg', quantity: 1, price: 950 }
      ]
    },
    {
      id: 'RH-77120',
      date: 'Sep 28, 2026',
      itemsCount: 2,
      totalAmount: 620,
      status: 'In Transit',
      paymentMethod: 'JazzCash Wallet',
      items: [
        { title: 'Knorr Noodles Chicken Pack', image: 'assets/images/grocery/noodles.jpg', quantity: 2, price: 310 }
      ]
    }
  ]);

  // Returns Requests
  readonly returns = signal<ReturnRequest[]>([
    {
      id: 'RET-1042',
      orderId: 'RH-88942',
      date: 'Oct 03, 2026',
      itemTitle: 'National Cooking Oil 5L',
      reason: 'Packaging Seal Damaged',
      refundAmount: 950,
      status: 'Approved'
    }
  ]);

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

  requestReturn(orderId: string, itemTitle: string, reason: string, refundAmount: number) {
    const newReturn: ReturnRequest = {
      id: 'RET-' + Math.floor(1000 + Math.random() * 9000),
      orderId,
      date: new Date().toLocaleDateString('en-US', { month: 'short', day: '2-digit', year: 'numeric' }),
      itemTitle,
      reason,
      refundAmount,
      status: 'Pending'
    };
    this.returns.update(list => [newReturn, ...list]);
  }
}
