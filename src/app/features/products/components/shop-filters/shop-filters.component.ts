import { Component, Input, Output, EventEmitter } from '@angular/core';
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

  onBrandChange(event: Event): void {
    const value = (event.target as HTMLSelectElement).value;
    this.brandChanged.emit(value);
  }

  onMinPriceChange(event: Event): void {
    const value = Number((event.target as HTMLInputElement).value);
    this.minPriceChanged.emit(value);
  }

  onMaxPriceChange(event: Event): void {
    const value = Number((event.target as HTMLInputElement).value);
    this.maxPriceChanged.emit(value);
  }

  onSortChange(event: Event): void {
    const value = (event.target as HTMLSelectElement).value;
    this.sortChanged.emit(value);
  }

  selectSubSubCategory(name: string): void {
    this.subSubCategoryChanged.emit(name);
  }
}
