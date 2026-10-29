import { Params } from '@angular/router';

export interface HeroSlide {
  id: string;
  theme: string;
  eyebrow: string;
  hasSparkle: boolean;
  title: string;
  description: string;
  ctaText: string;
  image: string;
  mobileImage?: string;
  imageAlt: string;
  link: string;
  queryParams?: Params;
  hideCopy?: boolean;
}

export interface SpotlightCategory {
  title: string;
  description: string;
  image: string;
  category: string;
  theme: string;
}

export interface BrandItem {
  name: string;
  logo: string;
}

export interface CampaignBanner {
  title: string;
  image: string;
  category: string;
  badge?: string;
}
