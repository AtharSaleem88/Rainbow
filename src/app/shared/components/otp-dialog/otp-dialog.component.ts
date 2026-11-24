import { Component, EventEmitter, Input, Output } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

@Component({
  selector: 'app-otp-dialog', standalone: true, imports: [CommonModule, FormsModule],
  template: `<div class="otp-backdrop" (click)="dismiss()">
    <section class="otp-dialog" role="dialog" aria-modal="true" aria-labelledby="otp-title" (click)="$event.stopPropagation()">
      <header><h2 id="otp-title">{{ mode === 'password' ? 'Change Password' : 'Verify Mobile Number' }}</h2><button type="button" aria-label="Close" (click)="dismiss()">&times;</button></header>
      <div class="otp-body">
        <ng-container *ngIf="stage === 'otp'">
          <p>Verify {{ phone || 'your mobile number' }} to continue.</p>
          <p class="otp-notice">Demo only: use code <strong>123456</strong>. No SMS is sent.</p>
          <label for="demo-otp">Verification code</label><input id="demo-otp" type="text" inputmode="numeric" maxlength="6" autocomplete="one-time-code" [(ngModel)]="code" placeholder="Enter 6-digit code">
          <button type="button" class="otp-primary" (click)="verify()">Verify Code</button>
        </ng-container>
        <ng-container *ngIf="stage === 'password'">
          <p>Choose a new password for this demonstration.</p>
          <label for="demo-new-password">New password</label><input id="demo-new-password" type="password" autocomplete="new-password" [(ngModel)]="password" placeholder="At least 8 characters">
          <label for="demo-confirm-password">Confirm password</label><input id="demo-confirm-password" type="password" autocomplete="new-password" [(ngModel)]="confirmation" placeholder="Confirm your password">
          <button type="button" class="otp-primary" (click)="finishPassword()">Continue</button>
        </ng-container>
        <ng-container *ngIf="stage === 'complete'">
          <p class="otp-notice">{{ mode === 'password' ? 'Demo complete. Your account password has not been changed.' : 'Demo complete. Your mobile number has not been verified and no account changes were made.' }}</p>
          <button type="button" class="otp-primary" (click)="dismiss()">Done</button>
        </ng-container>
        <p *ngIf="error" class="otp-error" role="alert">{{ error }}</p>
      </div>
    </section></div>`,
  styles: [`:host{position:relative;z-index:1200}.otp-backdrop{position:fixed;inset:0;z-index:1200;background:rgba(19,29,59,.55);display:flex;align-items:center;justify-content:center;padding:16px}.otp-dialog{width:100%;max-width:440px;border-radius:18px;background:#fff;color:#17234a;overflow:hidden;box-shadow:0 20px 60px rgba(20,30,60,.2)}.otp-dialog header{display:flex;align-items:center;justify-content:space-between;padding:18px 20px;border-bottom:1px solid #e8edf5}.otp-dialog h2{margin:0;font-size:17px;font-weight:600}.otp-dialog header button{width:34px;height:34px;border:0;border-radius:50%;background:#f1f5fb;color:#30358d;font-size:22px}.otp-body{display:flex;flex-direction:column;gap:10px;padding:20px;font-size:13px}.otp-body p{margin:0;line-height:1.5;color:#677591}.otp-body label{font-weight:600;margin-top:4px}.otp-body input{width:100%;min-height:44px;padding:0 12px;border:1px solid #dce5f1;border-radius:9px;font:inherit}.otp-body .otp-notice{padding:12px;border-radius:9px;background:#eef8fd;color:#304366}.otp-body .otp-error{color:#c12d3e}.otp-primary{min-height:42px;margin-top:8px;border:0;border-radius:9px;background:#30358d;color:#fff;font-size:13px;font-weight:600}`]
})
export class OtpDialogComponent {
  @Input() phone = '';
  @Input() mode: 'verify' | 'password' = 'verify';
  @Output() close = new EventEmitter<void>();
  stage: 'otp' | 'password' | 'complete' = 'otp';
  code = ''; password = ''; confirmation = ''; error = '';

  verify(): void {
    if (this.code.trim() !== '123456') { this.error = 'Enter the demo code 123456 to continue.'; return; }
    this.code = ''; this.error = ''; this.stage = this.mode === 'password' ? 'password' : 'complete';
  }
  finishPassword(): void {
    if (this.password.length < 8) { this.error = 'Use at least 8 characters.'; return; }
    if (this.password !== this.confirmation) { this.error = 'The passwords do not match.'; return; }
    this.password = ''; this.confirmation = ''; this.error = ''; this.stage = 'complete';
  }
  dismiss(): void { this.code = ''; this.password = ''; this.confirmation = ''; this.close.emit(); }
}
