import { Injectable, signal, computed } from '@angular/core';
import { CartItem, Product, ProductVariant } from '../models/product.model';

@Injectable({
  providedIn: 'root'
})
export class CartService {
  cartItems = signal<CartItem[]>([
    {
      product: {
        id: 101,
        title: 'Fresh Organic Guava',
        category: 'Ultra Fresh',
        categorySlug: 'ultra-fresh',
        brand: 'Rainbow Farm',
        price: 180,
        rating: 4.8,
        reviewCount: 34,
        image: 'assets/images/ultra_fresh/gwa.jpg',
        inStock: true
      },
      quantity: 2
    },
    {
      product: {
        id: 102,
        title: 'Pure Farm Milk Yogurt',
        category: 'Dairy',
        categorySlug: 'dairy-eggs',
        brand: 'Rainbow Dairy',
        price: 150,
        rating: 4.9,
        reviewCount: 52,
        image: 'assets/images/ultra_fresh/Yogurt.jpg',
        inStock: true
      },
      quantity: 1,
      variant: { id: '500g', label: '500 g', price: 150 }
    }
  ]);

  isCartOpen = signal<boolean>(false);

  cartCount = computed(() => {
    return this.cartItems().reduce((total, item) => total + item.quantity, 0);
  });

  cartTotal = computed(() => {
    return this.cartItems().reduce((total, item) => total + ((item.variant?.price ?? item.product.price) * item.quantity), 0);
  });

  private isSameItem(item: CartItem, productId: number, variantId?: string | null): boolean {
    const itemVarId = item.variant?.id ?? null;
    const targetVarId = variantId ?? null;
    return Number(item.product.id) === Number(productId) && itemVarId === targetVarId;
  }

  addToCart(product: Product, quantity: number = 1, variant?: ProductVariant) {
    const current = this.cartItems();
    const targetVarId = variant?.id ?? null;
    const existingIndex = current.findIndex(item => this.isSameItem(item, product.id, targetVarId));

    if (existingIndex > -1) {
      const updated = [...current];
      updated[existingIndex] = {
        ...updated[existingIndex],
        quantity: updated[existingIndex].quantity + quantity
      };
      this.cartItems.set(updated);
    } else {
      this.cartItems.set([...current, { product, quantity, ...(variant ? { variant } : {}) }]);
    }
  }

  removeFromCart(productId: number, variantId?: string | null) {
    this.cartItems.set(this.cartItems().filter(item => !this.isSameItem(item, productId, variantId)));
  }

  updateQuantity(productId: number, quantity: number, variantId?: string | null) {
    if (quantity <= 0) {
      this.removeFromCart(productId, variantId);
      return;
    }
    const updated = this.cartItems().map(item => {
      if (this.isSameItem(item, productId, variantId)) {
        return { ...item, quantity };
      }
      return item;
    });
    this.cartItems.set(updated);
  }

  saveOutOfStockInstruction(productId: number, choice: NonNullable<CartItem['outOfStockChoice']>, replacementProductIds: number[] = [], variantId?: string) {
    this.cartItems.update(items => items.map(item => item.product.id === productId && item.variant?.id === variantId
      ? { ...item, outOfStockChoice: choice, replacementProductIds: choice === 'specific' ? replacementProductIds.slice(0, 3) : [] }
      : item));
  }

  clearCart() {
    this.cartItems.set([]);
  }

  toggleCartDrawer() {
    this.isCartOpen.set(!this.isCartOpen());
  }

  openCartDrawer() {
    this.isCartOpen.set(true);
  }

  closeCartDrawer() {
    this.isCartOpen.set(false);
  }
}
