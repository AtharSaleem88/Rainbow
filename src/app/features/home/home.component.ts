import { Component, inject, OnInit } from '@angular/core';
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
    FloatingActionsComponent
  ],
  templateUrl: './home.component.html',
  styleUrls: ['./home.component.scss']
})
export class HomeComponent implements OnInit {
  private productService = inject(ProductService);
  private seoService = inject(SeoService);

  readonly categories = this.productService.getCategories();
  readonly allProducts = this.productService.getProducts();

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
      id: 'shaadi',
      theme: 'rh-hero-shaadi',
      eyebrow: 'WEDDING SPECIAL',
      hasSparkle: false,
      title: 'Shaadi Khana Abadi',
      description: 'Naye Bandhan, Shopping Bhi Nayi — Offer valid till 11th November 2026',
      ctaText: 'Shop Now',
      image: 'assets/images/shadi_web.png',
      mobileImage: 'assets/images/shadi_mobile.png',
      imageAlt: 'Shaadi Khana Abadi — Naye Bandhan, Shopping Bhi Nayi',
      link: '/shop',
      hideCopy: true
    },
    {
      id: 'electronics',
      theme: 'rh-hero-electronics',
      eyebrow: 'SMARTER EVERYDAY',
      hasSparkle: false,
      title: 'Electronics & Gadgets',
      description: 'Smart accessories and everyday tech essentials.',
      ctaText: 'Explore Collection',
      image: 'assets/images/rainbow-electronics-banner.png',
      imageAlt: 'Modern everyday electronics including headphones, a phone, and a smartwatch',
      link: '/shop',
      queryParams: { category: 'home-office' }
    },
    {
      id: 'health-beauty',
      theme: 'rh-hero-health',
      eyebrow: 'YOUR EVERYDAY RITUAL',
      hasSparkle: true,
      title: 'Health & Beauty',
      description: 'Little care, lasting confidence.',
      ctaText: 'Explore the collection',
      image: 'assets/images/rainbow-health-beauty-banner.png',
      imageAlt: 'Premium skincare and personal care products',
      link: '/shop',
      queryParams: { category: 'personal-care' }
    },{
      id: 'smart-solutions',
      theme: 'rh-hero-electronics',
      eyebrow: 'SMARTER EVERYDAY',
      hasSparkle: false,
      title: 'Smart Solutions Have Arrived',
      description: 'Massagers | Health Robot | Cleaning Robot',
      ctaText: 'Buy Now',
      image: 'assets/images/1430x340px.png',
      mobileImage: 'assets/images/402x275px.png',
      imageAlt: 'Smart Solutions Have Arrived — Massagers, Health Robot, Cleaning Robot',
      link: '/shop',
      queryParams: { category: 'home-office' },
      hideCopy: true
    }
  ];

  readonly spotlightCategories: SpotlightCategory[] = [
    { title: 'Baby Care', description: 'Gentle everyday care for little ones.', image: 'assets/images/shop/supermarket/img_01.png', category: 'baby-care', theme: 'baby' },
    { title: 'Cosmetics', description: 'Beauty and personal care favourites.', image: 'assets/images/shop/supermarket/img_02.png', category: 'personal-care', theme: 'beauty' },
    { title: 'Beverages', description: 'Refreshing drinks for every moment.', image: 'assets/images/Head/beverage.jpg', category: 'beverages', theme: 'beverages' },
    { title: 'Pharmacy', description: 'Everyday wellness essentials.', image: 'assets/images/shop/supermarket/img_06.png', category: 'pharma-wellness', theme: 'pharmacy' }
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
    this.seoService.setPageTitle('Rainbow Cash & Carry - Online Grocery, Electronics & Everyday Essentials');
    this.seoService.setMetaDescription('Shop fresh grocery, pantry essentials, electronics, personal care and household items at Rainbow Cash & Carry.');
  }
}
