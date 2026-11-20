import { Component, computed, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { ProductService } from '../../core/services/product.service';
import { BreadcrumbsComponent } from '../../shared/components/breadcrumbs/breadcrumbs.component';
import { ProductCardComponent } from '../../shared/components/product-card/product-card.component';

@Component({
  selector: 'app-categories',
  standalone: true,
  imports: [CommonModule, RouterModule, BreadcrumbsComponent, ProductCardComponent],
  templateUrl: './categories.component.html',
  styleUrls: ['./categories.component.scss']
})
export class CategoriesComponent {
  private readonly productService = inject(ProductService);
  private readonly products = this.productService.getProducts();
  readonly categories = [...this.productService.getCategories()].sort((a, b) => {
    const rank = (slug: string): number => {
      if (slug === 'personal-care') return 4;
      if (slug === 'grocery') return 3;
      const items = this.products.filter(product => product.categorySlug === slug);
      return items.some(product => product.subCategory?.trim()) ? 2 : items.length ? 1 : 0;
    };
    return rank(b.slug) - rank(a.slug);
  });
  readonly catalogMaxPrice = Math.max(1000, ...this.products.flatMap(product => [product.price, ...(product.variants ?? []).map(variant => variant.price)]));
  readonly selectedSlug = signal(this.categories.find(category => category.slug === 'personal-care')?.slug ?? this.categories[0]?.slug ?? '');
  readonly selectedCategory = computed(() => this.categories.find(category => category.slug === this.selectedSlug()));
  readonly sort = signal<'featured' | 'price-low' | 'price-high'>('featured');
  readonly categoryProducts = computed(() => {
    const products = this.productService.getProducts({ category: this.selectedSlug() });
    if (this.sort() === 'price-low') products.sort((a, b) => a.price - b.price);
    if (this.sort() === 'price-high') products.sort((a, b) => b.price - a.price);
    return products;
  });
  readonly featuredProducts = computed(() => this.categoryProducts().slice(0, 6));
  readonly subcategories = computed(() => {
    if (this.selectedSlug() === 'personal-care') return this.productService.getPersonalCareSections();
    if (this.selectedSlug() === 'grocery') return this.productService.getGrocerySections().map(({ name, image }) => ({ name, image, imagePosition: undefined }));
    const categoryProducts = this.products.filter(product => product.categorySlug === this.selectedSlug() && product.subCategory);
    const groups = new Map<string, { name: string; image: string; imagePosition?: string }>();
    for (const product of categoryProducts) {
      const name = product.subCategory!.trim();
      if (name && !groups.has(name)) groups.set(name, { name, image: product.image });
    }
    return [...groups.values()].sort((a, b) => a.name.localeCompare(b.name));
  });
  readonly breadcrumbs = [{ label: 'Home', url: '/' }, { label: 'Shop by category' }];
}
