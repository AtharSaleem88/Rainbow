import { Component, Input, Output, EventEmitter, ChangeDetectionStrategy } from '@angular/core';
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
  @Input({ required: true }) orderId: string = '';
  @Input({ required: true }) itemTitle: string = '';
  @Input({ required: true }) refundAmount: number = 0;
  @Input() reason: string = 'Damaged or defective item';

  @Output() close = new EventEmitter<void>();
  @Output() submitReturn = new EventEmitter<{ orderId: string; itemTitle: string; reason: string; refundAmount: number }>();

  onClose() {
    this.close.emit();
  }

  onSubmit() {
    this.submitReturn.emit({
      orderId: this.orderId,
      itemTitle: this.itemTitle,
      reason: this.reason,
      refundAmount: this.refundAmount
    });
  }
}
