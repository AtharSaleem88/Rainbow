import { Component, Input, Output, EventEmitter } from '@angular/core';
import { CommonModule } from '@angular/common';

export interface SubCategoryItem {
  name: string;
  image?: string;
  icon?: string;
}

@Component({
  selector: 'app-subcat-sidebar',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './subcat-sidebar.component.html',
  styleUrls: ['./subcat-sidebar.component.scss']
})
export class SubcatSidebarComponent {
  @Input() items: SubCategoryItem[] = [];
  @Input() selectedSubCategory = '';
  @Output() subCategorySelected = new EventEmitter<string>();

  selectSubCategory(name: string): void {
    this.subCategorySelected.emit(name);
  }
}
