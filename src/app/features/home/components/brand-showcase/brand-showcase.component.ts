import { AfterViewInit, Component, Input, ElementRef, OnDestroy, ViewChild, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import { Product } from '../../../../core/models/product.model';
import { BrandItem } from '../../models/home.model';

@Component({
  selector: 'app-brand-showcase',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './brand-showcase.component.html',
  styleUrls: ['./brand-showcase.component.scss']
})
export class BrandShowcaseComponent implements AfterViewInit, OnDestroy {
  @Input({ required: true }) brands: BrandItem[] = [];
  @Input({ required: true }) products: Product[] = [];
  @ViewChild('brandTrack') brandTrack?: ElementRef<HTMLElement>;

  private router = inject(Router);
  private autoScrollTimer?: ReturnType<typeof setInterval>;
  private pointerInside = false;
  private focusInside = false;

  ngAfterViewInit(): void { this.startAutoScroll(); }
  ngOnDestroy(): void { if (this.autoScrollTimer) clearInterval(this.autoScrollTimer); }

  setPointerInside(event: PointerEvent, value: boolean): void { if (event.pointerType !== 'touch') this.pointerInside = value; }
  onTouchStart(): void { this.startAutoScroll(); }
  setFocusInside(event: FocusEvent, inside: boolean): void {
    if (!inside && event.currentTarget instanceof HTMLElement && event.relatedTarget instanceof Node && event.currentTarget.contains(event.relatedTarget)) return;
    this.focusInside = inside;
  }

  private startAutoScroll(): void {
    if (typeof window === 'undefined') return;
    if (this.autoScrollTimer) clearInterval(this.autoScrollTimer);
    this.autoScrollTimer = setInterval(() => {
      const track = this.brandTrack?.nativeElement;
      if (!track || this.pointerInside || this.focusInside || document.hidden || window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;
      const maxScroll = track.scrollWidth - track.clientWidth;
      if (maxScroll <= 1) return;
      const next = track.scrollLeft >= maxScroll - 2 ? 0 : Math.min(maxScroll, track.scrollLeft + this.scrollStep(track));
      track.scrollTo({ left: next, behavior: 'smooth' });
    }, 5000);
  }

  openBrand(brand: BrandItem): void {
    const normalizedBrand = this.normalizeBrand(brand.name);
    if (normalizedBrand === 'cocacola') {
      void this.router.navigate(['/shop'], { queryParams: { brandStore: 'coca-cola' } });
      return;
    }
    const matchingProducts = this.products.filter(product => this.normalizeBrand(product.brand) === normalizedBrand);
    const departments: Record<string, string> = {
      nestle: 'dairy-eggs',
      pepsi: 'beverages',
      cocacola: 'beverages',
      nivea: 'personal-care',
      dove: 'personal-care',
      loreal: 'personal-care',
      pampers: 'baby-care',
      unilever: 'personal-care',
      garnier: 'personal-care',
      lipton: 'tea-coffee-milk-drinks',
      knorr: 'breakfast-instant-food'
    };

    this.router.navigate(['/shop'], {
      queryParams: {
        category: matchingProducts[0]?.categorySlug ?? departments[normalizedBrand] ?? 'grocery',
        brand: matchingProducts[0]?.brand ?? brand.name
      }
    });
  }

  scrollBrands(direction: number): void {
    const track = this.brandTrack?.nativeElement;
    if (!track) return;
    const maxScroll = Math.max(0, track.scrollWidth - track.clientWidth);
    if (!maxScroll) return;
    const step = this.scrollStep(track);
    const target = direction > 0
      ? (track.scrollLeft >= maxScroll - 2 ? 0 : Math.min(maxScroll, track.scrollLeft + step))
      : (track.scrollLeft <= 2 ? maxScroll : Math.max(0, track.scrollLeft - step));
    const reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    track.scrollTo({ left: target, behavior: reducedMotion ? 'auto' : 'smooth' });
    this.startAutoScroll();
  }

  private scrollStep(track: HTMLElement): number {
    if (window.matchMedia('(max-width: 767px)').matches) {
      const card = track.querySelector<HTMLElement>('.rh-brand-item');
      const set = track.querySelector<HTMLElement>('.rh-brands-set');
      if (card && set) return 3 * (card.getBoundingClientRect().width + (parseFloat(getComputedStyle(set).gap) || 0));
    }
    return Math.max(1, track.clientWidth * .75);
  }

  private normalizeBrand(value: string): string {
    return value.normalize('NFD').replace(/[\u0300-\u036f]/g, '').toLowerCase().replace(/[^a-z0-9]/g, '');
  }
}
