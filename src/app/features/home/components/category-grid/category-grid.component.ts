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

  @ViewChild('categoryGrid') categoryGrid?: ElementRef<HTMLElement>;
  private categoryResizeObserver?: ResizeObserver;

  ngAfterViewInit(): void {
    const grid = this.categoryGrid?.nativeElement;
    if (!grid) return;
    this.categoryResizeObserver = new ResizeObserver(() => this.updateCategoryScrollState(grid));
    this.categoryResizeObserver.observe(grid);
  }

  ngOnDestroy(): void {
    this.categoryResizeObserver?.disconnect();
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
    const page = event.key === 'Home' ? 0 : event.key === 'End' ? 2
      : event.key === 'ArrowLeft' ? this.activeCategoryPageIndex() - 1
      : event.key === 'ArrowRight' ? this.activeCategoryPageIndex() + 1 : null;
    if (page === null) return;
    event.preventDefault();
    this.scrollToCategoryPage(page);
  }

  scrollToCategoryPage(pageIndex: number): void {
    if (this.categoryGrid?.nativeElement) {
      const maxScroll = Math.max(0, this.categoryGrid.nativeElement.scrollWidth - this.categoryGrid.nativeElement.clientWidth);
      const page = Math.min(2, Math.max(0, pageIndex));
      const behavior = window.matchMedia('(prefers-reduced-motion: reduce)').matches ? 'auto' : 'smooth';
      this.categoryGrid.nativeElement.scrollTo({ left: (page / 2) * maxScroll, behavior });
    }
  }
}
