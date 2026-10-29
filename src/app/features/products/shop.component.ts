import { Component, inject, signal, computed, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, RouterModule } from '@angular/router';
import { ProductService } from '../../core/services/product.service';
import { SeoService } from '../../core/services/seo.service';
import { ProductCardComponent } from '../../shared/components/product-card/product-card.component';
import { ProductQuickViewComponent } from '../../shared/components/modals/product-quick-view/product-quick-view.component';
import { BreadcrumbsComponent, BreadcrumbItem } from '../../shared/components/breadcrumbs/breadcrumbs.component';
import { EmptyStateComponent } from '../../shared/components/empty-state/empty-state.component';
import { SubcatSidebarComponent, SubCategoryItem, ShopFiltersComponent } from './components';
import { Product, ProductFilter } from '../../core/models/product.model';

@Component({
  selector: 'app-shop',
  standalone: true,
  imports: [
    CommonModule,
    RouterModule,
    ProductCardComponent,
    ProductQuickViewComponent,
    BreadcrumbsComponent,
    EmptyStateComponent,
    SubcatSidebarComponent,
    ShopFiltersComponent
  ],
  templateUrl: './shop.component.html',
  styleUrls: ['./shop.component.scss']
})
export class ShopComponent implements OnInit {
  private productService = inject(ProductService);
  private seoService = inject(SeoService);
  private route = inject(ActivatedRoute);

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

  readonly subSubCategories = ['Organic', 'Imported', 'Local Farm', 'Pre-Cut & Cleaned'];

  readonly subCategories = computed<string[]>(() => {
    const products = this.productService.getProducts(this.selectedCategory() ? { category: this.selectedCategory() } : undefined);
    return [...new Set(products.map(product => product.subCategory).filter((category): category is string => !!category))];
  });

  readonly subCategoryItems = computed<SubCategoryItem[]>(() => {
    const defaultList: SubCategoryItem[] = [
      { name: 'Fresh Vegetables', image: 'assets/images/ultra_fresh/Palak.jpg' },
      { name: 'Fresh Fruits', image: 'assets/images/ultra_fresh/gwa.jpg' },
      { name: 'Mangoes & Melons', image: 'assets/images/ultra_fresh/gwa.jpg' },
      { name: 'Seasonal', image: 'assets/images/ultra_fresh/carrot.webp' },
      { name: 'Exotics', image: 'assets/images/ultra_fresh/Curly-Kale.webp' },
      { name: 'Freshly Cut & Sprouts', image: 'assets/images/ultra_fresh/gwa.jpg' },
      { name: 'Frozen Veg', image: 'assets/images/frozen/nugets.jpg' }
    ];

    const rawSubCats = this.subCategories();
    if (!rawSubCats.length) return defaultList;

    const allProducts = this.productService.getProducts();
    return rawSubCats.map(subCat => {
      const matchProduct = allProducts.find(p => p.subCategory === subCat && p.image);
      return {
        name: subCat,
        image: matchProduct?.image ?? 'assets/images/ultra_fresh/gwa.jpg'
      };
    });
  });

  get breadcrumbs(): BreadcrumbItem[] {
    return [
      { label: 'Home', url: '/' },
      { label: 'Shop', url: '/shop' },
      { label: this.categoryName }
    ];
  }

  ngOnInit() {
    this.route.queryParams.subscribe(params => {
      if (params['category']) {
        this.selectedCategory.set(params['category']);
      } else {
        this.selectedCategory.set('');
      }
      if (params['brand']) {
        this.selectedBrand.set(params['brand']);
      } else {
        this.selectedBrand.set('');
      }
      if (params['subCategory']) {
        this.selectedSubCategory.set(params['subCategory']);
      } else {
        this.selectedSubCategory.set('');
      }
      this.selectedSubSubCategory.set('');
      if (params['q']) {
        this.searchQuery.set(params['q']);
      } else {
        this.searchQuery.set('');
      }
      this.applyFilters();
      this.updatePageSeo();
    });
  }

  private updatePageSeo(): void {
    const catName = this.categoryName;
    const title = catName === 'All Grocery' ? 'Online Supermarket & Grocery Shop' : `${catName} — Online Supermarket`;
    this.seoService.setPageTitle(title);
    this.seoService.setMetaDescription(`Explore our fresh selection of ${catName.toLowerCase()} and grocery essentials at Rainbow Cash & Carry.`);
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
    this.updatePageSeo();
  }

  onSubCategorySelect(subCategory: string) {
    this.selectedSubCategory.set(subCategory === this.selectedSubCategory() ? '' : subCategory);
    this.selectedSubSubCategory.set('');
    this.applyFilters();
  }

  onBrandChange(brand: string) {
    this.selectedBrand.set(brand);
    this.applyFilters();
  }

  onMinPriceChange(val: number) {
    this.minPrice.set(val);
    this.applyFilters();
  }

  onMaxPriceChange(val: number) {
    this.maxPrice.set(val);
    this.applyFilters();
  }

  onSortChangeValue(sortVal: string) {
    this.selectedSort.set(sortVal as any);
    this.applyFilters();
  }

  onSubSubCategoryChange(subSubCat: string) {
    this.selectedSubSubCategory.set(subSubCat);
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
    this.updatePageSeo();
  }

  openQuickView(product: Product) {
    this.selectedQuickViewProduct.set(product);
  }

  closeQuickView() {
    this.selectedQuickViewProduct.set(null);
  }
}
