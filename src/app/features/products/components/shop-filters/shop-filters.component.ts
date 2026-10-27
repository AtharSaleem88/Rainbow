import { Component, Input, Output, EventEmitter, ElementRef, HostListener, ViewChild } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

@Component({
  selector: 'app-shop-filters',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './shop-filters.component.html',
  styleUrls: ['./shop-filters.component.scss']
})
export class ShopFiltersComponent {
  @ViewChild('brandFilter') brandFilter!: ElementRef<HTMLElement>;
  @ViewChild('sortFilter') sortFilter!: ElementRef<HTMLElement>;

  readonly brandOptions = [
    { value: '', label: 'All brands' },
    { value: 'Rainbow Farm', label: 'Rainbow Farm' },
    { value: 'Rainbow Organic', label: 'Rainbow Organic' },
    { value: 'Rainbow Select', label: 'Rainbow Select' },
    { value: 'Rainbow Frozen', label: 'Rainbow Frozen' },
    { value: 'Shan', label: 'Shan' }
  ];
  readonly sortOptions = [
    { value: 'featured', label: 'Recommended' },
    { value: 'price-low', label: 'Price: Low to High' },
    { value: 'price-high', label: 'Price: High to Low' },
    { value: 'rating', label: 'Top Rated' }
  ];
  brandMenuOpen = false;
  sortMenuOpen = false;

  @Input() selectedBrand = '';
  @Input() minPrice = 0;
  @Input() maxPrice = 1000;
  @Input() selectedSort = 'featured';
  @Input() subSubCategories: string[] = [];
  @Input() selectedSubSubCategory = '';

  @Output() brandChanged = new EventEmitter<string>();
  @Output() minPriceChanged = new EventEmitter<number>();
  @Output() maxPriceChanged = new EventEmitter<number>();
  @Output() sortChanged = new EventEmitter<string>();
  @Output() subSubCategoryChanged = new EventEmitter<string>();

  get selectedSortLabel(): string {
    return this.sortOptions.find(option => option.value === this.selectedSort)?.label ?? 'Recommended';
  }

  toggleBrandMenu(): void {
    this.brandMenuOpen = !this.brandMenuOpen;
    this.sortMenuOpen = false;
  }

  toggleSortMenu(): void {
    this.sortMenuOpen = !this.sortMenuOpen;
    this.brandMenuOpen = false;
  }

  selectBrand(value: string): void {
    this.brandChanged.emit(value);
    this.brandMenuOpen = false;
    this.brandFilter.nativeElement.querySelector('button')?.focus();
  }

  selectSort(value: string): void {
    this.sortChanged.emit(value);
    this.sortMenuOpen = false;
    this.sortFilter.nativeElement.querySelector('button')?.focus();
  }

  @HostListener('document:click', ['$event'])
  closeMenusOnOutsideClick(event: MouseEvent): void {
    if (this.brandMenuOpen && !this.brandFilter.nativeElement.contains(event.target as Node)) {
      this.brandMenuOpen = false;
    }
    if (this.sortMenuOpen && !this.sortFilter.nativeElement.contains(event.target as Node)) {
      this.sortMenuOpen = false;
    }
  }

  @HostListener('document:keydown.escape')
  closeMenusOnEscape(): void {
    if (this.brandMenuOpen) {
      this.brandMenuOpen = false;
      this.brandFilter.nativeElement.querySelector('button')?.focus();
    }
    if (this.sortMenuOpen) {
      this.sortMenuOpen = false;
      this.sortFilter.nativeElement.querySelector('button')?.focus();
    }
  }

  onMinPriceChange(event: Event): void {
    const value = Number((event.target as HTMLInputElement).value);
    this.minPriceChanged.emit(value);
  }

  onMaxPriceChange(event: Event): void {
    const value = Number((event.target as HTMLInputElement).value);
    this.maxPriceChanged.emit(value);
  }

  selectSubSubCategory(name: string): void {
    this.subSubCategoryChanged.emit(name);
  }
}
