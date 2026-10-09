import { Component, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { NavigationEnd, Router, RouterOutlet } from '@angular/router';
import { filter } from 'rxjs';
import { HeaderComponent } from './layout/header/header.component';
import { FooterComponent } from './layout/footer/footer.component';
import { CartDrawerComponent } from './shared/components/cart-drawer/cart-drawer.component';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [CommonModule, RouterOutlet, HeaderComponent, FooterComponent, CartDrawerComponent],
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.scss']
})
export class AppComponent {
  private readonly router = inject(Router);
  readonly showStorefrontChrome = signal(true);

  constructor() {
    this.updateChromeVisibility();
    this.router.events.pipe(filter((event): event is NavigationEnd => event instanceof NavigationEnd)).subscribe(() => this.updateChromeVisibility());
  }

  private updateChromeVisibility() {
    const path = this.router.url.split(/[?#]/, 1)[0].replace(/\/$/, '') || '/';
    this.showStorefrontChrome.set(path !== '/login' && path !== '/signup');
  }
}
