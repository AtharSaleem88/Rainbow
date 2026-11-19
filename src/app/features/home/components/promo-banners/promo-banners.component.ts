import { AfterViewInit, Component, ElementRef, OnDestroy, ViewChild, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';

@Component({
  selector: 'app-promo-banners',
  standalone: true,
  imports: [CommonModule, RouterModule],
  templateUrl: './promo-banners.component.html',
  styleUrls: ['./promo-banners.component.scss']
})
export class PromoBannersComponent implements AfterViewInit, OnDestroy {
  @ViewChild('bannerTrack') bannerTrack?: ElementRef<HTMLElement>;
  readonly activeSlide = signal(0);
  private timer?: ReturnType<typeof setInterval>;

  ngAfterViewInit(): void {
    this.timer = setInterval(() => {
      if (window.innerWidth > 767 || document.hidden || window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;
      this.showSlide(this.activeSlide() === 0 ? 1 : 0);
    }, 6000);
  }
  ngOnDestroy(): void { if (this.timer) clearInterval(this.timer); }
  onScroll(): void { const track = this.bannerTrack?.nativeElement; if (track && track.clientWidth) this.activeSlide.set(Math.round(track.scrollLeft / track.clientWidth)); }
  showSlide(index: number): void { const track = this.bannerTrack?.nativeElement; if (track) track.scrollTo({ left: index * track.clientWidth, behavior: window.matchMedia('(prefers-reduced-motion: reduce)').matches ? 'auto' : 'smooth' }); }
}
