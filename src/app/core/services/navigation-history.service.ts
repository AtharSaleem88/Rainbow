import { Injectable, inject } from '@angular/core';
import { NavigationEnd, NavigationStart, Router } from '@angular/router';

@Injectable({ providedIn: 'root' })
export class NavigationHistoryService {
  private readonly router = inject(Router);
  private readonly pages: string[] = [];
  private isHistoryNavigation = false;
  private replacesCurrentPage = false;

  constructor() {
    this.router.events.subscribe(event => {
      if (event instanceof NavigationStart) {
        this.isHistoryNavigation = event.navigationTrigger === 'popstate';
        const extras = this.router.getCurrentNavigation()?.extras;
        this.replacesCurrentPage = !!(extras?.replaceUrl || extras?.skipLocationChange);
      } else if (event instanceof NavigationEnd) {
        const url = event.urlAfterRedirects;
        if (this.isHistoryNavigation) {
          const index = this.pages.lastIndexOf(url);
          if (index >= 0) this.pages.splice(index + 1);
          else this.pages.splice(0, this.pages.length, url);
        } else if (this.replacesCurrentPage && this.pages.length) {
          this.pages[this.pages.length - 1] = url;
        } else if (this.pages[this.pages.length - 1] !== url) {
          this.pages.push(url);
        }
      }
    });
  }

  back(): void {
    if (this.pages.length > 1) window.history.back();
    else void this.router.navigateByUrl('/');
  }
}
