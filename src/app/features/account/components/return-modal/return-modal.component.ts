import { Component, Input, Output, EventEmitter, ChangeDetectionStrategy, HostListener, ChangeDetectorRef, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

@Component({
  selector: 'app-return-modal',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './return-modal.component.html',
  styleUrls: ['./return-modal.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class ReturnModalComponent {
  private readonly changeDetector = inject(ChangeDetectorRef);
  readonly reasonOptions = [
    'Damaged or defective item',
    'Expired or near expiry',
    'Wrong item delivered',
    'Quality not satisfactory'
  ];
  openReasonIndex: number | null = null;

  @Input({ required: true }) orderId: string = '';
  @Input({ required: true }) orderDate: string = '';
  @Input() items: Array<{ title: string; image: string; quantity: number; price: number; categorySlug?: string }> = [];
  @Input() returnedItemTitles: string[] = [];

  @Output() close = new EventEmitter<void>();
  @Output() submitReturn = new EventEmitter<{ orderId: string; items: Array<{ title: string; image: string; quantity: number; price: number; categorySlug?: string; reason: string; evidenceImage?: string }> }>();

  selectedItemIndices: number[] = [];
  itemReasons: Record<number, string> = {};
  itemEvidence: Record<number, string> = {};
  uploadErrors: Record<number, string> = {};

  get selectedItems(): Array<{ title: string; image: string; quantity: number; price: number; categorySlug?: string; reason: string; evidenceImage?: string }> {
    return this.selectedItemIndices
      .filter(index => this.items[index] && this.canSelectItem(this.items[index]))
      .map(index => ({ ...this.items[index], reason: this.itemReasons[index] ?? '', evidenceImage: this.itemEvidence[index] }));
  }

  onEvidenceChange(index: number, event: Event): void {
    const input = event.target as HTMLInputElement;
    const file = input.files?.[0];
    if (!file) return;
    if (!file.type.startsWith('image/') || file.size > 5 * 1024 * 1024) {
      this.uploadErrors[index] = 'Choose an image up to 5 MB.';
      input.value = '';
      return;
    }
    delete this.uploadErrors[index];
    const reader = new FileReader();
    reader.onload = () => { if (this.selectedItemIndices.includes(index)) this.itemEvidence[index] = String(reader.result); this.changeDetector.markForCheck(); };
    reader.readAsDataURL(file);
  }

  get refundAmount(): number {
    return this.selectedItems.reduce((total, item) => total + item.price * item.quantity, 0);
  }

  get canSubmitReturn(): boolean {
    return this.selectedItems.length > 0 && this.selectedItems.every(item => item.reason.trim().length > 0);
  }

  get availableItemIndices(): number[] {
    return this.items
      .map((item, index) => this.canSelectItem(item) ? index : -1)
      .filter(index => index >= 0);
  }

  get allAvailableItemsSelected(): boolean {
    return this.availableItemIndices.length > 0 &&
      this.availableItemIndices.every(index => this.selectedItemIndices.includes(index));
  }

  toggleSelectAll(): void {
    if (this.allAvailableItemsSelected) {
      const available = new Set(this.availableItemIndices);
      this.selectedItemIndices = this.selectedItemIndices.filter(index => !available.has(index));
      this.itemReasons = Object.fromEntries(
        Object.entries(this.itemReasons).filter(([index]) => !available.has(Number(index)))
      );
      this.itemEvidence = Object.fromEntries(Object.entries(this.itemEvidence).filter(([index]) => !available.has(Number(index))));
      this.uploadErrors = Object.fromEntries(Object.entries(this.uploadErrors).filter(([index]) => !available.has(Number(index))));
      return;
    }

    this.selectedItemIndices = [...new Set([...this.selectedItemIndices, ...this.availableItemIndices])];
  }

  isReturnEligible(item: { categorySlug?: string }): boolean {
    const orderedAt = new Date(this.orderDate).getTime();
    if (!Number.isFinite(orderedAt)) return false;
    const windowHours = this.returnWindowHours(item);
    return Date.now() < orderedAt + windowHours * 60 * 60 * 1000;
  }

  isAlreadyRequested(item: { title: string }): boolean {
    return this.returnedItemTitles.includes(item.title.trim().toLowerCase());
  }

  canSelectItem(item: { title: string; categorySlug?: string }): boolean {
    return this.isReturnEligible(item) && !this.isAlreadyRequested(item);
  }

  returnWindowHours(item: { categorySlug?: string }): number {
    return item.categorySlug?.toLowerCase() === 'ultra-fresh' ? 24 : 72;
  }

  toggleItem(index: number): void {
    if (!this.canSelectItem(this.items[index])) return;
    this.selectedItemIndices = this.selectedItemIndices.includes(index)
      ? this.selectedItemIndices.filter(selectedIndex => selectedIndex !== index)
      : [...this.selectedItemIndices, index];
    if (!this.selectedItemIndices.includes(index)) { delete this.itemReasons[index]; delete this.itemEvidence[index]; delete this.uploadErrors[index]; }
  }

  toggleReasonMenu(index: number): void {
    this.openReasonIndex = this.openReasonIndex === index ? null : index;
  }

  selectReason(index: number, reason: string): void {
    this.itemReasons[index] = reason;
    this.openReasonIndex = null;
    document.querySelector<HTMLElement>(`.rainbow-reason-control[data-index="${index}"] button`)?.focus();
  }

  @HostListener('document:click', ['$event'])
  closeReasonMenuOnOutsideClick(event: MouseEvent): void {
    if (this.openReasonIndex === null || !(event.target instanceof Element)) return;
    if (!event.target.closest('.rainbow-reason-control')) this.openReasonIndex = null;
  }

  @HostListener('document:keydown.escape')
  closeReasonMenuOnEscape(): void {
    if (this.openReasonIndex === null) return;
    const index = this.openReasonIndex;
    this.openReasonIndex = null;
    document.querySelector<HTMLElement>(`.rainbow-reason-control[data-index="${index}"] button`)?.focus();
  }

  onClose() {
    this.close.emit();
  }

  onSubmit() {
    if (!this.canSubmitReturn) return;
    this.submitReturn.emit({
      orderId: this.orderId,
      items: this.selectedItems
    });
  }
}
