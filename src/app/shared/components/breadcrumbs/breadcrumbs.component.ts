import { Component, Input, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { NavigationHistoryService } from '../../../core/services/navigation-history.service';

export interface BreadcrumbItem {
  label: string;
  url?: string;
  queryParams?: Record<string, any>;
}

@Component({
  selector: 'app-breadcrumbs',
  standalone: true,
  imports: [CommonModule, RouterModule],
  template: `
    <nav class="rh-breadcrumbs" aria-label="Breadcrumb">
      <div class="rh-breadcrumb-trail">
        <button type="button" class="rh-breadcrumb-back" (click)="navigationHistory.back()" aria-label="Go to previous page"><i class="fal fa-arrow-left" aria-hidden="true"></i></button>
        <ng-container *ngFor="let item of items; let isLast = last">
          <a *ngIf="item.url && !isLast" [routerLink]="item.url" [queryParams]="item.queryParams" class="rh-breadcrumb-link">
            {{ item.label }}
          </a>
          <span *ngIf="!item.url || isLast" class="rh-breadcrumb-current" [attr.aria-current]="isLast ? 'page' : null">
            {{ item.label }}
          </span>
          <i *ngIf="!isLast" class="fal fa-angle-right rh-breadcrumb-sep" aria-hidden="true"></i>
        </ng-container>
      </div>
    </nav>
  `,
  styles: [`
    .rh-breadcrumbs {
      display: flex;
      align-items: center;
      margin-bottom: 0;
    }

    .rh-breadcrumb-trail {
      display: flex;
      align-items: center;
      flex-wrap: wrap;
      gap: 8px;
      font-size: 0.82rem;
      color: #7a8091;
    }

    .rh-breadcrumb-link {
      color: var(--rh-primary);
      text-decoration: none;
      transition: color 150ms ease;

      &:hover {
        color: var(--rh-secondary);
        text-decoration: underline;
      }
    }

    .rh-breadcrumb-back { display: inline-grid; width: 28px; height: 32px; flex: 0 0 auto; place-items: center; padding: 0; border: 0; background: transparent; color: var(--rh-primary); cursor: pointer; }
    .rh-breadcrumb-back:focus-visible { outline: 2px solid #25aae1; outline-offset: 2px; }

    .rh-breadcrumb-current {
      color: var(--rh-primary);
      font-weight: 650;
    }

    .rh-breadcrumb-sep {
      color: #9ba1b2;
      font-size: 0.75rem;
    }
  `]
})
export class BreadcrumbsComponent {
  readonly navigationHistory = inject(NavigationHistoryService);
  @Input({ required: true }) items: BreadcrumbItem[] = [];
}
