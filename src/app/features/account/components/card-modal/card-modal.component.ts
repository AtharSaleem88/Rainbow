import { Component, Output, EventEmitter, ChangeDetectionStrategy, ElementRef, HostListener, ViewChild } from '@angular/core';
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
  @ViewChild('networkControl') networkControl!: ElementRef<HTMLElement>;

  readonly cardNetworks: Array<{ value: 'visa' | 'mastercard' | 'unionpay'; label: string }> = [
    { value: 'visa', label: 'Visa' },
    { value: 'mastercard', label: 'Mastercard' },
    { value: 'unionpay', label: 'UnionPay' }
  ];
  networkMenuOpen = false;

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

  get selectedNetworkLabel(): string {
    return this.cardNetworks.find(network => network.value === this.form.brand)?.label ?? 'Visa';
  }

  toggleNetworkMenu(): void {
    this.networkMenuOpen = !this.networkMenuOpen;
  }

  selectNetwork(network: 'visa' | 'mastercard' | 'unionpay'): void {
    this.form.brand = network;
    this.networkMenuOpen = false;
    this.networkControl.nativeElement.querySelector('button')?.focus();
  }

  @HostListener('document:click', ['$event'])
  closeNetworkMenuOnOutsideClick(event: MouseEvent): void {
    if (this.networkMenuOpen && !this.networkControl.nativeElement.contains(event.target as Node)) {
      this.networkMenuOpen = false;
    }
  }

  @HostListener('document:keydown.escape')
  closeNetworkMenuOnEscape(): void {
    if (this.networkMenuOpen) {
      this.networkMenuOpen = false;
      this.networkControl.nativeElement.querySelector('button')?.focus();
    }
  }

  onClose() {
    this.close.emit();
  }

  onSubmit() {
    if (!this.form.cardHolder.trim() || !this.form.rawCardNumber.trim() || !this.form.expiryDate.trim()) return;
    this.saveCard.emit({ ...this.form });
  }
}
