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
  readonly rainbowFinds = this.allProducts.filter(p => !['ultra-fresh', 'organic-veggies', 'frozen-food'].includes(p.categorySlug));
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
    }
  ];

  readonly spotlightCategories: SpotlightCategory[] = [
    { title: 'Baby Care', description: 'Gentle everyday care for little ones.', image: 'assets/images/shop/supermarket/img_01.png', category: 'baby-care', theme: 'baby' },
    { title: 'Cosmetics', description: 'Beauty and personal care favourites.', image: 'assets/images/shop/supermarket/img_02.png', category: 'personal-care', theme: 'beauty' },
    { title: 'Beverages', description: 'Refreshing drinks for every moment.', image: 'assets/images/Head/beverage.jpg', category: 'beverages', theme: 'beverages' },
    { title: 'Pharmacy', description: 'Everyday wellness essentials.', image: 'assets/images/shop/supermarket/img_06.png', category: 'pharma-wellness', theme: 'pharmacy' }
  ];

  readonly brands: BrandItem[] = [
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

  readonly campaignBanners: CampaignBanner[] = [
    { title: 'Back to School — Back to delicious', image: 'assets/images/campaign-back-to-school-v2.png', category: 'grocery' },
    { title: 'Shan Foods — Bring home the taste of Pakistan', image: 'assets/images/campaign-shan-grocery-v2.png', category: 'grocery' }
  ];

  ngOnInit(): void {
    this.seoService.setPageTitle('Rainbow Cash & Carry - Online Grocery, Electronics & Everyday Essentials');
    this.seoService.setMetaDescription('Shop fresh grocery, pantry essentials, electronics, personal care and household items at Rainbow Cash & Carry.');
  }
}
