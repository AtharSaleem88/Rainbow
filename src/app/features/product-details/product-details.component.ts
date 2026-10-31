import { Component, inject, signal, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, RouterModule, Router } from '@angular/router';
import { ProductService } from '../../core/services/product.service';
import { CartService } from '../../core/services/cart.service';
import { AlternateModalService } from '../../core/services/alternate-modal.service';
import { SeoService } from '../../core/services/seo.service';
import { ProductCardComponent } from '../../shared/components/product-card/product-card.component';
import { CartItem, Product, ProductVariant } from '../../core/models/product.model';

@Component({
  selector: 'app-product-details',
  standalone: true,
  imports: [CommonModule, RouterModule, ProductCardComponent],
  templateUrl: './product-details.component.html',
  styleUrls: ['./product-details.component.scss']
})
export class ProductDetailsComponent implements OnInit {
  productService = inject(ProductService);
  cartService = inject(CartService);
  alternateModalService = inject(AlternateModalService);
  seoService = inject(SeoService);
  route = inject(ActivatedRoute);
  router = inject(Router);

  openAlternateModal() {
    const prod = this.product();
    if (prod) {
      this.alternateModalService.open(prod);
    }
  }

  product = signal<Product | null>(null);
  selectedImage = signal<string>('');
  selectedVariantId = signal<string | null>(null);
  quantity = signal<number>(1);
  activeTab = signal<'desc' | 'info'>('desc');
  relatedProducts = signal<Product[]>([]);
  specialInstructions = signal<string>('');
  readonly maxInstructionLength = 150;

  ngOnInit() {
    this.route.params.subscribe(params => {
      const id = Number(params['id']);
      const found = this.productService.getProductById(id) || this.productService.getProducts()[0];
      if (found) {
        this.product.set(found);
        this.selectedImage.set(found.image);
        this.selectedVariantId.set(found.variants?.[0]?.id ?? null);
        this.relatedProducts.set(
          this.productService.getProducts({ category: found.categorySlug }).filter(p => p.id !== found.id)
        );
        const inCart = this.currentCartItem;
        this.specialInstructions.set(inCart?.instruction ?? '');
        this.seoService.setPageTitle(`${found.title} — Online Grocery`);
        if (found.description) {
          this.seoService.setMetaDescription(found.description);
        }
      }
    });
  }

  get selectedVariant(): ProductVariant | undefined {
    return this.product()?.variants?.find(v => v.id === this.selectedVariantId()) ?? this.product()?.variants?.[0];
  }

  get currentPrice(): number {
    return this.selectedVariant?.price ?? this.product()?.price ?? 0;
  }

  get currentOldPrice(): number | undefined {
    const oldPrice = this.selectedVariant?.oldPrice ?? (!this.selectedVariant ? this.product()?.oldPrice : undefined);
    return oldPrice && oldPrice > this.currentPrice ? oldPrice : undefined;
  }

  get displayTags(): string[] {
    const p = this.product();
    if (!p) return [];
    if (p.tags && p.tags.length) return p.tags.slice(0, 3);
    if (p.categorySlug === 'frozen-food') {
      return ['Freezed', 'Life 10 days', 'Lower than Imtiaz'];
    }
    if (['ultra-fresh', 'organic-veggies'].includes(p.categorySlug)) {
      return ['Farm Fresh', '100% Organic', 'Guaranteed Quality'];
    }
    return ['Best Price', 'Same Day Delivery', 'Rainbow Certified'];
  }

  selectThumb(img: string) {
    this.selectedImage.set(img);
  }

  get currentCartItem(): CartItem | undefined {
    const prod = this.product();
    if (!prod) return undefined;
    const targetVarId = this.selectedVariant?.id ?? null;
    return this.cartService.cartItems().find(item =>
      Number(item.product.id) === Number(prod.id) && (item.variant?.id ?? null) === targetVarId
    );
  }

  selectVariant(variantId: string) {
    this.selectedVariantId.set(variantId);
    const inCart = this.currentCartItem;
    if (inCart?.instruction !== undefined) {
      this.specialInstructions.set(inCart.instruction);
    }
  }

  onInstructionInput(event: Event) {
    const input = event.target as HTMLTextAreaElement;
    const val = input.value.slice(0, this.maxInstructionLength);
    this.specialInstructions.set(val);
    const prod = this.product();
    if (prod && this.cartQuantity > 0) {
      this.cartService.updateInstruction(prod.id, val, this.selectedVariant?.id);
    }
  }

  get cartQuantity(): number {
    return this.currentCartItem?.quantity ?? 0;
  }

  addToCart() {
    const prod = this.product();
    if (prod) {
      this.cartService.addToCart(prod, 1, this.selectedVariant, undefined, this.specialInstructions());
    }
  }

  changeQuantity(delta: number) {
    const prod = this.product();
    if (!prod) return;
    const newQty = this.cartQuantity + delta;
    this.cartService.updateQuantity(prod.id, newQty, this.selectedVariant?.id);
  }

  buyNow() {
    const prod = this.product();
    if (prod) {
      if (this.cartQuantity === 0) {
        this.cartService.addToCart(prod, 1, this.selectedVariant, undefined, this.specialInstructions());
      } else if (this.specialInstructions()) {
        this.cartService.updateInstruction(prod.id, this.specialInstructions(), this.selectedVariant?.id);
      }
      this.router.navigate(['/checkout']);
    }
  }
}
