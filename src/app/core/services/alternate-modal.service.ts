import { Injectable, signal, computed, inject } from '@angular/core';
import { Product } from '../models/product.model';
import { ProductService } from './product.service';
import { CartService } from './cart.service';

export interface AlternateSelection {
  type: 'alternate' | 'best-match';
  alternateProduct?: Product;
}

@Injectable({
  providedIn: 'root'
})
export class AlternateModalService {
  private productService = inject(ProductService);
  private cartService = inject(CartService);

  readonly selectedProduct = signal<Product | null>(null);
  readonly isOpen = signal<boolean>(false);

  // Choice in popup: 'alternate' or 'best-match'
  readonly currentChoice = signal<'alternate' | 'best-match'>('alternate');
  readonly selectedAlternateProductId = signal<number | null>(null);

  // Stored selections per out-of-stock product ID
  readonly productSelections = signal<Record<number, AlternateSelection>>({
    102: { type: 'best-match' }
  });

  // 6 in-stock products for the alternate grid
  readonly alternateProducts = computed<Product[]>(() => {
    const prod = this.selectedProduct();
    if (!prod) return [];

    const allInStock = this.productService.getProducts().filter(p => p.inStock && p.id !== prod.id);

    // 1. Matches from same subcategory
    const sameSub = prod.subCategory
      ? allInStock.filter(p => p.subCategory && p.subCategory.toLowerCase() === prod.subCategory!.toLowerCase())
      : [];

    // 2. Matches from same category
    const sameCat = allInStock.filter(p => p.categorySlug === prod.categorySlug && !sameSub.some(s => s.id === p.id));

    // 3. Other in-stock products as filler
    const others = allInStock.filter(p => p.categorySlug !== prod.categorySlug && !sameSub.some(s => s.id === p.id));

    return [...sameSub, ...sameCat, ...others].slice(0, 6);
  });

  open(product: Product) {
    this.selectedProduct.set(product);
    const existing = this.productSelections()[product.id];

    if (existing) {
      this.currentChoice.set(existing.type);
      this.selectedAlternateProductId.set(existing.alternateProduct?.id ?? null);
    } else {
      this.currentChoice.set('alternate');
      const alts = this.alternateProducts();
      this.selectedAlternateProductId.set(alts.length > 0 ? alts[0].id : null);
    }

    this.isOpen.set(true);
    if (typeof document !== 'undefined') {
      document.body.classList.add('modal-open');
    }
  }

  close() {
    this.isOpen.set(false);
    this.selectedProduct.set(null);
    if (typeof document !== 'undefined') {
      document.body.classList.remove('modal-open');
    }
  }

  setChoice(choice: 'alternate' | 'best-match') {
    this.currentChoice.set(choice);
    if (choice === 'alternate' && !this.selectedAlternateProductId()) {
      const alts = this.alternateProducts();
      if (alts.length > 0) {
        this.selectedAlternateProductId.set(alts[0].id);
      }
    }
  }

  selectAlternateProduct(alt: Product) {
    this.currentChoice.set('alternate');
    this.selectedAlternateProductId.set(alt.id);
  }

  confirmSelection() {
    const orig = this.selectedProduct();
    if (!orig) return;

    const choice = this.currentChoice();
    let selection: AlternateSelection;

    // Check if there was a previous selection for this product in cart
    const previous = this.productSelections()[orig.id];
    if (previous?.type === 'alternate' && previous.alternateProduct) {
      this.cartService.removeFromCart(previous.alternateProduct.id);
    } else if (previous?.type === 'best-match') {
      this.cartService.removeFromCart(orig.id);
    }

    if (choice === 'alternate') {
      const chosenAlt = this.alternateProducts().find(p => p.id === this.selectedAlternateProductId())
        || this.alternateProducts()[0];
      if (chosenAlt) {
        selection = { type: 'alternate', alternateProduct: chosenAlt };
        this.cartService.addToCart(chosenAlt, 1);
      } else {
        selection = { type: 'best-match' };
      this.cartService.addToCart(orig, 1, undefined, 'best-match');
      }
    } else {
      selection = { type: 'best-match' };
      this.cartService.addToCart(orig, 1, undefined, 'best-match');
    }

    // Save selection
    this.productSelections.update(map => ({
      ...map,
      [orig.id]: selection
    }));

    this.close();
    this.cartService.openCartDrawer();
  }

  getSelection(productId: number): AlternateSelection | undefined {
    return this.productSelections()[productId];
  }
}
