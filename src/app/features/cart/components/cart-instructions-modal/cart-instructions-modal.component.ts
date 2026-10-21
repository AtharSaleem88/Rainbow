import { Component, Input, Output, EventEmitter, ChangeDetectionStrategy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { CartItem, Product } from '../../../../core/models/product.model';

@Component({
  selector: 'app-cart-instructions-modal',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './cart-instructions-modal.component.html',
  styleUrls: ['./cart-instructions-modal.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class CartInstructionsModalComponent {
  @Input() selectedItem?: CartItem;
  @Input() replacementOptions: Product[] = [];
  @Input() choice: NonNullable<CartItem['outOfStockChoice']> = 'best-match';
  @Input() replacementIds: number[] = [];

  @Output() close = new EventEmitter<void>();
  @Output() choiceChange = new EventEmitter<NonNullable<CartItem['outOfStockChoice']>>();
  @Output() toggleReplacement = new EventEmitter<number>();
  @Output() save = new EventEmitter<void>();

  onClose() {
    this.close.emit();
  }

  onChoiceChange(choice: NonNullable<CartItem['outOfStockChoice']>) {
    this.choiceChange.emit(choice);
  }

  onToggleReplacement(productId: number) {
    this.toggleReplacement.emit(productId);
  }

  onSave() {
    this.save.emit();
  }
}
