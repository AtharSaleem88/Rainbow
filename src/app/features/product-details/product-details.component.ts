import { Component, inject, signal, OnInit, computed } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, RouterModule, Router } from '@angular/router';
import { ProductService } from '../../core/services/product.service';
import { CartService } from '../../core/services/cart.service';
import { ProductCardComponent } from '../../shared/components/product-card/product-card.component';
import { Product, ProductVariant } from '../../core/models/product.model';

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
  route = inject(ActivatedRoute);
  router = inject(Router);

  product = signal<Product | null>(null);
  selectedImage = signal<string>('');
  selectedVariantId = signal<string | null>(null);
  quantity = signal<number>(1);
  activeTab = signal<'desc' | 'info'>('desc');
  relatedProducts = signal<Product[]>([]);

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

  selectVariant(variantId: string) {
    this.selectedVariantId.set(variantId);
  }

  incQty() {
    this.quantity.update(q => q + 1);
  }

  decQty() {
    if (this.quantity() > 1) {
      this.quantity.update(q => q - 1);
    }
  }

  addToCart() {
    if (this.product()) {
      this.cartService.addToCart(this.product()!, this.quantity(), this.selectedVariant);
    }
  }

  buyNow() {
    if (this.product()) {
      this.cartService.addToCart(this.product()!, this.quantity(), this.selectedVariant);
      this.router.navigate(['/checkout']);
    }
  }
}
