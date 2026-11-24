import { Component, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { NavigationEnd, Router, RouterOutlet, Scroll } from '@angular/router';
import { filter } from 'rxjs';
import { HeaderComponent } from './layout/header/header.component';
import { FooterComponent } from './layout/footer/footer.component';
import { CartDrawerComponent } from './shared/components/cart-drawer/cart-drawer.component';
import { AlternateProductModalComponent } from './shared/components/modals/alternate-product-modal/alternate-product-modal.component';
import { ToastComponent } from './shared/components/toast/toast.component';
import { NavigationHistoryService } from './core/services/navigation-history.service';
import { BreadcrumbItem, BreadcrumbsComponent } from './shared/components/breadcrumbs/breadcrumbs.component';
import { AlertDialogComponent } from './shared/components/alert-dialog/alert-dialog.component';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [CommonModule, RouterOutlet, HeaderComponent, FooterComponent, CartDrawerComponent, AlternateProductModalComponent, ToastComponent, BreadcrumbsComponent, AlertDialogComponent],
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.scss']
})
export class AppComponent {
  private readonly router = inject(Router);
  readonly navigationHistory = inject(NavigationHistoryService);
  readonly showStorefrontChrome = signal(true);
  readonly showPageBack = signal(false);
  readonly pageBreadcrumbs = signal<BreadcrumbItem[]>([]);

  constructor() {
    this.updateChromeVisibility();
    this.router.events.pipe(filter((event): event is NavigationEnd => event instanceof NavigationEnd)).subscribe(() => this.updateChromeVisibility());
    this.router.events.pipe(filter((event): event is Scroll => event instanceof Scroll)).subscribe(() => {
      const path = this.router.url.split(/[?#]/, 1)[0].replace(/\/$/, '');
      if (path === '/about' || path === '/privacy-policy' || path === '/terms-and-conditions') {
        queueMicrotask(() => window.scrollTo({ top: 0, left: 0, behavior: 'instant' }));
      }
    });
  }

  private updateChromeVisibility() {
    const path = this.router.url.split(/[?#]/, 1)[0].replace(/\/$/, '') || '/';
    this.showStorefrontChrome.set(path !== '/login' && path !== '/signup');
    this.showPageBack.set(!['/', '/shop', '/categories'].includes(path) && !path.startsWith('/products/'));
    const labels: Record<string, string> = { '/checkout': 'Checkout', '/account': 'My Account', '/partner-with-us': 'Advertise With Us', '/login': 'Login', '/signup': 'Sign Up', '/about': 'About Rainbow', '/contact': 'Contact', '/terms-and-conditions': 'Terms and Conditions', '/privacy-policy': 'Privacy Policy' };
    this.pageBreadcrumbs.set([{ label: 'Home', url: '/' }, { label: labels[path] ?? 'Page not found' }]);
  }
}
