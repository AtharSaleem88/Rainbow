import { Component, Input } from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-loading-spinner',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div class="rh-spinner-container" [class.overlay]="isOverlay" [attr.aria-label]="ariaLabel">
      <div class="rh-spinner" [style.width.px]="size" [style.height.px]="size">
        <svg class="rh-spinner-circular" viewBox="25 25 50 50">
          <circle class="rh-spinner-path" cx="50" cy="50" r="20" fill="none" stroke-width="4" stroke-miterlimit="10"/>
        </svg>
      </div>
      <p *ngIf="message" class="rh-spinner-message">{{ message }}</p>
    </div>
  `,
  styles: [`
    .rh-spinner-container {
      display: flex;
      flex-direction: column;
      align-items: center;
      justify-content: center;
      padding: 24px;
      gap: 12px;

      &.overlay {
        position: fixed;
        inset: 0;
        background: rgba(255, 255, 255, 0.85);
        backdrop-filter: blur(4px);
        z-index: 1050;
      }
    }

    .rh-spinner {
      position: relative;
      margin: 0 auto;
    }

    .rh-spinner-circular {
      animation: rh-rotate 2s linear infinite;
      height: 100%;
      transform-origin: center center;
      width: 100%;
      position: absolute;
      top: 0;
      bottom: 0;
      left: 0;
      right: 0;
      margin: auto;
    }

    .rh-spinner-path {
      stroke: var(--rh-primary, #2E3192);
      stroke-dasharray: 1, 200;
      stroke-dashoffset: 0;
      animation: rh-dash 1.5s ease-in-out infinite;
      stroke-linecap: round;
    }

    .rh-spinner-message {
      font-size: 0.88rem;
      font-weight: 500;
      color: var(--rh-primary, #2E3192);
      margin: 0;
    }

    @keyframes rh-rotate {
      100% {
        transform: rotate(360deg);
      }
    }

    @keyframes rh-dash {
      0% {
        stroke-dasharray: 1, 200;
        stroke-dashoffset: 0;
      }
      50% {
        stroke-dasharray: 89, 200;
        stroke-dashoffset: -35px;
      }
      100% {
        stroke-dasharray: 89, 200;
        stroke-dashoffset: -124px;
      }
    }
  `]
})
export class LoadingSpinnerComponent {
  @Input() size = 40;
  @Input() isOverlay = false;
  @Input() message?: string;
  @Input() ariaLabel = 'Loading';
}
