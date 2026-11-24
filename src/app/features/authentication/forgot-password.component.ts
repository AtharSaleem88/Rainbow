import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule, NgForm } from '@angular/forms';
import { ActivatedRoute, RouterModule } from '@angular/router';
import { OtpDialogComponent } from '../../shared/components/otp-dialog/otp-dialog.component';

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
  email = '';
  submitted = false;
  otpOpen = false;

  submit(form: NgForm): void {
    if (form.invalid || !this.email.trim()) {
      form.control.markAllAsTouched();
      return;
    }
    this.submitted = true;
    this.otpOpen = true;
  }
}
