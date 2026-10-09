import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule, Router } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { AuthService } from '../../core/services/auth.service';

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [CommonModule, RouterModule, FormsModule],
  templateUrl: './login.component.html',
  styleUrls: ['./login.component.scss']
})
export class LoginComponent {
  readonly authService = inject(AuthService);
  readonly router = inject(Router);

  readonly currentYear = new Date().getFullYear();
  credentials = { email: '', password: '' };
  passwordVisible = false;

  togglePassword() {
    this.passwordVisible = !this.passwordVisible;
  }

  onLogin() {
    this.authService.login(this.credentials.email || 'User');
    this.router.navigate(['/account']);
  }
}
