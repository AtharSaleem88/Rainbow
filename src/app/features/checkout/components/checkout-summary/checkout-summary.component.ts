import { Component, Input, ChangeDetectionStrategy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { PaymentBreakdown } from '../../../../core/services/checkout-payment.service';

@Component({
  selector: 'app-checkout-summary',
  standalone: true,
  imports: [CommonModule, RouterModule],
  templateUrl: './checkout-summary.component.html',
  styleUrls: ['./checkout-summary.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class CheckoutSummaryComponent {
  @Input({ required: true }) items: any[] = [];
  @Input({ required: true }) cartCount: number = 0;
  @Input({ required: true }) checkoutTotal: number = 0;
  @Input({ required: true }) checkoutOriginalTotal: number = 0;
  @Input({ required: true }) checkoutSavings: number = 0;
  @Input({ required: true }) payment!: PaymentBreakdown;
  @Input({ required: true }) pointsToEarn: number = 0;
  @Input({ required: true }) isMember: boolean = false;
  @Input({ required: true }) spendPerPoint: number = 100;
  @Input({ required: true }) fulfillingBranch: string = '';
  @Input() deliveryType: 'instant' | 'scheduled' | null = 'instant';
  @Input() deliveryDate: string = 'Today';
  @Input() deliveryTimeSlot: string = '2:00pm - 4:00pm';

  trackByCartItem = (_index: number, item: any): string => `${item.product?.id}:${item.variant?.id ?? 'default'}`;
}
