import { Component, Input, signal, ElementRef, ViewChild, HostListener } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { Product } from '../../../../core/models/product.model';
import { ProductCardComponent } from '../../../../shared/components/product-card/product-card.component';

export interface MonthlyDealData {
  title: string;
  eyebrow: string;
  description: string;
  startDate?: string;
  endDate?: string;
  categories: { id: string; name: string; deals: Product[] }[];
}

@Component({
  selector: 'app-monthly-deals',
  standalone: true,
  imports: [CommonModule, RouterModule, ProductCardComponent],
  templateUrl: './monthly-deals.component.html',
  styleUrls: ['./monthly-deals.component.scss']
})
export class MonthlyDealsComponent {
  @Input({ required: true }) dealData!: MonthlyDealData;
  @Input({ required: true }) products: Product[] = [];

  activeMonthlyDealCategory = signal<string>('all');
  monthlyFlyerOpen = signal(false);
  @ViewChild('monthlyProducts') monthlyProducts?: ElementRef<HTMLElement>;
  private monthlyFlyerTrigger: HTMLElement | null = null;

  get monthlyDeals(): Product[] {
    const cat = this.activeMonthlyDealCategory();
    if (cat === 'all') {
      return this.dealData.categories.flatMap(category => category.deals);
    }
    return this.dealData.categories.find(category => category.id === cat)?.deals ?? [];
  }

  scrollMonthlyOffers(direction: number): void {
    if (!this.monthlyProducts?.nativeElement) return;
    const container = this.monthlyProducts.nativeElement;
    const scrollAmount = Math.max(container.clientWidth * 0.75, 260);
    const behavior: ScrollBehavior = window.matchMedia('(prefers-reduced-motion: reduce)').matches ? 'auto' : 'smooth';
    container.scrollBy({ left: direction * scrollAmount, behavior });
  }

  openMonthlyFlyer(event?: MouseEvent): void {
    this.monthlyFlyerTrigger = (event?.currentTarget as HTMLElement) ?? (document.activeElement as HTMLElement | null);
    this.monthlyFlyerOpen.set(true);
    document.body.classList.add('rh-monthly-flyer-modal-open');
    setTimeout(() => {
      document.getElementById('rh-monthly-flyer-close')?.focus();
    }, 50);
  }

  closeMonthlyFlyer(): void {
    if (!this.monthlyFlyerOpen()) return;
    this.monthlyFlyerOpen.set(false);
    document.body.classList.remove('rh-monthly-flyer-modal-open');
    this.monthlyFlyerTrigger?.focus();
    this.monthlyFlyerTrigger = null;
  }

  @HostListener('document:keydown', ['$event'])
  onKeydown(event: KeyboardEvent): void {
    if (!this.monthlyFlyerOpen()) return;
    if (event.key === 'Escape') {
      this.closeMonthlyFlyer();
    } else if (event.key === 'Tab') {
      event.preventDefault();
      document.getElementById('rh-monthly-flyer-close')?.focus();
    }
  }
}
