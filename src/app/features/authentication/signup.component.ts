import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { FormsModule } from '@angular/forms';

@Component({
  selector: 'app-signup',
  standalone: true,
  imports: [CommonModule, RouterModule, FormsModule],
  templateUrl: './signup.component.html',
  styleUrls: ['./signup.component.scss']
})
export class SignupComponent {
  readonly currentYear = new Date().getFullYear();
  userData = { fullName: '', email: '', phone: '', password: '' };
  passwordVisible = false;

  togglePassword() {
    this.passwordVisible = !this.passwordVisible;
  }

  onSignup() {
    alert('Account created successfully!');
  }
}
