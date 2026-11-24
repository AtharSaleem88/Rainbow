import { Component, ElementRef, ViewChild, inject, signal, HostListener, AfterViewInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';

@Component({
  selector: 'app-floating-actions',
  standalone: true,
  imports: [CommonModule, RouterModule],
  templateUrl: './floating-actions.component.html',
  styleUrls: ['./floating-actions.component.scss']
})
export class FloatingActionsComponent implements AfterViewInit, OnDestroy {
  private readonly host = inject(ElementRef<HTMLElement>);
  private collisionFrame = 0;
  @ViewChild('helpButton') helpButton?: ElementRef<HTMLButtonElement>;
  showScrollTop = signal(false);
  footerVisible = signal(false);
  helpOpen = signal(false);

  ngAfterViewInit(): void { if (typeof window !== 'undefined') this.scheduleCollisionCheck(); }
  ngOnDestroy(): void { if (typeof window !== 'undefined') cancelAnimationFrame(this.collisionFrame); }

  private scheduleCollisionCheck(): void {
    cancelAnimationFrame(this.collisionFrame);
    this.collisionFrame = requestAnimationFrame(() => {
      const floatingButtons = this.host.nativeElement.querySelectorAll('.rh-floating-btn') as NodeListOf<HTMLElement>;
      const productActions = window.matchMedia('(max-width: 767px)').matches
        ? document.querySelectorAll<HTMLElement>('.rh-shared-add-button, .rh-shared-quantity') : [];
      for (const button of Array.from(floatingButtons)) {
        const bounds = button.getBoundingClientRect();
        const overlaps = !this.helpOpen() && Array.from(productActions).some(action => {
          const rect = action.getBoundingClientRect();
          return rect.width > 0 && rect.height > 0 && bounds.left < rect.right && bounds.right > rect.left && bounds.top < rect.bottom && bounds.bottom > rect.top;
        });
        button.classList.toggle('rh-behind-product-action', overlaps);
      }
    });
  }

  @HostListener('window:scroll')
  @HostListener('window:resize')
  onWindowScroll(): void {
    this.showScrollTop.set(window.scrollY > 300);
    const footer = document.getElementById('rh-footer');
    this.footerVisible.set(!!footer && footer.getBoundingClientRect().top < window.innerHeight);
    if (this.footerVisible()) this.helpOpen.set(false);
    this.scheduleCollisionCheck();
  }

  @HostListener('document:click', ['$event'])
  onDocumentClick(event: MouseEvent): void {
    if (this.helpOpen() && event.target instanceof Node && !this.host.nativeElement.contains(event.target)) this.helpOpen.set(false);
  }

  @HostListener('document:keydown.escape')
  closeHelp(): void {
    if (!this.helpOpen()) return;
    this.helpOpen.set(false);
    this.helpButton?.nativeElement.focus();
  }

  scrollToTop(): void {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }
}
