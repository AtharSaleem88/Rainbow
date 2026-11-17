import { Component, Input, signal, ElementRef, ViewChild } from '@angular/core';
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
  monthlyOfferPage = signal(0);
  @ViewChild('monthlyProducts') monthlyProducts?: ElementRef<HTMLElement>;

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
    const page = Math.max(0, Math.min(2, this.monthlyOfferPage() + Math.sign(direction)));
    this.monthlyOfferPage.set(page);
    const behavior: ScrollBehavior = window.matchMedia('(prefers-reduced-motion: reduce)').matches ? 'auto' : 'smooth';
    container.scrollTo({ left: (container.scrollWidth - container.clientWidth) * (page / 2), behavior });
  }

  scrollToMonthlyPage(page: number): void {
    if (!this.monthlyProducts?.nativeElement) return;
    const container = this.monthlyProducts.nativeElement;
    const targetPage = Math.max(0, Math.min(2, page));
    this.monthlyOfferPage.set(targetPage);
    const behavior: ScrollBehavior = window.matchMedia('(prefers-reduced-motion: reduce)').matches ? 'auto' : 'smooth';
    container.scrollTo({ left: (container.scrollWidth - container.clientWidth) * (targetPage / 2), behavior });
  }

  onMonthlyOffersScroll(): void {
    const container = this.monthlyProducts?.nativeElement;
    if (!container) return;
    const maxScroll = container.scrollWidth - container.clientWidth;
    const page = maxScroll > 0 ? Math.round((container.scrollLeft / maxScroll) * 2) : 0;
    this.monthlyOfferPage.set(Math.max(0, Math.min(2, page)));
  }

  scrollToMonthlyDeals(event: MouseEvent): void {
    event.preventDefault();
    const target = document.getElementById('rh-monthly-deal-list-title');
    if (!target) return;
    const behavior: ScrollBehavior = window.matchMedia('(prefers-reduced-motion: reduce)').matches ? 'auto' : 'smooth';
    target.scrollIntoView({ behavior, block: 'start' });
  }
}
