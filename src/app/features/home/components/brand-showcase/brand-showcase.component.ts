import { Component, Input, signal, ViewChild, ElementRef, HostListener } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Product } from '../../../../core/models/product.model';
import { ProductCardComponent } from '../../../../shared/components/product-card/product-card.component';
import { BrandItem } from '../../models/home.model';

@Component({
  selector: 'app-brand-showcase',
  standalone: true,
  imports: [CommonModule, ProductCardComponent],
  templateUrl: './brand-showcase.component.html',
  styleUrls: ['./brand-showcase.component.scss']
})
export class BrandShowcaseComponent {
  @Input({ required: true }) brands: BrandItem[] = [];
  @Input({ required: true }) products: Product[] = [];

  selectedBrand = signal<BrandItem | null>(null);
  @ViewChild('brandProductsRail') brandProductsRail?: ElementRef<HTMLElement>;

  get selectedBrandProducts(): Product[] {
    const brand = this.selectedBrand()?.name;
    if (!brand) return [];
    return this.products.filter(product => product.brand.toLowerCase().includes(brand.toLowerCase()));
  }

  openBrand(brand: BrandItem): void {
    this.selectedBrand.set(brand);
    document.body.classList.add('rh-brand-modal-open');
    setTimeout(() => {
      document.getElementById('rh-brand-close')?.focus();
    }, 50);
  }

  closeBrand(): void {
    this.selectedBrand.set(null);
    document.body.classList.remove('rh-brand-modal-open');
  }

  scrollBrandProducts(direction: number): void {
    if (!this.brandProductsRail?.nativeElement) return;
    const container = this.brandProductsRail.nativeElement;
    const scrollAmount = Math.max(container.clientWidth * 0.75, 260);
    const behavior: ScrollBehavior = window.matchMedia('(prefers-reduced-motion: reduce)').matches ? 'auto' : 'smooth';
    container.scrollBy({ left: direction * scrollAmount, behavior });
  }

  @HostListener('document:keydown', ['$event'])
  onKeydown(event: KeyboardEvent): void {
    if (this.selectedBrand() && event.key === 'Escape') {
      this.closeBrand();
    }
  }
}
