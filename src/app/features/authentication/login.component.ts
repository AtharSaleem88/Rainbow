import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule, Router, ActivatedRoute } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { AuthService } from '../../core/services/auth.service';
import { OtpDialogComponent } from '../../shared/components/otp-dialog/otp-dialog.component';

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [CommonModule, RouterModule, FormsModule, OtpDialogComponent],
  templateUrl: './login.component.html',
  styleUrls: ['./login.component.scss']
})
export class LoginComponent {
  readonly authService = inject(AuthService);
  readonly router = inject(Router);
  private readonly route = inject(ActivatedRoute);

  readonly currentYear = new Date().getFullYear();
  readonly returnUrl = this.route.snapshot.queryParamMap.get('returnUrl');
  credentials = { email: '', password: '' };
  passwordVisible = false;
  otpOpen = false;

  togglePassword() {
    this.passwordVisible = !this.passwordVisible;
  }

  onLogin() {
    this.authService.login(this.credentials.email || 'User');
    const returnUrl = this.route.snapshot.queryParamMap.get('returnUrl');
    void this.router.navigateByUrl(returnUrl && returnUrl.startsWith('/') && !returnUrl.startsWith('//') ? returnUrl : '/account');
  }
}
