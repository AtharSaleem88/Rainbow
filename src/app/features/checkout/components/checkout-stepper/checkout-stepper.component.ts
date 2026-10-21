import { Component, Input, Output, EventEmitter, ChangeDetectionStrategy } from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-checkout-stepper',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './checkout-stepper.component.html',
  styleUrls: ['./checkout-stepper.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class CheckoutStepperComponent {
  @Input({ required: true }) currentStep: 1 | 2 | 3 = 1;
  @Output() stepChange = new EventEmitter<1 | 2>();

  onStepClick(step: 1 | 2) {
    this.stepChange.emit(step);
  }
}
