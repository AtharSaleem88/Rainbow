import { AfterViewInit, Component, ElementRef, inject, OnDestroy, OnInit, ViewChild } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { SeoService } from '../../core/services/seo.service';

interface Person {
  name: string;
  role: string;
  image: string;
}

@Component({
  selector: 'app-about',
  standalone: true,
  imports: [CommonModule, RouterModule],
  templateUrl: './about.component.html',
  styleUrls: ['./about.component.scss']
})
export class AboutComponent implements OnInit, AfterViewInit, OnDestroy {
  @ViewChild('page') page?: ElementRef<HTMLElement>;

  private readonly seo = inject(SeoService);
  private context?: gsap.Context;
  private media?: gsap.MatchMedia;
  private resizeObserver?: ResizeObserver;

  readonly coreTeam: Person[] = [
    { name: 'M. Sajjad', role: 'Co-Founder', image: 'assets/images/about/sajjad.jpg' },
    { name: 'Abdul Jabbar', role: 'Director of Operations', image: 'assets/images/about/abdul-jabbar.jpg' },
    { name: 'H. Israr Anjum', role: 'Director of Purchase', image: 'assets/images/about/israr-anjum.jpg' }
  ];

  readonly leadership: Person[] = [
    { name: 'Sofia Rasool', role: 'Head of Accounts', image: 'assets/images/about/sofia-rasool.jpg' },
    { name: 'Junaid Ahmed', role: 'CFO', image: 'assets/images/about/junaid-ahmed.jpg' },
    { name: 'Junaid Akhtar', role: 'CFA', image: 'assets/images/about/junaid-akhtar.jpg' },
    { name: 'Gull e Zahra', role: 'Creative Head', image: 'assets/images/about/gull-e-zahra.jpg' },
    { name: 'Mansha', role: 'Head of Pharmacy', image: 'assets/images/about/mansha.jpg' },
    { name: 'Kamran Farooq', role: 'Head of Operations', image: 'assets/images/about/kamran-farooq.jpg' },
    { name: 'Saleem', role: 'Head of Contracts', image: 'assets/images/about/saleem.jpg' },
    { name: 'Waseem Shehzad', role: 'Commercial Head', image: 'assets/images/about/waseem-shehzad.jpg' },
    { name: 'Omer Mukhtar', role: 'Head Food Category', image: 'assets/images/about/omer-mukhtar.jpg' }
  ];

  ngOnInit(): void {
    if (typeof window !== 'undefined') window.scrollTo({ top: 0, left: 0, behavior: 'instant' });
    this.seo.setPageTitle('About Us');
    this.seo.setMetaDescription('Discover Rainbow Cash & Carry’s story, mission, and the people behind its stores across Punjab.');
  }

  ngAfterViewInit(): void {
    if (typeof window === 'undefined' || !this.page || window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;
    gsap.registerPlugin(ScrollTrigger);
    const root = this.page.nativeElement;

    this.context = gsap.context(() => {
      gsap.from('.about-hero-title > span > span', { yPercent: 110, duration: 1.05, stagger: 0.14, ease: 'power4.out' });
      gsap.from('.about-hero-intro, .about-hero-index', {
        autoAlpha: 0, y: 24, duration: 0.7, stagger: 0.11, delay: 0.45, ease: 'power3.out'
      });

      gsap.utils.toArray<HTMLElement>('[data-reveal]').forEach(element => {
        gsap.from(element, {
          autoAlpha: 0, y: 44, duration: 0.9, ease: 'power3.out',
          scrollTrigger: { trigger: element, start: 'top 88%', once: true }
        });
      });

      gsap.utils.toArray<HTMLElement>('[data-image-reveal]').forEach(element => {
        gsap.from(element, {
          clipPath: 'inset(0 0 100% 0 round 22px)', duration: 1.05, ease: 'power3.inOut',
          scrollTrigger: { trigger: element, start: 'top 83%', once: true }
        });
      });

      gsap.utils.toArray<HTMLElement>('[data-count]').forEach(element => {
        const value = Number(element.dataset['count'] ?? 0);
        const current = { value: 0 };
        gsap.to(current, {
          value, duration: 1.6, ease: 'power2.out',
          scrollTrigger: { trigger: element, start: 'top 90%', once: true },
          onUpdate: () => { element.textContent = Math.round(current.value).toLocaleString('en-US'); }
        });
      });

      gsap.from('.about-milestone', {
        autoAlpha: 0, y: 42, duration: 0.8, stagger: 0.16, ease: 'power3.out',
        scrollTrigger: { trigger: '.about-milestones', start: 'top 78%', once: true }
      });

      gsap.from('.about-person', {
        autoAlpha: 0, y: 42, duration: 0.75, stagger: 0.12, ease: 'power3.out',
        scrollTrigger: { trigger: '.about-core-grid', start: 'top 82%', once: true }
      });

      gsap.from('.about-ceo-content > *', {
        autoAlpha: 0, y: 28, duration: 0.72, stagger: 0.1, ease: 'power3.out',
        scrollTrigger: { trigger: '.about-ceo-panel', start: 'top 82%', once: true }
      });

      gsap.from('[data-purpose]', {
        autoAlpha: 0, y: 48, rotateY: 5, duration: 0.95, stagger: 0.18,
        ease: 'power3.out', transformPerspective: 1100,
        scrollTrigger: { trigger: '.about-purpose-grid', start: 'top 82%', once: true }
      });

      this.media = gsap.matchMedia();
      this.media.add('(min-width: 992px)', () => {
        gsap.to('.about-hero-photo', {
          yPercent: 13, scale: 1.08, ease: 'none',
          scrollTrigger: { trigger: '.about-hero', start: 'top top', end: 'bottom top', scrub: 0.6 }
        });
        gsap.to('.about-story-photo img', {
          scale: 1.045, ease: 'none',
          scrollTrigger: { trigger: '.about-story', start: 'top bottom', end: 'bottom top', scrub: 0.7 }
        });
        gsap.to('.about-milestone-line span', {
          scaleX: 1, transformOrigin: 'left', ease: 'none',
          scrollTrigger: { trigger: '.about-milestones', start: 'top 78%', end: 'bottom 50%', scrub: 0.6 }
        });
      });
    }, root);

    if (typeof ResizeObserver !== 'undefined') {
      this.resizeObserver = new ResizeObserver(() => ScrollTrigger.refresh());
      this.resizeObserver.observe(root);
    }
  }

  ngOnDestroy(): void {
    this.resizeObserver?.disconnect();
    this.media?.revert();
    this.context?.revert();
  }
}
