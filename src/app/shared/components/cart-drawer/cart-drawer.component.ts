import { Component, computed, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { CartService } from '../../../core/services/cart.service';
import { LoyaltyService } from '../../../core/services/loyalty.service';
import { CartItem } from '../../../core/models/product.model';

@Component({
  selector: 'app-cart-drawer',
  standalone: true,
  imports: [CommonModule, RouterModule],
  templateUrl: './cart-drawer.component.html',
  styleUrls: ['./cart-drawer.component.scss']
})
export class CartDrawerComponent {
  readonly cartService = inject(CartService);
  readonly loyaltyService = inject(LoyaltyService);

  readonly totalSavings = computed(() => this.cartService.cartItems().reduce((total, item) => {
    const price = item.variant?.price ?? item.product.price;
    const originalPrice = Math.max(item.variant?.oldPrice ?? item.product.oldPrice ?? price, price);
    return total + (originalPrice - price) * item.quantity;
  }, 0));

  onClose() {
    this.cartService.closeCartDrawer();
  }

  updateQty(productId: number, qty: number, variantId?: string) {
    this.cartService.updateQuantity(productId, qty, variantId);
  }

  removeItem(productId: number, variantId?: string) {
    this.cartService.removeFromCart(productId, variantId);
  }

  trackByCartItem = (_index: number, item: CartItem): string => this.itemKey(item);

  private itemKey(item: CartItem): string { return `${item.product.id}:${item.variant?.id ?? 'default'}`; }
}
