import { Component, signal, computed, HostListener, inject, OnInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router, RouterModule } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { CartService } from '../../core/services/cart.service';
import { ProductService } from '../../core/services/product.service';
import { AuthService } from '../../core/services/auth.service';
import { Product } from '../../core/models/product.model';

@Component({
  selector: 'app-header',
  standalone: true,
  imports: [CommonModule, RouterModule, FormsModule],
  templateUrl: './header.component.html',
  styleUrls: ['./header.component.scss']
})
export class HeaderComponent implements OnInit, OnDestroy {
  cartService = inject(CartService);
  productService = inject(ProductService);
  authService = inject(AuthService);
  router = inject(Router);

  isScrolled = signal<boolean>(false);
  isDeptOpen = signal<boolean>(false);
  searchQuery = signal<string>('');
  isSearchDropdownOpen = signal<boolean>(false);
  readonly availableLocations = [
    { id: 'lahore', name: 'Lahore', address: 'Lahore Main', city: 'Lahore' },
    { id: 'islamabad', name: 'Islamabad', address: 'Blue Area', city: 'Islamabad' },
    { id: 'karachi', name: 'Karachi', address: 'Clifton & DHA', city: 'Karachi' },
    { id: 'rawalpindi', name: 'Rawalpindi', address: 'Saddar', city: 'Rawalpindi' },
    { id: 'faisalabad', name: 'Faisalabad', address: 'D-Ground', city: 'Faisalabad' }
  ];
  selectedLocation = signal(this.availableLocations[0]);
  isLocationDropdownOpen = signal<boolean>(false);
  isDetectingLocation = signal<boolean>(false);
  locationQuery = signal<string>('');
  popoverPosition = signal<{ top: number; left: number }>({ top: 110, left: 200 });
  popoverStyle = () => {
    if (typeof window !== 'undefined' && window.innerWidth < 768) {
      return {};
    }
    return {
      top: `${this.popoverPosition().top}px`,
      left: `${this.popoverPosition().left}px`
    };
  };
  filteredLocations = () => {
    const query = this.locationQuery().trim().toLocaleLowerCase();
    return query ? this.availableLocations.filter(location =>
      `${location.name} ${location.address} ${location.city}`.toLocaleLowerCase().includes(query)) : this.availableLocations;
  };
  private detectionTimer: ReturnType<typeof setTimeout> | null = null;

  // Delivery Schedule State
  selectedDeliveryDate = signal<string>('Today');
  selectedDeliveryTimeSlot = signal<string>('2:00pm - 4:00pm');
  isScheduleModalOpen = signal<boolean>(false);

  availableDates = [
    { label: 'Today', value: 'Today', dateStr: 'Today, Oct 8' },
    { label: 'Tomorrow', value: 'Tomorrow', dateStr: 'Tomorrow, Oct 9' },
    { label: 'Friday', value: 'Friday', dateStr: 'Friday, Oct 10' }
  ];

  availableTimeSlots = [
    '10:00am - 12:00pm',
    '12:00pm - 2:00pm',
    '2:00pm - 4:00pm',
    '4:00pm - 6:00pm',
    '6:00pm - 8:00pm'
  ];

  openScheduleModal() {
    this.isScheduleModalOpen.set(true);
    document.body.classList.add('modal-open');
  }

  closeScheduleModal() {
    this.isScheduleModalOpen.set(false);
    document.body.classList.remove('modal-open');
  }

  selectInstantDelivery() {
    this.cartService.setDeliveryType('instant');
  }

  confirmSchedule(dateVal?: string, slotVal?: string) {
    const d = dateVal || this.selectedDeliveryDate();
    const s = slotVal || this.selectedDeliveryTimeSlot();
    this.selectedDeliveryDate.set(d);
    this.selectedDeliveryTimeSlot.set(s);
    this.cartService.setScheduledDelivery(d, s);
    this.closeScheduleModal();
  }

  searchSuggestions = [
    'Fresh From Farm',
    'Groceries',
    'Household',
    'Frozen',
    'Snacks'
  ];
  currentSuggestionIndex = signal<number>(0);
  isSuggestionAnimating = signal<boolean>(false);
  isInputFocused = signal<boolean>(false);

  private suggestionTimer: any;

  categories = this.productService.getCategories();

  ngOnInit() {
    this.startSuggestionAnimation();
    if (typeof window !== 'undefined') {
      this.isScrolled.set(window.scrollY > 25);
    }
  }

  @HostListener('window:scroll', [])
  onWindowScroll() {
    if (typeof window !== 'undefined') {
      this.isScrolled.set(window.scrollY > 25);
    }
  }

  ngOnDestroy() {
    this.stopSuggestionAnimation();
    if (this.detectionTimer) clearTimeout(this.detectionTimer);
    document.body.classList.remove('modal-open');
  }

  startSuggestionAnimation() {
    this.stopSuggestionAnimation();
    this.suggestionTimer = setInterval(() => {
      this.isSuggestionAnimating.set(true);
      setTimeout(() => {
        this.currentSuggestionIndex.update(idx => (idx + 1) % this.searchSuggestions.length);
        this.isSuggestionAnimating.set(false);
      }, 350); // Vertical slide out duration
    }, 2800);
  }

  stopSuggestionAnimation() {
    if (this.suggestionTimer) {
      clearInterval(this.suggestionTimer);
      this.suggestionTimer = null;
    }
  }

  readonly searchSuggestionsData = computed(() => {
    const rawQuery = this.searchQuery().trim();
    const query = rawQuery.toLowerCase();
    const allProducts = this.productService.getProducts();
    const allCategories = this.categories;

    if (!query) {
      return {
        hasQuery: false,
        categorySuggestions: allCategories.slice(0, 8).map(cat => ({
          term: cat.name,
          targetName: cat.name,
          categoryName: cat.name,
          categorySlug: cat.slug,
          subCategory: undefined as string | undefined,
          icon: cat.icon || 'fa-th-large',
          image: cat.image
        })),
        productSuggestions: [] as Product[]
      };
    }

    // 1. Categories & Subcategories suggestions (Asks which category or subcategory you wanna go)
    // Dynamic matching like Blinkit: "milk in Flavoured & Cold Milk", "milk in Dairy, Bread & Eggs", etc.
    const categoryMatches: {
      term: string;
      targetName: string;
      categoryName: string;
      categorySlug: string;
      subCategory?: string;
      icon?: string;
      image?: string;
    }[] = [];

    const seenKeys = new Set<string>();

    // A. Specific Subcategory matches
    for (const p of allProducts) {
      if (p.subCategory) {
        const subLower = p.subCategory.toLowerCase();
        const titleLower = p.title.toLowerCase();
        if (subLower.includes(query) || titleLower.includes(query)) {
          const key = `sub:${p.subCategory.toLowerCase()}`;
          if (!seenKeys.has(key)) {
            const cat = allCategories.find(c => c.slug === p.categorySlug);
            categoryMatches.push({
              term: rawQuery,
              targetName: p.subCategory,
              categoryName: cat?.name || p.category,
              categorySlug: p.categorySlug,
              subCategory: p.subCategory,
              icon: cat?.icon,
              image: p.image || cat?.image
            });
            seenKeys.add(key);
          }
        }
      }
    }

    // B. Direct Category name matches
    for (const cat of allCategories) {
      if (cat.name.toLowerCase().includes(query)) {
        const key = `cat:${cat.slug}`;
        if (!seenKeys.has(key)) {
          categoryMatches.push({
            term: rawQuery,
            targetName: cat.name,
            categoryName: cat.name,
            categorySlug: cat.slug,
            icon: cat.icon,
            image: cat.image
          });
          seenKeys.add(key);
        }
      }
    }

    // C. Categories containing matching products -> "Query in Category"
    for (const product of allProducts) {
      const titleMatch = product.title.toLowerCase().includes(query);
      const brandMatch = product.brand?.toLowerCase().includes(query);

      if (titleMatch || brandMatch) {
        const key = `cat:${product.categorySlug}`;
        if (!seenKeys.has(key)) {
          const cat = allCategories.find(c => c.slug === product.categorySlug);
          categoryMatches.push({
            term: rawQuery,
            targetName: cat?.name || product.category,
            categoryName: cat?.name || product.category,
            categorySlug: product.categorySlug,
            icon: cat?.icon,
            image: cat?.image || product.image
          });
          seenKeys.add(key);
        }
      }
    }

    // Fallback if no specific category matched
    if (categoryMatches.length === 0 && allCategories.length > 0) {
      const first = allCategories[0];
      categoryMatches.push({
        term: rawQuery,
        targetName: first.name,
        categoryName: first.name,
        categorySlug: first.slug,
        icon: first.icon,
        image: first.image
      });
    }

    // 2. Direct Matching Products (thumbnails & titles)
    const productMatches = allProducts.filter(p =>
      p.title.toLowerCase().includes(query) ||
      p.category.toLowerCase().includes(query) ||
      (p.subCategory && p.subCategory.toLowerCase().includes(query)) ||
      (p.brand && p.brand.toLowerCase().includes(query))
    ).slice(0, 5);

    return {
      hasQuery: true,
      categorySuggestions: categoryMatches.slice(0, 5),
      productSuggestions: productMatches
    };
  });

  onInputFocus() {
    this.isInputFocused.set(true);
    this.isSearchDropdownOpen.set(true);
  }

  onInputBlur() {
    this.isInputFocused.set(false);
  }

  onSearchInputChange(val: string) {
    this.searchQuery.set(val);
    if (!this.isSearchDropdownOpen()) {
      this.isSearchDropdownOpen.set(true);
    }
  }

  clearSearch(event?: Event) {
    if (event) {
      event.stopPropagation();
      event.preventDefault();
    }
    this.searchQuery.set('');
  }

  selectCategorySuggestion(catSlug: string, query?: string, subCategory?: string) {
    this.isSearchDropdownOpen.set(false);
    const queryParams: any = {};
    if (catSlug) queryParams.category = catSlug;
    if (subCategory) queryParams.subCategory = subCategory;
    if (query) queryParams.q = query;
    this.router.navigate(['/shop'], { queryParams });
  }

  selectProductSuggestion(productId: number) {
    this.isSearchDropdownOpen.set(false);
    this.router.navigate(['/products', productId]);
  }

  onSearch() {
    if (this.searchQuery().trim()) {
      this.isSearchDropdownOpen.set(false);
      this.router.navigate(['/shop'], { queryParams: { q: this.searchQuery().trim() } });
    }
  }

  openCart() {
    this.cartService.openCartDrawer();
  }

  toggleLocationDropdown(event?: Event) {
    if (event) {
      event.stopPropagation();
      event.preventDefault();
    }
    const nextState = !this.isLocationDropdownOpen();
    if (nextState) {
      this.locationQuery.set('');
      if (event && event.currentTarget instanceof HTMLElement) {
        const rect = event.currentTarget.getBoundingClientRect();
        const top = Math.round(rect.bottom + 8);
        const cardWidth = 530;
        const maxLeft = typeof window !== 'undefined' ? Math.max(16, window.innerWidth - cardWidth - 16) : 200;
        const left = Math.max(16, Math.min(Math.round(rect.left), maxLeft));
        this.popoverPosition.set({ top, left });
      }
    }
    this.isLocationDropdownOpen.set(nextState);
  }

  closeLocationDropdown() {
    this.isLocationDropdownOpen.set(false);
    this.isDetectingLocation.set(false);
  }

  @HostListener('document:click', ['$event'])
  onDocumentClick(event: MouseEvent) {
    const target = event.target as HTMLElement | null;
    if (target && !target.closest('.rh-search-wrap')) {
      this.isSearchDropdownOpen.set(false);
    }
  }

  @HostListener('document:keydown.escape')
  onEscape() {
    if (this.isLocationDropdownOpen()) this.closeLocationDropdown();
    if (this.isScheduleModalOpen()) this.closeScheduleModal();
    if (this.isSearchDropdownOpen()) this.isSearchDropdownOpen.set(false);
  }

  detectLocation(event?: Event) {
    if (event) event.stopPropagation();
    if (this.isDetectingLocation()) return;
    this.isDetectingLocation.set(true);
    this.detectionTimer = setTimeout(() => {
      this.selectLocation(this.availableLocations[0]);
      this.detectionTimer = null;
    }, 650);
  }

  selectLocation(location: typeof this.availableLocations[number]) {
    this.selectedLocation.set(location);
    this.closeLocationDropdown();
  }
}
