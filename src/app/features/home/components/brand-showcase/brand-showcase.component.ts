import { Component, Input, inject } from '@angular/core';
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
export class BrandShowcaseComponent {
  @Input({ required: true }) brands: BrandItem[] = [];
  @Input({ required: true }) products: Product[] = [];
  private router = inject(Router);

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

  private normalizeBrand(value: string): string {
    return value.normalize('NFD').replace(/[\u0300-\u036f]/g, '').toLowerCase().replace(/[^a-z0-9]/g, '');
  }
}
