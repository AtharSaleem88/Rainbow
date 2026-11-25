import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule, NgForm } from '@angular/forms';
import { ActivatedRoute, RouterModule } from '@angular/router';
import { OtpDialogComponent } from '../../shared/components/otp-dialog/otp-dialog.component';
import { normalizePhone } from '../../core/services/auth.service';

@Component({
  selector: 'app-forgot-password',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterModule, OtpDialogComponent],
  templateUrl: './forgot-password.component.html',
  styleUrls: ['./forgot-password.component.scss']
})
export class ForgotPasswordComponent {
  private readonly route = inject(ActivatedRoute);
  readonly returnUrl = this.route.snapshot.queryParamMap.get('returnUrl');
  readonly currentYear = new Date().getFullYear();
  phone = '';
  phoneError = '';
  submitted = false;
  otpOpen = false;

  submit(form: NgForm): void {
    if (form.invalid || !normalizePhone(this.phone)) {
      this.phoneError = 'Please enter a valid Pakistani mobile number.';
      form.control.markAllAsTouched();
      return;
    }
    this.phoneError = '';
    this.submitted = true;
    this.otpOpen = true;
  }
}
