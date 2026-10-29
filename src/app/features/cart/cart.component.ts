import { Component, computed, inject, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { CartService } from '../../core/services/cart.service';
import { LoyaltyService } from '../../core/services/loyalty.service';
import { ProductService } from '../../core/services/product.service';
import { SeoService } from '../../core/services/seo.service';
import { CartItem } from '../../core/models/product.model';

@Component({
  selector: 'app-cart',
  standalone: true,
  imports: [CommonModule, RouterModule],
  templateUrl: './cart.component.html',
  styleUrls: ['./cart.component.scss']
})
export class CartComponent implements OnInit {
  readonly cartService = inject(CartService);
  readonly loyaltyService = inject(LoyaltyService);
  private readonly productService = inject(ProductService);
  private readonly seoService = inject(SeoService);

  ngOnInit(): void {
    this.seoService.setPageTitle('Shopping Cart');
    this.seoService.setMetaDescription('Review items in your Rainbow Cash & Carry cart and proceed to checkout.');
  }

  readonly itemsOriginalTotal = computed(() => this.cartService.cartItems().reduce((total, item) => {
    const price = item.variant?.price ?? item.product.price;
    const originalPrice = Math.max(item.variant?.oldPrice ?? item.product.oldPrice ?? price, price);
    return total + originalPrice * item.quantity;
  }, 0));

  readonly totalSavings = computed(() => Math.max(0, this.itemsOriginalTotal() - this.cartService.cartTotal()));

  updateQty(productId: number, qty: number, variantId?: string) {
    this.cartService.updateQuantity(productId, qty, variantId);
  }

  removeItem(productId: number, variantId?: string) {
    this.cartService.removeFromCart(productId, variantId);
  }

  clearAll() {
    this.cartService.clearCart();
  }

  trackByCartItem = (_index: number, item: CartItem): string => this.itemKey(item);

  private itemKey(item: CartItem): string { return `${item.product.id}:${item.variant?.id ?? 'default'}`; }
}
