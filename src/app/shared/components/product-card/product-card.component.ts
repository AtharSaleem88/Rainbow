import { Component, Input, Output, EventEmitter, ElementRef, inject, signal, OnChanges, SimpleChanges } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { Product, ProductVariant } from '../../../core/models/product.model';
import { CartService } from '../../../core/services/cart.service';
import { AlternateModalService } from '../../../core/services/alternate-modal.service';
import { ToastService } from '../../../core/services/toast.service';
import { WishlistService } from '../../../core/services/wishlist.service';

@Component({
  selector: 'app-product-card',
  standalone: true,
  imports: [CommonModule, RouterModule],
  templateUrl: './product-card.component.html',
  styleUrls: ['./product-card.component.scss']
})
export class ProductCardComponent implements OnChanges {
  @Input({ required: true }) product!: Product;
  @Input() viewMode: 'grid' | 'list' = 'grid';
  @Input() sectionLabel = '';
  @Input() showSectionLabel = true;
  @Input() showTopSellingBadge = false;
  @Input() compactMobile = false;
  @Input() allowRemovingUnavailableFavorite = false;
  @Output() quickView = new EventEmitter<Product>();

  cartService = inject(CartService);
  alternateModalService = inject(AlternateModalService);
  private toastService = inject(ToastService);
  private host: ElementRef<HTMLElement> = inject(ElementRef);
  private wishlist = inject(WishlistService);
  favorite(): boolean { return this.wishlist.has(this.product.id); }
  selectedVariantId = signal<string | null>(null);
  variantOptionsOpen = signal(false);
  private addAfterVariantSelection = false;

  openAlternateModal(event?: Event) {
    if (event) {
      event.stopPropagation();
      event.preventDefault();
    }
    this.alternateModalService.open(this.product);
  }

  ngOnChanges(changes: SimpleChanges) {
    if (changes['product']) this.selectedVariantId.set(this.product.variants?.[0]?.id ?? null);
  }

  get sectionTag(): string {
    if (this.sectionLabel) return this.sectionLabel;
    if (['ultra-fresh', 'organic-veggies'].includes(this.product.categorySlug)) return 'Fresh From Farm';
    if (this.product.categorySlug === 'frozen-food') return 'Frozen Food Section';
    return 'Rainbow Finds';
  }

  get displayTags(): string[] {
    if (this.product.tags && this.product.tags.length) return this.product.tags.slice(0, 3);
    if (this.product.categorySlug === 'frozen-food') {
      return ['Freezed', 'Life 10 days', 'Lower than Imtiaz'];
    }
    if (['ultra-fresh', 'organic-veggies'].includes(this.product.categorySlug)) {
      return ['Farm Fresh', '100% Organic', 'Guaranteed Quality'];
    }
    return ['Best Price', 'Same Day Delivery', 'Rainbow Certified'];
  }

  get selectedVariant(): ProductVariant | undefined {
    return this.product.variants?.find(variant => variant.id === this.selectedVariantId()) ?? this.product.variants?.[0];
  }

  get displayPrice(): number {
    return this.selectedVariant?.price ?? this.product.price;
  }

  get displayOldPrice(): number | undefined {
    const oldPrice = this.selectedVariant?.oldPrice ?? (!this.selectedVariant ? this.product.oldPrice : undefined);
    return oldPrice && oldPrice > this.displayPrice ? oldPrice : undefined;
  }

  get displayDiscountPercent(): number | undefined {
    const oldPrice = this.displayOldPrice;
    return oldPrice ? Math.round(((oldPrice - this.displayPrice) / oldPrice) * 100) : undefined;
  }

  get cartQuantity(): number {
    return this.cartService.cartItems().find(item => item.product.id === this.product.id && item.variant?.id === this.selectedVariant?.id)?.quantity ?? 0;
  }

  onVariantChange(event: Event) {
    event.preventDefault();
    event.stopPropagation();
    const target = event.target as HTMLSelectElement;
    if (target && target.value) {
      this.selectedVariantId.set(target.value);
    }
  }

  selectVariant(event: Event, variantId: string) {
    event.preventDefault();
    event.stopPropagation();
    const changed = this.selectedVariantId() !== variantId;
    const shouldAdd = this.addAfterVariantSelection;
    this.selectedVariantId.set(variantId);
    this.closeVariantDialog();
    if (shouldAdd) {
      const variant = this.product.variants?.find(item => item.id === variantId);
      if (variant) {
        this.cartService.addToCart(this.product, 1, variant);
        this.toastService.show(`${this.product.title} added to your cart.`);
      }
    } else if (changed) {
      const variant = this.product.variants?.find(item => item.id === variantId);
      if (variant) this.toastService.show(`${variant.label} selected for ${this.product.title}.`);
    }
  }

  toggleVariantOptions(event: MouseEvent) {
    event.preventDefault();
    event.stopPropagation();
    this.openVariantDialog();
  }

  private openVariantDialog(): void {
    const dialog = this.host.nativeElement.querySelector<HTMLDialogElement>('.rh-variant-dialog');
    if (!dialog || dialog.open || dialog.hasAttribute('open')) return;
    try {
      if (typeof dialog.showModal === 'function') dialog.showModal();
      else { dialog.classList.add('is-fallback'); dialog.setAttribute('open', ''); }
    } catch {
      dialog.classList.add('is-fallback');
      dialog.setAttribute('open', '');
    }
    this.variantOptionsOpen.set(dialog.open || dialog.hasAttribute('open'));
  }

  closeVariantDialog() {
    const dialog = this.host.nativeElement.querySelector<HTMLDialogElement>('.rh-variant-dialog');
    if (dialog && (dialog.open || dialog.hasAttribute('open'))) {
      if (dialog.classList.contains('is-fallback')) { dialog.removeAttribute('open'); dialog.classList.remove('is-fallback'); }
      else dialog.close();
    }
    this.variantOptionsOpen.set(false);
    this.addAfterVariantSelection = false;
  }

  closeVariantBackdrop(event: MouseEvent) {
    if (event.target === event.currentTarget) this.closeVariantDialog();
  }

  onVariantDialogClosed(): void {
    this.variantOptionsOpen.set(false);
    this.addAfterVariantSelection = false;
  }

  addToCart(event: Event) {
    event.stopPropagation();
    event.preventDefault();
    if (typeof window !== 'undefined' && window.matchMedia('(max-width: 767px)').matches && (this.product.variants?.length ?? 0) > 1) {
      this.addAfterVariantSelection = true;
      this.openVariantDialog();
      return;
    }
    this.cartService.addToCart(this.product, 1, this.selectedVariant);
    this.toastService.show(`${this.product.title} added to your cart.`);
  }

  changeQuantity(event: Event, change: -1 | 1) {
    event.stopPropagation();
    event.preventDefault();
    if (change > 0 && typeof window !== 'undefined' && window.matchMedia('(max-width: 767px)').matches && (this.product.variants?.length ?? 0) > 1) {
      this.addAfterVariantSelection = true;
      this.openVariantDialog();
      return;
    }
    this.cartService.updateQuantity(this.product.id, this.cartQuantity + change, this.selectedVariant?.id);
    this.toastService.show('Cart quantity updated.');
  }

  toggleFavorite(event: Event) {
    event.stopPropagation();
    event.preventDefault();
    const added = this.wishlist.toggle(this.product.id);
    this.toastService.show(added ? 'Added to your wishlist.' : 'Removed from your wishlist.');
  }

  onQuickView(event: Event) {
    event.stopPropagation();
    event.preventDefault();
    this.quickView.emit(this.product);
  }
}
