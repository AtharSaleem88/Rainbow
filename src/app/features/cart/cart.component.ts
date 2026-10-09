import { Component, computed, effect, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { CartService } from '../../core/services/cart.service';
import { ProductService } from '../../core/services/product.service';
import { CartItem, Product } from '../../core/models/product.model';

@Component({
  selector: 'app-cart',
  standalone: true,
  imports: [CommonModule, RouterModule],
  templateUrl: './cart.component.html',
  styleUrls: ['./cart.component.scss']
})
export class CartComponent {
  readonly cartService = inject(CartService);
  private readonly productService = inject(ProductService);
  readonly instructionProductId = signal<number | null>(null);
  readonly instructionVariantId = signal<string | null>(null);
  readonly instructionChoice = signal<NonNullable<CartItem['outOfStockChoice']>>('best-match');
  readonly replacementIds = signal<number[]>([]);
  readonly hasUnavailableItems = computed(() => this.cartService.cartItems().some(item => !item.product.inStock));
  private readonly promptedUnavailable = new Set<string>();

  constructor() {
    effect(() => {
      const unavailable = this.cartService.cartItems().find(item => !item.product.inStock && !item.outOfStockChoice && !this.promptedUnavailable.has(this.itemKey(item)));
      if (unavailable) {
        this.promptedUnavailable.add(this.itemKey(unavailable));
        queueMicrotask(() => this.openInstructions(unavailable));
      }
    });
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

  replacementOptions(item: CartItem): Product[] {
    const available = this.productService.getProducts().filter(product => product.inStock && product.id !== item.product.id);
    const sameCategory = available.filter(product => product.categorySlug === item.product.categorySlug);
    const recommendations = [...sameCategory, ...available.filter(product => product.categorySlug !== item.product.categorySlug)];
    return recommendations.slice(0, 3);
  }

  openInstructions(item: CartItem) {
    this.instructionChoice.set(item.outOfStockChoice ?? 'best-match');
    this.replacementIds.set(item.replacementProductIds ?? []);
    this.instructionVariantId.set(item.variant?.id ?? null);
    this.instructionProductId.set(item.product.id);
  }

  closeInstructions() {
    this.instructionProductId.set(null);
  }

  setInstructionChoice(choice: NonNullable<CartItem['outOfStockChoice']>) {
    this.instructionChoice.set(choice);
  }

  toggleReplacement(productId: number) {
    const current = this.replacementIds();
    if (current.includes(productId)) {
      this.replacementIds.set(current.filter(id => id !== productId));
    } else if (current.length < 3) {
      this.replacementIds.set([...current, productId]);
    }
  }

  saveInstructions() {
    const productId = this.instructionProductId();
    if (productId === null) return;
    if (this.instructionChoice() === 'specific' && this.replacementIds().length === 0) return;
    this.cartService.saveOutOfStockInstruction(productId, this.instructionChoice(), this.replacementIds(), this.instructionVariantId() ?? undefined);
    this.closeInstructions();
  }

  selectedInstructionItem(): CartItem | undefined {
    const id = this.instructionProductId();
    return this.cartService.cartItems().find(item => item.product.id === id && (item.variant?.id ?? null) === this.instructionVariantId());
  }

  private itemKey(item: CartItem): string { return `${item.product.id}:${item.variant?.id ?? 'default'}`; }
}
