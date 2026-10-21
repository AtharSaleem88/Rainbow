/**
 * Core Application Configuration & Global Constants
 */
export const APP_CONFIG = {
  appName: 'Rainbow Cash & Carry',
  tagline: 'Fresh Groceries Delivered in 30 Minutes',
  defaultCurrency: 'PKR',
  currencySymbol: 'Rs.',
  defaultCity: 'Lahore',
  defaultBranch: 'Bahria Town Branch (Lahore)',
  branches: [
    'Bahria Town Branch (Lahore)',
    'Gulberg Branch (Lahore)',
    'DHA Phase 5 Branch (Lahore)'
  ] as const,
  support: {
    phone: '+92 300 1234567',
    whatsapp: '923001234567',
    email: 'support@rainbowcashcarry.pk',
    hours: '8:00 AM - 11:00 PM Daily'
  },
  delivery: {
    standardDeliveryFee: 0,
    freeDeliveryThreshold: 0,
    estimatedMinutes: 30
  },
  storageKeys: {
    cart: 'rainbow_cart_v1',
    user: 'rainbow_user_profile_v1',
    tipPrefix: 'rainbow-rider-tip-v1:',
    loyaltyPrefix: 'rainbow_loyalty_v1:'
  }
} as const;

export type AppConfig = typeof APP_CONFIG;
