import { Component, inject, signal, ElementRef, ViewChild } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule, Router } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { AuthService } from '../../core/services/auth.service';

@Component({
  selector: 'app-account',
  standalone: true,
  imports: [CommonModule, RouterModule, FormsModule],
  templateUrl: './account.component.html',
  styleUrls: ['./account.component.scss']
})
export class AccountComponent {
  readonly authService = inject(AuthService);
  readonly router = inject(Router);

  @ViewChild('accountMainContent') accountMainContent?: ElementRef<HTMLElement>;

  activeTab = signal<'orders' | 'wallet' | 'addresses' | 'cards' | 'settings' | 'returns'>('orders');

  // New Address Modal State
  isAddressModalOpen = signal<boolean>(false);
  addressForm = {
    label: 'Home' as 'Home' | 'Office' | 'Other',
    recipientName: '',
    phone: '',
    addressLine: '',
    city: 'Lahore',
    isDefault: false
  };

  // New Card Modal State
  isCardModalOpen = signal<boolean>(false);
  cardForm = {
    cardHolder: '',
    rawCardNumber: '',
    expiryDate: '',
    brand: 'visa' as 'visa' | 'mastercard' | 'unionpay',
    isDefault: false
  };

  // Wallet Top-up state
  topUpAmount = signal<number>(1000);
  selectedTopUpMethod = signal<'jazzcash' | 'easypaisa' | 'card'>('jazzcash');

  // Profile Form Data
  profileForm = { ...this.authService.userProfile() };

  // New Return Modal State
  isReturnModalOpen = signal<boolean>(false);
  returnForm = {
    orderId: '',
    itemTitle: '',
    reason: 'Damaged item',
    refundAmount: 0
  };

  setActiveTab(tab: 'orders' | 'wallet' | 'addresses' | 'cards' | 'settings' | 'returns') {
    this.activeTab.set(tab);
    if (window.innerWidth < 992 && this.accountMainContent?.nativeElement) {
      setTimeout(() => {
        this.accountMainContent?.nativeElement.scrollIntoView({ behavior: 'smooth', block: 'start' });
      }, 50);
    }
  }

  // Address Handlers
  openAddressModal() {
    this.addressForm = {
      label: 'Home',
      recipientName: this.authService.userProfile().name,
      phone: this.authService.userProfile().phone,
      addressLine: '',
      city: 'Lahore',
      isDefault: false
    };
    this.isAddressModalOpen.set(true);
  }

  closeAddressModal() {
    this.isAddressModalOpen.set(false);
  }

  submitAddress() {
    if (this.addressForm.recipientName && this.addressForm.addressLine) {
      this.authService.addAddress(this.addressForm);
      this.closeAddressModal();
    }
  }

  deleteAddress(id: string) {
    this.authService.deleteAddress(id);
  }

  setDefaultAddress(id: string) {
    this.authService.setDefaultAddress(id);
  }

  // Card Handlers
  openCardModal() {
    this.cardForm = {
      cardHolder: this.authService.userProfile().name,
      rawCardNumber: '',
      expiryDate: '',
      brand: 'visa',
      isDefault: false
    };
    this.isCardModalOpen.set(true);
  }

  closeCardModal() {
    this.isCardModalOpen.set(false);
  }

  submitCard() {
    if (this.cardForm.cardHolder && this.cardForm.rawCardNumber.length >= 12) {
      this.authService.addCard(this.cardForm);
      this.closeCardModal();
    }
  }

  deleteCard(id: string) {
    this.authService.deleteCard(id);
  }

  setDefaultCard(id: string) {
    this.authService.setDefaultCard(id);
  }

  onSaveProfile() {
    this.authService.updateProfile(this.profileForm);
    alert('Account settings updated successfully!');
  }

  onTopUpWallet() {
    if (this.topUpAmount() > 0) {
      this.authService.topUpWallet(this.topUpAmount());
      alert(`Rs. ${this.topUpAmount()} added to your Rainbow Wallet!`);
    }
  }

  openReturnModal(orderId: string, itemTitle: string, price: number) {
    this.returnForm = {
      orderId,
      itemTitle,
      reason: 'Damaged or defective item',
      refundAmount: price
    };
    this.isReturnModalOpen.set(true);
  }

  closeReturnModal() {
    this.isReturnModalOpen.set(false);
  }

  submitReturnRequest() {
    if (this.returnForm.orderId && this.returnForm.itemTitle) {
      this.authService.requestReturn(
        this.returnForm.orderId,
        this.returnForm.itemTitle,
        this.returnForm.reason,
        this.returnForm.refundAmount
      );
      this.closeReturnModal();
      this.setActiveTab('returns');
    }
  }

  onLogout() {
    this.authService.logout();
    this.router.navigate(['/login']);
  }
}
