import { Component, signal, HostListener, inject, OnInit, OnDestroy, ElementRef, ViewChild } from '@angular/core';
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
    { id: 'lahore', name: 'Lahore', address: 'Lahore', city: 'Lahore' },
    { id: 'islamabad', name: 'Islamabad', address: 'Islamabad', city: 'Islamabad' },
    { id: 'karachi', name: 'Karachi', address: 'Karachi', city: 'Karachi' },
    { id: 'rawalpindi', name: 'Rawalpindi', address: 'Rawalpindi', city: 'Rawalpindi' },
    { id: 'faisalabad', name: 'Faisalabad', address: 'Faisalabad', city: 'Faisalabad' }
  ];
  selectedLocation = signal(this.availableLocations[0]);
  isLocationModalOpen = signal(false);
  isDetectingLocation = signal(false);
  locationQuery = signal('');
  filteredLocations = () => {
    const query = this.locationQuery().trim().toLocaleLowerCase();
    return query ? this.availableLocations.filter(location =>
      `${location.name} ${location.address} ${location.city}`.toLocaleLowerCase().includes(query)) : this.availableLocations;
  };
  @ViewChild('locationModal') private locationModal?: ElementRef<HTMLElement>;
  private previousFocus: HTMLElement | null = null;
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

  confirmSchedule(dateVal: string, slotVal: string) {
    this.selectedDeliveryDate.set(dateVal);
    this.selectedDeliveryTimeSlot.set(slotVal);
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

  openLocationModal() {
    this.previousFocus = document.activeElement instanceof HTMLElement ? document.activeElement : null;
    this.isLocationModalOpen.set(true);
    document.body.classList.add('modal-open');
    setTimeout(() => this.locationModal?.nativeElement.querySelector<HTMLElement>('button, input')?.focus());
  }

  closeLocationModal() {
    this.isLocationModalOpen.set(false);
    this.isDetectingLocation.set(false);
    document.body.classList.remove('modal-open');
    this.previousFocus?.focus();
  }

  @HostListener('document:keydown.escape')
  onEscape() {
    if (this.isLocationModalOpen()) this.closeLocationModal();
  }

  detectLocation() {
    if (this.isDetectingLocation()) return;
    this.isDetectingLocation.set(true);
    this.detectionTimer = setTimeout(() => {
      this.selectLocation(this.availableLocations[0]);
      this.detectionTimer = null;
    }, 650);
  }

  selectLocation(location: typeof this.availableLocations[number]) {
    this.selectedLocation.set(location);
    this.closeLocationModal();
  }
}
