import { AfterViewInit, Component, ElementRef, inject, OnDestroy, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ProductService } from '../../core/services/product.service';
import { SeoService } from '../../core/services/seo.service';
import { HeroSlide, SpotlightCategory, BrandItem, CampaignBanner } from './models/home.model';
import {
  HeroSliderComponent,
  CategoryGridComponent,
  CategorySpotlightsComponent,
  MonthlyDealsComponent,
  ProductCollectionRailComponent,
  PromoBannersComponent,
  BrandShowcaseComponent,
  CampaignSliderComponent,
  StorePolicyComponent
} from './components';
import { FloatingActionsComponent } from '../../shared/components/floating-actions/floating-actions.component';
import { ChatAssistantComponent } from '../../shared/components/chat-assistant/chat-assistant.component';

@Component({
  selector: 'app-home',
  standalone: true,
  imports: [
    CommonModule,
    HeroSliderComponent,
    CategoryGridComponent,
    CategorySpotlightsComponent,
    MonthlyDealsComponent,
    ProductCollectionRailComponent,
    PromoBannersComponent,
    BrandShowcaseComponent,
    CampaignSliderComponent,
    StorePolicyComponent,
    FloatingActionsComponent,
    ChatAssistantComponent
  ],
  templateUrl: './home.component.html',
  styleUrls: ['./home.component.scss']
})
export class HomeComponent implements OnInit, AfterViewInit, OnDestroy {
  private productService = inject(ProductService);
  private seoService = inject(SeoService);
  private readonly hostElement = inject<ElementRef<HTMLElement>>(ElementRef);
  private sectionRevealObserver?: IntersectionObserver;

  readonly categories = this.productService.getCategories();
  readonly allProducts = this.productService.getProducts();
  // The demo catalog has no sales figures; use review counts as a popularity proxy.
  readonly topSellingProducts = [...this.allProducts].filter(p => p.inStock).sort ( (a, b) => b.reviewCount - a.reviewCount).slice(0, 12);

  readonly farmProducts = this.allProducts.filter(p => ['ultra-fresh', 'organic-veggies'].includes(p.categorySlug));
  readonly priceDropProducts = this.allProducts.filter(p => p.oldPrice && p.oldPrice > p.price);
  readonly rainbowFinds = this.allProducts.filter(p => p.brand === 'Rainbow');
  readonly frozenProducts = this.allProducts.filter(p => p.categorySlug === 'frozen-food');

  readonly monthlyDeal = {
    title: 'Rainbow Monthly Ad',
    eyebrow: 'MONTHLY AD',
    description: 'Discover fresh picks, pantry essentials and everyday favourites in this month’s ad.',
    categories: this.allProducts
      .filter(product => product.oldPrice !== undefined && product.discountPercent !== undefined)
      .reduce((groups, product) => {
        const existing = groups.find(cat => cat.id === product.categorySlug);
        if (existing) {
          existing.deals.push(product);
        } else {
          groups.push({ id: product.categorySlug, name: product.category, deals: [product] });
        }
        return groups;
      }, [] as { id: string; name: string; deals: any[] }[])
  };

  readonly heroSlides: HeroSlide[] = [
    {
      id: 'frozen-goodness',
      theme: 'rh-hero-frozen',
      eyebrow: 'FROZEN GOODNESS',
      hasSparkle: false,
      title: 'Frozen Goodness',
      description: 'Quality you can taste, convenience you’ll love.',
      ctaText: 'Shop Frozen Food',
      image: 'assets/images/home/frozen-goodness-banner-clean.png',
      mobileImage: 'assets/images/home/mobile-frozen.jpeg',
      imageAlt: 'Frozen Goodness: quality you can taste, convenience you’ll love, with parathas, chicken nuggets, kebabs and finger fish.',
      link: '/shop',
      queryParams: { category: 'frozen-food' },
      hideCopy: true
    },
    {
      id: 'winter-fest',
      theme: 'rh-hero-winter',
      eyebrow: 'WINTER FEST',
      hasSparkle: false,
      title: 'Winter Fest — Up to 35% Off',
      description: 'Cozy season, bigger joy.',
      ctaText: 'Shop Winter Offers',
      image: 'assets/images/home/winter-background.png',
      mobileImage: 'assets/images/home/winter-background.png',
      imageAlt: 'Winter Fest, up to 35% off. Cozy season, bigger joy. Starting from 1st November.',
      link: '/shop',
      queryParams: { category: 'home-office' },
      hideCopy: true
    },
    {
      id: 'chefs-special-meat',
      theme: 'rh-hero-meat',
      eyebrow: 'FRESH FROM THE BUTCHER',
      hasSparkle: false,
      title: 'Chef’s Special Fresh Meat',
      description: 'Chicken, mutton and beef, fresh for your table.',
      ctaText: 'Shop Fresh Meat',
      image: 'assets/images/home/chefs-special-fresh-meat-clean.png',
      mobileImage: 'assets/images/home/mobile-meat.jpeg',
      imageAlt: 'Chef’s Special Fresh Meat — Meat you can Trust, Values you Share. Chicken, Mutton, Beef.',
      link: '/shop',
      queryParams: { category: 'chicken-meat-fish' },
      hideCopy: true
    }
  ];

  readonly spotlightCategories: SpotlightCategory[] = [
    { title: 'Baby Care', description: 'Gentle everyday care for little ones.', image: 'assets/images/home/baby-care-products.png', category: 'baby-care', theme: 'baby' },
    { title: 'Cosmetics', description: 'Beauty and personal care favourites.', image: 'assets/images/home/cosmetics-products.png', category: 'personal-care', theme: 'beauty' },
    { title: 'Beverages', description: 'Refreshing drinks for every moment.', image: 'assets/images/home/beverage-products.png', category: 'beverages', theme: 'beverages' },
    { title: 'Pharmacy', description: 'Everyday wellness essentials.', image: 'assets/images/home/pharmacy-products.png', category: 'pharma-wellness', theme: 'pharmacy' }
  ];

  readonly brands: BrandItem[] = [
    { name: 'Nestlé', logo: 'https://thumb.wikimedia.org/wikipedia/commons/thumb/3/3d/Nestle_textlogo_red.svg/330px-Nestle_textlogo_red.svg.png' },
    { name: 'Pepsi', logo: 'https://thumb.wikimedia.org/wikipedia/commons/thumb/6/68/Pepsi_2023.svg/250px-Pepsi_2023.svg.png' },
    { name: 'Coca-Cola', logo: 'https://thumb.wikimedia.org/wikipedia/commons/thumb/c/ce/Coca-Cola_logo.svg/330px-Coca-Cola_logo.svg.png' },
    { name: 'Nivea', logo: 'https://thumb.wikimedia.org/wikipedia/commons/thumb/d/d3/NIVEA_logo_2021.svg/500px-NIVEA_logo_2021.svg.png' },
    { name: 'Dove', logo: 'https://thumb.wikimedia.org/wikipedia/commons/thumb/3/3e/Dove_dove.svg/330px-Dove_dove.svg.png' },
    { name: 'L’Oréal', logo: 'https://thumb.wikimedia.org/wikipedia/commons/thumb/9/9d/L%27Or%C3%A9al_logo.svg/330px-L%27Or%C3%A9al_logo.svg.png' },
    { name: 'Pampers', logo: 'assets/images/pampers-logo.png' },
    { name: 'Unilever', logo: 'https://thumb.wikimedia.org/wikipedia/commons/thumb/8/87/Unilever_text_logo.svg/330px-Unilever_text_logo.svg.png' },
    { name: 'Garnier', logo: 'https://thumb.wikimedia.org/wikipedia/commons/thumb/d/df/Garnier_wordmark.svg/330px-Garnier_wordmark.svg.png' },
    { name: 'Lipton', logo: 'https://thumb.wikimedia.org/wikipedia/commons/thumb/d/d2/Lipton_logo_%282014-2026%29.svg/250px-Lipton_logo_%282014-2026%29.svg.png' },
    { name: 'Knorr', logo: 'https://thumb.wikimedia.org/wikipedia/commons/thumb/d/dc/Knorr_Logo_2020.svg/330px-Knorr_Logo_2020.svg.png' }
  ];

  readonly campaignBanners: CampaignBanner[] = [
    { title: 'Back to School — Back to delicious', image: 'assets/images/campaign-back-to-school-v2.png', category: 'grocery', badge: 'FEATURED' },
    { title: 'Shan Foods — Bring home the taste of Pakistan', image: 'assets/images/campaign-shan-grocery-v2.png', category: 'grocery', badge: 'FEATURED' }
  ];

  ngOnInit(): void {
    this.seoService.setPageTitle('Rainbow - Online Grocery, Electronics & Everyday Essentials');
    this.seoService.setMetaDescription('Shop fresh grocery, pantry essentials, electronics, personal care and household items at Rainbow.');
  }

  ngAfterViewInit(): void {
    if (typeof window === 'undefined' || window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;

    const sections = this.hostElement.nativeElement.querySelectorAll<HTMLElement>(
      'app-hero-slider, app-category-grid, app-monthly-deals, app-category-spotlights, app-product-collection-rail, app-promo-banners, app-brand-showcase, app-campaign-slider, app-store-policy'
    );

    if (typeof IntersectionObserver === 'undefined') return;

    this.sectionRevealObserver = new IntersectionObserver(entries => {
      entries.forEach(entry => {
        if (!entry.isIntersecting) return;
        entry.target.classList.add('rh-home-in-view');
        this.sectionRevealObserver?.unobserve(entry.target);
      });
    }, { threshold: 0.08, rootMargin: '0px 0px -6% 0px' });

    sections.forEach(section => {
      section.classList.add('rh-home-reveal');
      this.sectionRevealObserver?.observe(section);
    });
  }

  ngOnDestroy(): void {
    this.sectionRevealObserver?.disconnect();
  }
}
