import { Component, inject, signal, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, RouterModule } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { ProductService } from '../../core/services/product.service';
import { ProductCardComponent } from '../../shared/components/product-card/product-card.component';
import { ProductQuickViewComponent } from '../../shared/components/modals/product-quick-view/product-quick-view.component';
import { Product, ProductFilter } from '../../core/models/product.model';

export interface SubCategoryItem {
  name: string;
  image?: string;
  icon?: string;
}

@Component({
  selector: 'app-shop',
  standalone: true,
  imports: [CommonModule, RouterModule, FormsModule, ProductCardComponent, ProductQuickViewComponent],
  templateUrl: './shop.component.html',
  styleUrls: ['./shop.component.scss']
})
export class ShopComponent implements OnInit {
  productService = inject(ProductService);
  route = inject(ActivatedRoute);

  categories = this.productService.getCategories();
  filteredProducts = signal<Product[]>([]);

  // Filter & Layout State
  viewMode = signal<'grid' | 'list'>('grid');
  selectedCategory = signal<string>('');
  selectedSubCategory = signal<string>('');
  selectedSubSubCategory = signal<string>('');
  selectedBrand = signal<string>('');
  selectedSort = signal<'featured' | 'price-low' | 'price-high' | 'rating'>('featured');
  minPrice = signal<number>(0);
  maxPrice = signal<number>(1000);
  searchQuery = signal<string>('');

  selectedQuickViewProduct = signal<Product | null>(null);

  subSubCategories = ['Organic', 'Imported', 'Local Farm', 'Pre-Cut & Cleaned'];

  ngOnInit() {
    this.route.queryParams.subscribe(params => {
      if (params['category']) {
        this.selectedCategory.set(params['category']);
      } else {
        this.selectedCategory.set('');
      }
      this.selectedSubCategory.set('');
      this.selectedSubSubCategory.set('');
      if (params['q']) {
        this.searchQuery.set(params['q']);
      } else {
        this.searchQuery.set('');
      }
      this.applyFilters();
    });
  }

  applyFilters() {
    const filter: ProductFilter = {
      category: this.selectedCategory(),
      subCategory: this.selectedSubCategory(),
      brand: this.selectedBrand(),
      minPrice: this.minPrice(),
      maxPrice: this.maxPrice(),
      sortBy: this.selectedSort(),
      searchQuery: this.searchQuery()
    };
    let products = this.productService.getProducts(filter);

    // Apply sub-subcategory query filter if selected
    if (this.selectedSubSubCategory()) {
      const subsub = this.selectedSubSubCategory().toLowerCase();
      products = products.filter(p => 
        p.title.toLowerCase().includes(subsub) || 
        p.subtitle?.toLowerCase().includes(subsub) ||
        p.description?.toLowerCase().includes(subsub) ||
        (subsub === 'organic' && p.brand.toLowerCase().includes('organic'))
      );
    }

    this.filteredProducts.set(products);
  }

  onCategorySelect(catSlug: string) {
    this.selectedCategory.set(catSlug === this.selectedCategory() ? '' : catSlug);
    this.selectedSubCategory.set('');
    this.selectedSubSubCategory.set('');
    this.applyFilters();
  }

  onSubCategorySelect(subCategory: string) {
    this.selectedSubCategory.set(subCategory === this.selectedSubCategory() ? '' : subCategory);
    this.selectedSubSubCategory.set('');
    this.applyFilters();
  }

  get categoryName(): string {
    return this.categories.find(category => category.slug === this.selectedCategory())?.name ?? 'All Grocery';
  }

  get subCategoryDisplayName(): string {
    if (this.selectedSubCategory()) {
      return this.selectedSubCategory();
    }
    if (this.selectedCategory()) {
      return 'All ' + this.categoryName;
    }
    return 'All Products';
  }

  get subCategories(): string[] {
    const products = this.productService.getProducts(this.selectedCategory() ? { category: this.selectedCategory() } : undefined);
    return [...new Set(products.map(product => product.subCategory).filter((category): category is string => !!category))];
  }

  get subCategoryItems(): SubCategoryItem[] {
    const defaultList: SubCategoryItem[] = [
      { name: 'Fresh Vegetables', image: 'assets/images/ultra_fresh/Palak.jpg' },
      { name: 'Fresh Fruits', image: 'assets/images/ultra_fresh/gwa.jpg' },
      { name: 'Mangoes & Melons', image: 'assets/images/ultra_fresh/gwa.jpg' },
      { name: 'Seasonal', image: 'assets/images/ultra_fresh/carrot.webp' },
      { name: 'Exotics', image: 'assets/images/ultra_fresh/Curly-Kale.webp' },
      { name: 'Freshly Cut & Sprouts', image: 'assets/images/ultra_fresh/gwa.jpg' },
      { name: 'Frozen Veg', image: 'assets/images/frozen/nugets.jpg' }
    ];

    const rawSubCats = this.subCategories;
    if (!rawSubCats.length) return defaultList;

    const allProducts = this.productService.getProducts();
    return rawSubCats.map(subCat => {
      const matchProduct = allProducts.find(p => p.subCategory === subCat && p.image);
      return {
        name: subCat,
        image: matchProduct?.image ?? 'assets/images/ultra_fresh/gwa.jpg'
      };
    });
  }

  onSortChange(event: Event) {
    const val = (event.target as HTMLSelectElement).value as any;
    this.selectedSort.set(val);
    this.applyFilters();
  }

  resetFilters() {
    this.selectedCategory.set('');
    this.selectedSubCategory.set('');
    this.selectedSubSubCategory.set('');
    this.selectedBrand.set('');
    this.minPrice.set(0);
    this.maxPrice.set(1000);
    this.selectedSort.set('featured');
    this.searchQuery.set('');
    this.applyFilters();
  }

  openQuickView(product: Product) {
    this.selectedQuickViewProduct.set(product);
  }

  closeQuickView() {
    this.selectedQuickViewProduct.set(null);
  }
}
