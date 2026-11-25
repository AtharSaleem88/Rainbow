import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, RouterModule } from '@angular/router';
import { FormsModule, NgForm } from '@angular/forms';
import { OtpDialogComponent } from '../../shared/components/otp-dialog/otp-dialog.component';
import { normalizePhone } from '../../core/services/auth.service';

@Component({
  selector: 'app-signup',
  standalone: true,
  imports: [CommonModule, RouterModule, FormsModule, OtpDialogComponent],
  templateUrl: './signup.component.html',
  styleUrls: ['./signup.component.scss']
})
export class SignupComponent {
  private readonly route = inject(ActivatedRoute);
  readonly returnUrl = this.route.snapshot.queryParamMap.get('returnUrl');
  readonly currentYear = new Date().getFullYear();
  userData = { fullName: '', phone: '', password: '' };
  phoneError = '';
  passwordVisible = false;
  otpOpen = false;

  togglePassword() {
    this.passwordVisible = !this.passwordVisible;
  }

  onSignup(form: NgForm) {
    if (form.invalid) { form.control.markAllAsTouched(); return; }
    if (!normalizePhone(this.userData.phone)) { this.phoneError = 'Enter a valid Pakistani mobile number.'; return; }
    this.phoneError = '';
    this.otpOpen = true;
  }
}
