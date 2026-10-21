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
  lastFourDigits: string;
  expiryDate: string;
  brand: 'visa' | 'mastercard' | 'unionpay';
  isDefault: boolean;
}

export interface UserOrder {
  id: string;
  orderNumber: string;
  date: string;
  status: 'Delivered' | 'In Transit' | 'Processing' | 'Cancelled';
  totalAmount: number;
  itemCount: number;
  paymentMethod: string;
  items: {
    title: string;
    quantity: number;
    price: number;
    image: string;
  }[];
}

export interface ReturnRequest {
  id: string;
  orderId: string;
  itemTitle: string;
  reason: string;
  refundAmount: number;
  date: string;
  status: 'Pending Review' | 'Approved' | 'Completed' | 'Rejected';
}

export interface UserProfile {
  name: string;
  email: string;
  phone: string;
  avatarUrl?: string;
  walletBalance: number;
  joinedDate: string;
}
