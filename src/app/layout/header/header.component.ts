import { Component, signal, HostListener, inject, OnInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router, RouterModule } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { CartService } from '../../core/services/cart.service';
import { ProductService } from '../../core/services/product.service';
import { AuthService } from '../../core/services/auth.service';

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

  onInputFocus() {
    this.isInputFocused.set(true);
  }

  onInputBlur() {
    this.isInputFocused.set(false);
  }

  @HostListener('window:scroll', [])
  onWindowScroll() {
    this.isScrolled.set(window.scrollY > 100);
  }

  toggleDept() {
    this.isDeptOpen.set(!this.isDeptOpen());
  }

  onSearch() {
    if (this.searchQuery().trim()) {
      this.router.navigate(['/shop'], { queryParams: { q: this.searchQuery() } });
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

  @HostListener('document:keydown.escape')
  onEscape() {
    if (this.isLocationDropdownOpen()) this.closeLocationDropdown();
    if (this.isScheduleModalOpen()) this.closeScheduleModal();
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
