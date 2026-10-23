import { afterNextRender, Component, DestroyRef, ElementRef, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';

@Component({
  selector: 'app-footer',
  standalone: true,
  imports: [CommonModule, RouterModule],
  templateUrl: './footer.component.html',
  styleUrls: ['./footer.component.scss']
})
export class FooterComponent {
  private readonly hostElement = inject<ElementRef<HTMLElement>>(ElementRef);
  private readonly destroyRef = inject(DestroyRef);

  currentYear = new Date().getFullYear();
  readonly hasEntered = signal(false);

  constructor() {
    afterNextRender(() => {
      if (window.matchMedia('(prefers-reduced-motion: reduce)').matches || typeof IntersectionObserver === 'undefined') return;

      const footer = this.hostElement.nativeElement.querySelector('footer');
      if (!footer) return;

      const observer = new IntersectionObserver(entries => {
        if (entries.some(entry => entry.isIntersecting)) {
          this.hasEntered.set(true);
          observer.disconnect();
        }
      }, { threshold: 0.08 });

      observer.observe(footer);
      this.destroyRef.onDestroy(() => observer.disconnect());
    });
  }
}
