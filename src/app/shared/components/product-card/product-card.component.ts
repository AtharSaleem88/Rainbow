import { Component, Input, Output, EventEmitter, ElementRef, HostListener, inject, signal, OnChanges, SimpleChanges } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { Product, ProductVariant } from '../../../core/models/product.model';
import { CartService } from '../../../core/services/cart.service';
import { AlternateModalService } from '../../../core/services/alternate-modal.service';

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
  @Output() quickView = new EventEmitter<Product>();

  cartService = inject(CartService);
  alternateModalService = inject(AlternateModalService);
  private host = inject(ElementRef<HTMLElement>);
  favorite = signal(false);
  selectedVariantId = signal<string | null>(null);
  variantOptionsOpen = signal(false);
  variantPopupStyle = signal<Record<string, string>>({});

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
    this.selectedVariantId.set(variantId);
    this.variantOptionsOpen.set(false);
  }

  toggleVariantOptions(event: MouseEvent) {
    event.preventDefault();
    if (this.variantOptionsOpen()) {
      this.variantOptionsOpen.set(false);
      return;
    }

    const trigger = event.currentTarget as HTMLElement;
    const rect = trigger.getBoundingClientRect();
    const width = Math.min(250, window.innerWidth - 24);
    const itemCount = Math.min(this.product.variants?.length ?? 0, 4);
    const menuHeight = itemCount * 58 + 10;
    const topBelow = rect.bottom + 8;
    const top = topBelow + menuHeight <= window.innerHeight - 8
      ? topBelow
      : Math.max(8, rect.top - menuHeight - 8);
    const left = Math.max(12, Math.min(rect.right - width, window.innerWidth - width - 12));

    this.variantPopupStyle.set({ top: `${top}px`, left: `${left}px`, width: `${width}px` });
    this.variantOptionsOpen.set(true);
  }

  @HostListener('document:click', ['$event'])
  closeVariantOptionsOnOutsideClick(event: MouseEvent) {
    const target = event.target as Node | null;
    const selector = this.host.nativeElement.querySelector('.rh-shared-variant-select');
    if (!target || !selector?.contains(target)) this.variantOptionsOpen.set(false);
  }

  addToCart(event: Event) {
    event.stopPropagation();
    event.preventDefault();
    this.cartService.addToCart(this.product, 1, this.selectedVariant);
  }

  changeQuantity(event: Event, change: -1 | 1) {
    event.stopPropagation();
    event.preventDefault();
    this.cartService.updateQuantity(this.product.id, this.cartQuantity + change, this.selectedVariant?.id);
  }

  toggleFavorite(event: Event) {
    event.stopPropagation();
    event.preventDefault();
    this.favorite.update(value => !value);
  }

  onQuickView(event: Event) {
    event.stopPropagation();
    event.preventDefault();
    this.quickView.emit(this.product);
  }
}
