import { Component, Input, signal, ElementRef, ViewChild, AfterViewInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { Category } from '../../../../core/models/product.model';

@Component({
  selector: 'app-category-grid',
  standalone: true,
  imports: [CommonModule, RouterModule],
  templateUrl: './category-grid.component.html',
  styleUrls: ['./category-grid.component.scss']
})
export class CategoryGridComponent implements AfterViewInit, OnDestroy {
  @Input({ required: true }) categories: Category[] = [];

  readonly trackCategory = (_index: number, category: Category) => category.id;
  readonly categoryHasOverflow = signal(false);
  activeCategoryPageIndex = signal<number>(0);
  categoryPages = signal<number[]>([0, 1, 2]);

  @ViewChild('categoryGrid') categoryGrid?: ElementRef<HTMLElement>;
  private categoryResizeObserver?: ResizeObserver;
  private categoryAutoSlideTimer?: ReturnType<typeof setInterval>;
  private categoryAutoResumeTimer?: ReturnType<typeof setTimeout>;

  ngAfterViewInit(): void {
    const grid = this.categoryGrid?.nativeElement;
    if (!grid) return;
    this.categoryResizeObserver = new ResizeObserver(() => this.updateCategoryScrollState(grid));
    this.categoryResizeObserver.observe(grid);
    this.startCategoryAutoSlide();
  }

  ngOnDestroy(): void {
    this.categoryResizeObserver?.disconnect();
    this.stopCategoryAutoSlide();
    if (this.categoryAutoResumeTimer) clearTimeout(this.categoryAutoResumeTimer);
  }

  onCategoryScroll(event: Event): void {
    this.updateCategoryScrollState(event.target as HTMLElement);
  }

  private updateCategoryScrollState(grid: HTMLElement): void {
    const maxScroll = Math.max(0, grid.scrollWidth - grid.clientWidth);
    const overflow = grid.clientWidth > 0 && maxScroll > 1;
    this.categoryHasOverflow.set(overflow);
    this.activeCategoryPageIndex.set(overflow ? Math.round(Math.min(1, Math.max(0, grid.scrollLeft / maxScroll)) * 2) : 0);
  }

  onCategoryGridKeydown(event: KeyboardEvent): void {
    if (event.target !== event.currentTarget || !this.categoryHasOverflow()) return;
    const page = event.key === 'Home' ? 0 : event.key === 'End' ? this.categoryPages().length - 1
      : event.key === 'ArrowLeft' ? this.activeCategoryPageIndex() - 1
      : event.key === 'ArrowRight' ? this.activeCategoryPageIndex() + 1 : null;
    if (page === null) return;
    event.preventDefault();
    this.scrollToCategoryPage(page);
  }

  scrollToCategoryPage(pageIndex: number): void {
    if (this.categoryGrid?.nativeElement) {
      const maxScroll = Math.max(0, this.categoryGrid.nativeElement.scrollWidth - this.categoryGrid.nativeElement.clientWidth);
      const page = Math.min(this.categoryPages().length - 1, Math.max(0, pageIndex));
      const behavior = window.matchMedia('(prefers-reduced-motion: reduce)').matches ? 'auto' : 'smooth';
      let target = maxScroll * page / 2;
      if (page === 1 && window.matchMedia('(max-width: 767px)').matches) {
        const item = this.categoryGrid.nativeElement.querySelector<HTMLElement>('.rh-category-item');
        if (item) {
          const step = item.getBoundingClientRect().width + (parseFloat(getComputedStyle(this.categoryGrid.nativeElement).gap) || 0);
          if (step > 0) target = Math.min(maxScroll, Math.round(target / step) * step);
        }
      }
      this.categoryGrid.nativeElement.scrollTo({ left: target, behavior });
    }
  }

  pauseCategoryAutoSlide(): void {
    this.stopCategoryAutoSlide();
    if (this.categoryAutoResumeTimer) clearTimeout(this.categoryAutoResumeTimer);
    this.categoryAutoResumeTimer = setTimeout(() => this.startCategoryAutoSlide(), 8000);
  }

  resumeCategoryAutoSlide(): void {
    if (this.categoryAutoResumeTimer) clearTimeout(this.categoryAutoResumeTimer);
    this.categoryAutoResumeTimer = setTimeout(() => this.startCategoryAutoSlide(), 1200);
  }

  private startCategoryAutoSlide(): void {
    this.stopCategoryAutoSlide();
    const grid = this.categoryGrid?.nativeElement;
    if (!grid || window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;
    this.categoryAutoSlideTimer = setInterval(() => {
      const maxScroll = Math.max(0, grid.scrollWidth - grid.clientWidth);
      if (maxScroll < 2) return;
      const currentPage = this.activeCategoryPageIndex();
      this.scrollToCategoryPage(currentPage >= this.categoryPages().length - 1 ? 0 : currentPage + 1);
    }, 5000);
  }

  private stopCategoryAutoSlide(): void {
    if (this.categoryAutoSlideTimer) {
      clearInterval(this.categoryAutoSlideTimer);
      this.categoryAutoSlideTimer = undefined;
    }
  }
}
