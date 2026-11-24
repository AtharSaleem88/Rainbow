import { Component, ElementRef, HostListener, effect, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { AlertService } from '../../../core/services/alert.service';

@Component({
  selector: 'app-alert-dialog', standalone: true, imports: [CommonModule],
  template: `<div *ngIf="alerts.current() as alert" class="alert-overlay" (click)="alerts.respond(false)" (keydown.escape)="alerts.respond(false)">
    <section class="alert-dialog" role="alertdialog" aria-modal="true" aria-labelledby="alert-title" aria-describedby="alert-message" (click)="$event.stopPropagation()">
      <button type="button" class="alert-close" aria-label="Close" (click)="alerts.respond(false)">&times;</button>
      <span class="alert-icon" [class.warning]="alert.kind === 'warning'" aria-hidden="true">{{ alert.kind === 'success' ? '✓' : alert.kind === 'warning' ? '!' : 'i' }}</span>
      <h2 id="alert-title">{{ alert.title }}</h2><p id="alert-message">{{ alert.message }}</p>
      <div class="alert-actions"><button *ngIf="alert.confirmation" type="button" class="alert-cancel" (click)="alerts.respond(false)">{{ alert.cancelText || 'Cancel' }}</button><button type="button" class="alert-confirm" (click)="alerts.respond(true)">{{ alert.confirmText || 'OK' }}</button></div>
    </section></div>`,
  styles: [`:host{position:relative;z-index:1500}.alert-overlay{position:fixed;inset:0;z-index:1500;display:flex;align-items:center;justify-content:center;padding:16px;background:rgba(24,34,59,.38)}.alert-dialog{position:relative;width:min(100%,390px);padding:26px 24px 22px;border:1px solid #e5ebf3;border-radius:18px;background:#fff;text-align:center;box-shadow:0 16px 48px rgba(24,35,70,.18);font-family:var(--font-family-base,'Poppins',sans-serif)}.alert-close{position:absolute;right:14px;top:12px;width:30px;height:30px;border:0;border-radius:50%;background:#f3f6fb;color:#53617e;font-size:20px;cursor:pointer}.alert-icon{display:grid;place-items:center;width:48px;height:48px;margin:0 auto 14px;border-radius:50%;background:#e9f7fc;color:#30358d;font-size:23px;font-weight:500}.alert-icon.warning{background:#fff6e4;color:#b67510}.alert-dialog h2{margin:0 0 8px;color:#17234a;font-size:17px;font-weight:600}.alert-dialog p{margin:0;color:#65728b;font-size:13px;line-height:1.6;white-space:pre-line}.alert-actions{display:flex;justify-content:center;gap:10px;margin-top:20px}.alert-actions button{min-width:90px;padding:9px 18px;border-radius:9px;font:600 12px var(--font-family-base,'Poppins',sans-serif);cursor:pointer}.alert-confirm{border:1px solid #30358d;background:#30358d;color:#fff}.alert-cancel{border:1px solid #dce5f1;background:#fff;color:#30358d}.alert-dialog button:focus-visible{outline:2px solid #25aae1;outline-offset:2px}`]
})
export class AlertDialogComponent {
  readonly alerts = inject(AlertService);
  private readonly host = inject(ElementRef<HTMLElement>);
  private previousFocus: HTMLElement | null = null;
  constructor() {
    effect(() => {
      if (this.alerts.current()) {
        this.previousFocus = document.activeElement instanceof HTMLElement ? document.activeElement : null;
        queueMicrotask(() => (this.host.nativeElement.querySelector('.alert-confirm') as HTMLButtonElement | null)?.focus());
      } else {
        this.previousFocus?.focus();
        this.previousFocus = null;
      }
    });
  }
  @HostListener('document:keydown.escape') onEscape(): void { if (this.alerts.current()) this.alerts.respond(false); }
}
