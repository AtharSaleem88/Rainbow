import { Component, inject, signal, ElementRef, ViewChild, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule, Router } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { AuthService, SavedAddress, SavedCard } from '../../core/services/auth.service';
import { LoyaltyService } from '../../core/services/loyalty.service';
import { SeoService } from '../../core/services/seo.service';
import { AddressModalComponent } from './components/address-modal/address-modal.component';
import { CardModalComponent } from './components/card-modal/card-modal.component';
import { ReturnModalComponent } from './components/return-modal/return-modal.component';

@Component({
  selector: 'app-account',
  standalone: true,
  imports: [CommonModule, RouterModule, FormsModule, AddressModalComponent, CardModalComponent, ReturnModalComponent],
  templateUrl: './account.component.html',
  styleUrls: ['./account.component.scss']
})
export class AccountComponent implements OnInit {
  readonly authService = inject(AuthService);
  readonly loyaltyService = inject(LoyaltyService);
  readonly seoService = inject(SeoService);
  readonly router = inject(Router);

  @ViewChild('accountMainContent') accountMainContent?: ElementRef<HTMLElement>;

  activeTab = signal<'orders' | 'wallet' | 'loyalty' | 'addresses' | 'cards' | 'settings' | 'returns'>('orders');

  // New Address Modal State
  isAddressModalOpen = signal<boolean>(false);

  // New Card Modal State
  isCardModalOpen = signal<boolean>(false);

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

  ngOnInit(): void {
    this.seoService.setPageTitle('My Account');
    this.seoService.setMetaDescription('Manage your Rainbow Cash & Carry account, orders, addresses, loyalty points and wallet.');
  }

  setActiveTab(tab: 'orders' | 'wallet' | 'loyalty' | 'addresses' | 'cards' | 'settings' | 'returns') {
    this.activeTab.set(tab);
    if (window.innerWidth < 992 && this.accountMainContent?.nativeElement) {
      setTimeout(() => {
        this.accountMainContent?.nativeElement.scrollIntoView({ behavior: 'smooth', block: 'start' });
      }, 50);
    }
  }

  // Address Handlers
  openAddressModal() {
    this.isAddressModalOpen.set(true);
  }

  closeAddressModal() {
    this.isAddressModalOpen.set(false);
  }

  submitAddress(data: Omit<SavedAddress, 'id'>) {
    this.authService.addAddress(data);
    this.closeAddressModal();
  }

  deleteAddress(id: string) {
    this.authService.deleteAddress(id);
  }

  setDefaultAddress(id: string) {
    this.authService.setDefaultAddress(id);
  }

  // Card Handlers
  openCardModal() {
    this.isCardModalOpen.set(true);
  }

  closeCardModal() {
    this.isCardModalOpen.set(false);
  }

  submitCard(data: { cardHolder: string; rawCardNumber: string; expiryDate: string; brand: 'visa' | 'mastercard' | 'unionpay'; isDefault: boolean }) {
    this.authService.addCard(data);
    this.closeCardModal();
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

  submitReturnRequest(data: { orderId: string; itemTitle: string; reason: string; refundAmount: number }) {
    this.authService.requestReturn(
      data.orderId,
      data.itemTitle,
      data.reason,
      data.refundAmount
    );
    this.closeReturnModal();
    this.setActiveTab('returns');
  }

  onLogout() {
    this.authService.logout();
    this.router.navigate(['/login']);
  }
}
