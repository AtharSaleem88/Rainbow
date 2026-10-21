import { Component, Output, EventEmitter, ChangeDetectionStrategy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

@Component({
  selector: 'app-card-modal',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './card-modal.component.html',
  styleUrls: ['./card-modal.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class CardModalComponent {
  @Output() close = new EventEmitter<void>();
  @Output() saveCard = new EventEmitter<{
    cardHolder: string;
    rawCardNumber: string;
    expiryDate: string;
    brand: 'visa' | 'mastercard' | 'unionpay';
    isDefault: boolean;
  }>();

  form = {
    cardHolder: '',
    rawCardNumber: '',
    expiryDate: '',
    brand: 'visa' as 'visa' | 'mastercard' | 'unionpay',
    isDefault: false
  };

  onClose() {
    this.close.emit();
  }

  onSubmit() {
    if (!this.form.cardHolder.trim() || !this.form.rawCardNumber.trim() || !this.form.expiryDate.trim()) return;
    this.saveCard.emit({ ...this.form });
  }
}
