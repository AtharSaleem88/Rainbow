import { Component, Output, EventEmitter, ChangeDetectionStrategy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { SavedAddress } from '../../../../core/models/user.model';

@Component({
  selector: 'app-address-modal',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './address-modal.component.html',
  styleUrls: ['./address-modal.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class AddressModalComponent {
  @Output() close = new EventEmitter<void>();
  @Output() saveAddress = new EventEmitter<Omit<SavedAddress, 'id'>>();

  form = {
    label: 'Home' as 'Home' | 'Office' | 'Other',
    recipientName: '',
    phone: '',
    addressLine: '',
    city: 'Lahore',
    isDefault: false
  };

  onClose() {
    this.close.emit();
  }

  onSubmit() {
    if (!this.form.recipientName.trim() || !this.form.addressLine.trim()) return;
    this.saveAddress.emit({ ...this.form });
  }
}
