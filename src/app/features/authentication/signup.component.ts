import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, RouterModule } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { OtpDialogComponent } from '../../shared/components/otp-dialog/otp-dialog.component';

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
  userData = { fullName: '', email: '', phone: '', password: '' };
  passwordVisible = false;
  otpOpen = false;

  togglePassword() {
    this.passwordVisible = !this.passwordVisible;
  }

  onSignup() {
    this.otpOpen = true;
  }
}
