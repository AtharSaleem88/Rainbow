export interface Product {
  id: number;
  title: string;
  subtitle?: string;
  category: string;
  categorySlug: string;
  subCategory?: string;
  brand: string;
  price: number;
  oldPrice?: number;
  discountPercent?: number;
  rating: number;
  reviewCount: number;
  image: string;
  galleryImages?: string[];
  description?: string;
  additionalInfo?: { [key: string]: string };
  variants?: ProductVariant[];
  badge?: string;
  tags?: string[];
  inStock: boolean;
  isDeal?: boolean;
  dealEndsIn?: string;
}

export interface ProductVariant {
  id: string;
  label: string;
  price: number;
  oldPrice?: number;
}

export interface Category {
  id: number;
  name: string;
  slug: string;
  icon?: string;
  image?: string;
  itemCount: number;
}

export interface CartItem {
  product: Product;
  quantity: number;
  variant?: ProductVariant;
  outOfStockChoice?: 'best-match' | 'specific' | 'refund';
  replacementProductIds?: number[];
}

export interface ProductFilter {
  category?: string;
  subCategory?: string;
  brand?: string;
  minPrice?: number;
  maxPrice?: number;
  rating?: number;
  sortBy?: 'featured' | 'price-low' | 'price-high' | 'rating' | 'newest';
  searchQuery?: string;
}
