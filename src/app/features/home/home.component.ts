import { Component, inject, signal, OnInit, OnDestroy, HostListener, ElementRef, ViewChild } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { ProductService } from '../../core/services/product.service';
import { Product } from '../../core/models/product.model';
import { ProductCardComponent } from '../../shared/components/product-card/product-card.component';

@Component({
  selector: 'app-home',
  standalone: true,
  imports: [CommonModule, RouterModule, ProductCardComponent],
  templateUrl: './home.component.html',
  styleUrls: ['./home.component.scss']
})
export class HomeComponent implements OnInit, OnDestroy {
  productService = inject(ProductService);

  categories = this.productService.getCategories();
  allProducts = this.productService.getProducts();
  readonly farmProducts = this.allProducts.filter(product => ['ultra-fresh', 'organic-veggies'].includes(product.categorySlug));
  readonly priceDropProducts = this.allProducts.filter(product => product.oldPrice && product.oldPrice > product.price);
  readonly rainbowFinds = this.allProducts.filter(product => !['ultra-fresh', 'organic-veggies', 'frozen-food'].includes(product.categorySlug));
  readonly frozenProducts = this.allProducts.filter(product => product.categorySlug === 'frozen-food');
  readonly bestSellerProducts = this.allProducts.filter(product => product.rating >= 4.8).slice(0, 3);
  readonly trendingProducts = this.allProducts.filter(product => product.categorySlug === 'grocery').slice(0, 3);
  readonly popularProducts = this.allProducts.filter(product => product.rating >= 4.6).slice(3, 6);

  readonly monthlyDeal = {
    title: 'Rainbow Monthly Ad',
    eyebrow: 'MONTHLY AD',
    description: 'Discover fresh picks, pantry essentials and everyday favourites in this month’s ad.',
    startDate: '',
    endDate: '',
    categories: this.allProducts
      .filter(product => product.oldPrice !== undefined && product.discountPercent !== undefined)
      .reduce((groups, product) => {
        const existing = groups.find(category => category.id === product.categorySlug);
        if (existing) existing.deals.push(product);
        else groups.push({ id: product.categorySlug, name: product.category, deals: [product] });
        return groups;
      }, [] as { id: string; name: string; deals: Product[] }[])
  };

  activeMonthlyDealCategory = signal<string>('all');
  monthlyFlyerOpen = signal(false);
  @ViewChild('monthlyProducts') monthlyProducts?: ElementRef<HTMLElement>;
  @ViewChild('categoryGrid') categoryGrid?: ElementRef<HTMLElement>;
  private monthlyFlyerTrigger: HTMLElement | null = null;
  activeCategoryPageIndex = signal<number>(0);

  onCategoryScroll(event: Event) {
    const target = event.target as HTMLElement;
    if (target) {
      const scrollLeft = target.scrollLeft;
      const maxScroll = target.scrollWidth - target.clientWidth;
      if (maxScroll > 0) {
        const progress = Math.min(1, Math.max(0, scrollLeft / maxScroll));
        const pageIndex = Math.min(2, Math.round(progress * 2));
        this.activeCategoryPageIndex.set(pageIndex);
      }
    }
  }

  scrollToCategoryPage(pageIndex: number) {
    if (this.categoryGrid?.nativeElement) {
      const maxScroll = this.categoryGrid.nativeElement.scrollWidth - this.categoryGrid.nativeElement.clientWidth;
      const targetScroll = (pageIndex / 2) * maxScroll;
      this.categoryGrid.nativeElement.scrollTo({ left: targetScroll, behavior: 'smooth' });
      this.activeCategoryPageIndex.set(pageIndex);
    }
  }

  selectedBrand = signal<{ name: string; logo: string } | null>(null);
  @ViewChild('brandProductsRail') brandProductsRail?: ElementRef<HTMLElement>;
  get selectedBrandProducts(): Product[] {
    const brand = this.selectedBrand()?.name;
    if (!brand) return [];
    return this.allProducts.filter(product => product.brand.toLowerCase().includes(brand.toLowerCase()));
  }

  // Brands list for infinite track
  brands = [
    { name: 'Nestlé', logo: 'https://i.pinimg.com/736x/57/4a/49/574a49d329cf76971d33493ae4090d2e.jpg' },
    { name: 'Pepsi', logo: 'https://i.pinimg.com/736x/45/bc/50/45bc50a0149c34ca894c028550fbef1d.jpg' },
    { name: 'Coca-Cola', logo: 'https://i.pinimg.com/736x/b2/96/84/b29684a0f29820b780120f4ea2ce8051.jpg' },
    { name: 'Nivea', logo: 'https://i.pinimg.com/736x/55/a0/92/55a0924f479e4ded191cf8cf667f2446.jpg' },
    { name: 'Dove', logo: 'https://i.pinimg.com/736x/da/53/b0/da53b08b82674cd5130df7f4c1c93c15.jpg' },
    { name: 'L\'Oréal', logo: 'https://i.pinimg.com/736x/c8/9b/28/c89b283f9f6f516ec6af70277279e930.jpg' },
    { name: 'Pampers', logo: 'https://i.pinimg.com/736x/31/27/1d/31271d9c4d399a6ace62914479e0c84f.jpg' },
    { name: 'Unilever', logo: 'https://i.pinimg.com/736x/4e/8a/9f/4e8a9f7132bcb166350f0b89f5d1ddd2.jpg' },
    { name: 'Garnier', logo: 'https://i.pinimg.com/236x/3d/d8/7b/3dd87bd02b590b84b2dea0d71b8e5355.jpg' },
    { name: 'Lipton', logo: 'https://i.pinimg.com/736x/8f/b1/c9/8fb1c97de285b51823710662fe8529ee.jpg' },
    { name: 'Knorr', logo: 'https://i.pinimg.com/736x/71/84/c2/7184c2344ae3af62e4e216153f3bd38c.jpg' }
  ];

  readonly spotlightCategories = [
    { title: 'Baby Care', description: 'Gentle everyday care for little ones.', image: 'assets/images/shop/supermarket/img_01.png', category: 'baby-care', theme: 'baby' },
    { title: 'Cosmetics', description: 'Beauty and personal care favourites.', image: 'assets/images/shop/supermarket/img_02.png', category: 'personal-care', theme: 'beauty' },
    { title: 'Beverages', description: 'Refreshing drinks for every moment.', image: 'assets/images/Head/beverage.jpg', category: 'beverages', theme: 'beverages' },
    { title: 'Pharmacy', description: 'Everyday wellness essentials.', image: 'assets/images/shop/supermarket/img_06.png', category: 'pharma-wellness', theme: 'pharmacy' }
  ];

  readonly campaignBanners = [
    { title: 'Designer Perfumes — Best Price Ever', image: 'assets/images/banner/perfumes-hero-banner.jpg', category: 'personal-care' },
    { title: 'Back to School — Back to delicious', image: 'assets/images/campaign-back-to-school-v2.png', category: 'grocery' },
    { title: 'Shan Foods — Bring home the taste of Pakistan', image: 'assets/images/campaign-shan-grocery-v2.png', category: 'grocery' }
  ];
  activeCampaignIndex = signal(0);
  get visibleCampaignBanners() {
    const start = this.activeCampaignIndex();
    return [0, 1].map(offset => this.campaignBanners[(start + offset) % this.campaignBanners.length]);
  }
  private campaignInterval: ReturnType<typeof setInterval> | null = null;

  // Hero slider state
  currentHeroIndex = signal(0);
  readonly heroSlides = [
    {
      theme: 'rh-hero-perfumes',
      bannerImage: 'assets/images/banner/perfumes-hero-banner.jpg',
      imageAlt: 'Designer Perfumes at Cost Price — Roberto Cavalli, Gucci, Hugo Boss, Chanel',
      title: 'Luxury Perfumes Collection',
      link: '/shop',
      queryParams: { category: 'personal-care', q: 'perfume' }
    },
    {
      theme: 'rh-hero-primary',
      eyebrow: 'FRESH FROM FARM',
      title: 'Stock Up On Daily Essentials',
      image: 'assets/images/slider/supermarket/img_01.png',
      imageAlt: 'A basket filled with fresh vegetables',
      artLabel: 'Fresh picks, every day',
      ctaText: 'Shop fresh',
      link: '/shop',
      queryParams: { category: 'ultra-fresh' }
    },
    {
      theme: 'rh-hero-green',
      eyebrow: 'EVERYDAY GROCERIES',
      title: 'Everything You need, All In One Place',
      image: 'assets/images/slider/supermarket/img_04.png',
      imageAlt: 'A selection of pantry and grocery products',
      artLabel: 'Everyday favourites',
      ctaText: 'Shop groceries',
      link: '/shop',
      queryParams: { category: 'grocery' }
    },
    {
      theme: 'rh-hero-secondary',
      eyebrow: 'GREAT VALUE, EVERY DAY',
      title: 'Good Finds For Your Whole Home',
      image: 'assets/images/slider/supermarket/img_03.png',
      imageAlt: 'A selection of personal care and home essentials',
      artLabel: 'Trusted brands',
      ctaText: 'Explore offers',
      link: '/shop',
      queryParams: { category: 'personal-care' }
    }
  ];

  sliderInterval: ReturnType<typeof setInterval> | null = null;

  ngOnInit() {
    this.startHeroSlider();
    this.startCampaignSlider();
  }

  ngOnDestroy() {
    this.stopHeroSlider();
    this.stopCampaignSlider();
    document.body.classList.remove('rh-monthly-flyer-modal-open');
    document.body.classList.remove('rh-brand-modal-open');
  }

  startHeroSlider() {
    this.stopHeroSlider();
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;
    this.sliderInterval = setInterval(() => {
      this.nextHeroSlide();
    }, 5000);
  }

  stopHeroSlider() {
    if (this.sliderInterval !== null) {
      clearInterval(this.sliderInterval);
      this.sliderInterval = null;
    }
  }

  nextHeroSlide() {
    this.currentHeroIndex.update(index => (index + 1) % this.heroSlides.length);
  }

  prevHeroSlide() {
    this.currentHeroIndex.update(index => (index - 1 + this.heroSlides.length) % this.heroSlides.length);
  }

  setHeroSlide(index: number) {
    this.currentHeroIndex.set(index);
    this.startHeroSlider();
  }

  get monthlyDeals(): Product[] {
    const deals = this.monthlyDeal.categories.flatMap(category => category.deals);
    const selectedCategory = this.activeMonthlyDealCategory();
    return selectedCategory === 'all'
      ? deals
      : this.monthlyDeal.categories.find(category => category.id === selectedCategory)?.deals ?? [];
  }

  getDiscountPercent(product: Product): number {
    if (product.discountPercent) return product.discountPercent;
    if (!product.oldPrice) return 0;
    return Math.round((1 - product.price / product.oldPrice) * 100);
  }

  scrollMonthlyOffers(direction: -1 | 1) {
    const behavior: ScrollBehavior = window.matchMedia('(prefers-reduced-motion: reduce)').matches ? 'auto' : 'smooth';
    this.monthlyProducts?.nativeElement.scrollBy({ left: direction * 300, behavior });
  }

  openMonthlyFlyer(event: MouseEvent) {
    this.monthlyFlyerTrigger = event.currentTarget as HTMLElement;
    this.monthlyFlyerOpen.set(true);
    document.body.classList.add('rh-monthly-flyer-modal-open');
    setTimeout(() => document.getElementById('rh-monthly-flyer-close')?.focus(), 0);
  }

  closeMonthlyFlyer() {
    if (!this.monthlyFlyerOpen()) return;
    this.monthlyFlyerOpen.set(false);
    document.body.classList.remove('rh-monthly-flyer-modal-open');
    this.monthlyFlyerTrigger?.focus();
    this.monthlyFlyerTrigger = null;
  }

  openBrand(brand: { name: string; logo: string }) {
    this.selectedBrand.set(brand);
    document.body.classList.add('rh-brand-modal-open');
    setTimeout(() => document.getElementById('rh-brand-close')?.focus(), 0);
  }

  closeBrand() {
    this.selectedBrand.set(null);
    document.body.classList.remove('rh-brand-modal-open');
  }

  scrollBrandProducts(direction: -1 | 1) {
    this.brandProductsRail?.nativeElement.scrollBy({ left: direction * 300, behavior: window.matchMedia('(prefers-reduced-motion: reduce)').matches ? 'auto' : 'smooth' });
  }

  startCampaignSlider() {
    this.stopCampaignSlider();
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;
    this.campaignInterval = setInterval(() => this.nextCampaignBanner(), 6000);
  }

  stopCampaignSlider() {
    if (this.campaignInterval !== null) {
      clearInterval(this.campaignInterval);
      this.campaignInterval = null;
    }
  }

  nextCampaignBanner() {
    this.activeCampaignIndex.update(index => (index + 1) % this.campaignBanners.length);
  }

  prevCampaignBanner() {
    this.activeCampaignIndex.update(index => (index - 1 + this.campaignBanners.length) % this.campaignBanners.length);
  }

  selectCampaignBanner(index: number) {
    this.activeCampaignIndex.set(index);
    this.startCampaignSlider();
  }

  @HostListener('document:keydown', ['$event'])
  onMonthlyFlyerKeydown(event: KeyboardEvent) {
    if (this.selectedBrand()) {
      if (event.key === 'Escape') this.closeBrand();
      return;
    }
    if (!this.monthlyFlyerOpen()) return;
    if (event.key === 'Escape') {
      this.closeMonthlyFlyer();
    } else if (event.key === 'Tab') {
      event.preventDefault();
      document.getElementById('rh-monthly-flyer-close')?.focus();
    }
  }

}
