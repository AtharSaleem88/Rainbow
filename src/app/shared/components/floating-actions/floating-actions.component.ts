import { Component, signal, HostListener } from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-floating-actions',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './floating-actions.component.html',
  styleUrls: ['./floating-actions.component.scss']
})
export class FloatingActionsComponent {
  showScrollTop = signal(false);
  footerVisible = signal(false);

  @HostListener('window:scroll')
  @HostListener('window:resize')
  onWindowScroll(): void {
    this.showScrollTop.set(window.scrollY > 300);
    const footer = document.getElementById('rh-footer');
    this.footerVisible.set(!!footer && footer.getBoundingClientRect().top < window.innerHeight);
  }

  scrollToTop(): void {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }
}
