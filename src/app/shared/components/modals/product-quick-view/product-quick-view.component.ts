import { Component, Input, Output, EventEmitter, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Product } from '../../../../core/models/product.model';
import { CartService } from '../../../../core/services/cart.service';

@Component({
  selector: 'app-product-quick-view',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './product-quick-view.component.html',
  styleUrls: ['./product-quick-view.component.scss']
})
export class ProductQuickViewComponent {
  @Input() product: Product | null = null;
  @Output() close = new EventEmitter<void>();

  cartService = inject(CartService);
  quantity = 1;

  onClose() {
    this.close.emit();
  }

  addToCart() {
    if (this.product) {
      this.cartService.addToCart(this.product, this.quantity);
      this.onClose();
    }
  }

  incQty() { this.quantity++; }
  decQty() { if (this.quantity > 1) this.quantity--; }
}
