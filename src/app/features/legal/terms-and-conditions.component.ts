import { AfterViewInit, Component, ElementRef, HostListener, OnDestroy, OnInit, ViewChild, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { SeoService } from '../../core/services/seo.service';

interface TermsLink {
  id: string;
  title: string;
}

@Component({
  selector: 'app-terms-and-conditions',
  standalone: true,
  imports: [CommonModule, RouterModule],
  templateUrl: './terms-and-conditions.component.html',
  styleUrls: ['./terms-and-conditions.component.scss']
})
export class TermsAndConditionsComponent implements OnInit, AfterViewInit, OnDestroy {
  @ViewChild('termsPage') private termsPage?: ElementRef<HTMLElement>;

  private readonly seo = inject(SeoService);
  private animationContext?: gsap.Context;

  readonly contents: TermsLink[] = [
    { id: 'introduction', title: 'Introduction' },
    { id: 'products-pricing', title: 'Products & pricing' },
    { id: 'orders', title: 'Orders' },
    { id: 'payments', title: 'Payments' },
    { id: 'delivery', title: 'Delivery' },
    { id: 'returns', title: 'Returns & refunds' },
    { id: 'accounts', title: 'Accounts & contributions' },
    { id: 'promotions', title: 'Promotions' },
    { id: 'intellectual-property', title: 'Intellectual property' },
    { id: 'liability', title: 'Liability' },
    { id: 'changes', title: 'Changes to terms' },
    { id: 'contact', title: 'Contact' }
  ];

  activeId = this.contents[0].id;
  progress = 0;
  showBackToTop = false;
  sidebarDocked = false;
  mobileNavTop: number | null = null;

  ngOnInit(): void {
    if (typeof window !== 'undefined') window.scrollTo({ top: 0, left: 0, behavior: 'instant' });
    this.seo.setPageTitle('Terms & Conditions');
    this.seo.setMetaDescription('Review the terms and conditions for shopping with Rainbow Cash & Carry, including order, payment and delivery information.');
  }

  ngAfterViewInit(): void {
    if (typeof window === 'undefined' || !this.termsPage) return;
    queueMicrotask(() => this.updateMobileNavTop());
    const root = this.termsPage.nativeElement;
    const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

    if (!reduceMotion) {
      gsap.registerPlugin(ScrollTrigger);
      this.animationContext = gsap.context(() => {
        gsap.from('.terms-hero-eyebrow, .terms-hero h1, .terms-hero-copy', {
          autoAlpha: 0, y: 22, duration: 0.75, stagger: 0.12, ease: 'power3.out'
        });
        gsap.utils.toArray<HTMLElement>('.terms-content-section').forEach(section => {
          gsap.from(section, {
            autoAlpha: 0, y: 24, duration: 0.65, ease: 'power2.out',
            scrollTrigger: { trigger: section, start: 'top 88%', once: true }
          });
        });
      }, root);
    }

    this.updateReadingProgress();
  }

  @HostListener('window:scroll')
  updateReadingProgress(): void {
    if (typeof window === 'undefined') return;
    const scrollable = document.documentElement.scrollHeight - window.innerHeight;
    this.progress = scrollable > 0 ? Math.min(100, Math.max(0, (window.scrollY / scrollable) * 100)) : 0;
    this.showBackToTop = window.scrollY > 420;
    const page = this.termsPage?.nativeElement;
    if (page) {
      const pageBounds = page.getBoundingClientRect();
      const topOffset = window.innerWidth <= 700 ? this.mobileNavTop ?? 0 : window.innerWidth <= 900 ? 108 : 28;
      const pageTopPadding = Number.parseFloat(window.getComputedStyle(page).paddingTop) || 0;
      this.sidebarDocked = pageBounds.top + pageTopPadding <= topOffset && pageBounds.bottom > window.innerHeight + 20;
    } else {
      this.sidebarDocked = false;
    }
    this.updateActiveSection();
  }

  private updateActiveSection(): void {
    const root = this.termsPage?.nativeElement;
    if (!root) return;
    const sections = root.querySelectorAll<HTMLElement>('[data-terms-section]');
    const navHeight = window.innerWidth <= 700 ? root.querySelector('.terms-sidebar')?.getBoundingClientRect().height ?? 0 : 0;
    const readingLine = window.innerWidth <= 700 ? (this.mobileNavTop ?? 0) + navHeight + 48 : Math.min(window.innerHeight * 0.35, 280);
    let current = sections[0]?.id;
    sections.forEach(section => {
      if (section.getBoundingClientRect().top <= readingLine) current = section.id;
    });
    if (current && current !== this.activeId) {
      this.activeId = current;
      this.centerActiveLink(current);
    }
  }

  private centerActiveLink(id: string): void {
    if (window.innerWidth > 700) return;
    const nav = this.termsPage?.nativeElement.querySelector<HTMLElement>('.terms-toc nav');
    const link = nav?.querySelector<HTMLElement>(`a[href="#${id}"]`);
    if (!nav || !link) return;
    const navRect = nav.getBoundingClientRect();
    const linkRect = link.getBoundingClientRect();
    const left = nav.scrollLeft + linkRect.left - navRect.left - (nav.clientWidth - linkRect.width) / 2;
    nav.scrollTo({ left, behavior: window.matchMedia('(prefers-reduced-motion: reduce)').matches ? 'instant' : 'smooth' });
  }

  @HostListener('window:resize')
  updateMobileNavTop(): void {
    if (typeof window === 'undefined') return;
    const header = document.querySelector<HTMLElement>('app-header');
    this.mobileNavTop = window.innerWidth <= 700 ? Math.ceil(header?.getBoundingClientRect().height ?? 0) : null;
    this.updateReadingProgress();
    this.centerActiveLink(this.activeId);
  }

  scrollToSection(event: Event, id: string): void {
    event.preventDefault();
    const target = document.getElementById(id);
    if (!target) return;
    const behavior = window.matchMedia('(prefers-reduced-motion: reduce)').matches ? 'instant' : 'smooth';
    if (window.innerWidth <= 700) {
      const navHeight = this.termsPage?.nativeElement.querySelector('.terms-sidebar')?.getBoundingClientRect().height ?? 0;
      window.scrollTo({ top: window.scrollY + target.getBoundingClientRect().top - (this.mobileNavTop ?? 0) - navHeight - 40, behavior });
    } else {
      target.scrollIntoView({ behavior, block: 'start' });
    }
    this.activeId = id;
    this.centerActiveLink(id);
  }

  backToTop(): void {
    window.scrollTo({ top: 0, behavior: window.matchMedia('(prefers-reduced-motion: reduce)').matches ? 'instant' : 'smooth' });
  }

  ngOnDestroy(): void {
    this.animationContext?.revert();
  }
}
