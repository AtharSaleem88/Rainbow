import { Component, Input } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule, Params } from '@angular/router';
import { Product } from '../../../../core/models/product.model';
import { ProductCardComponent } from '../../../../shared/components/product-card/product-card.component';

@Component({
  selector: 'app-product-collection-rail',
  standalone: true,
  imports: [CommonModule, RouterModule, ProductCardComponent],
  templateUrl: './product-collection-rail.component.html',
  styleUrls: ['./product-collection-rail.component.scss']
})
export class ProductCollectionRailComponent {
  @Input({ required: true }) title!: string;
  @Input() titleLead?: string;
  @Input() titleAccent?: string;
  @Input() subtitle?: string;
  @Input({ required: true }) products: Product[] = [];
  @Input() sectionLabel: string = '';
  @Input() seeAllLink = '/shop';
  @Input() seeAllQueryParams?: Params;
  @Input() seeAllText = 'VIEW ALL';
  @Input() isTinted = false;
  @Input() sectionId = 'rh-collection-' + Math.floor(1000 + Math.random() * 9000);
}
