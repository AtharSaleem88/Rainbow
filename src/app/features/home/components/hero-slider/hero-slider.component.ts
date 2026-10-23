import { Component, Input, signal, OnInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { HeroSlide } from '../../models/home.model';

@Component({
  selector: 'app-hero-slider',
  standalone: true,
  imports: [CommonModule, RouterModule],
  templateUrl: './hero-slider.component.html',
  styleUrls: ['./hero-slider.component.scss']
})
export class HeroSliderComponent implements OnInit, OnDestroy {
  @Input({ required: true }) slides: HeroSlide[] = [];

  currentHeroIndex = signal(0);
  private heroInterval: ReturnType<typeof setInterval> | null = null;
  private touchStartX = 0;
  private touchStartY = 0;

  ngOnInit() {
    this.startHeroSlider();
  }

  ngOnDestroy() {
    this.stopHeroSlider();
  }

  startHeroSlider() {
    this.stopHeroSlider();
    if (!this.slides.length) return;
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;
    this.heroInterval = setInterval(() => {
      this.nextHeroSlide();
    }, 4500);
  }

  stopHeroSlider() {
    if (this.heroInterval) {
      clearInterval(this.heroInterval);
      this.heroInterval = null;
    }
  }

  nextHeroSlide() {
    if (!this.slides.length) return;
    this.currentHeroIndex.update(idx => (idx + 1) % this.slides.length);
  }

  prevHeroSlide() {
    if (!this.slides.length) return;
    this.currentHeroIndex.update(idx => (idx - 1 + this.slides.length) % this.slides.length);
  }

  setHeroSlide(index: number) {
    this.currentHeroIndex.set(index);
    this.startHeroSlider();
  }

  onTouchStart(e: TouchEvent) {
    this.stopHeroSlider();
    if (e.touches && e.touches.length > 0) {
      this.touchStartX = e.touches[0].clientX;
      this.touchStartY = e.touches[0].clientY;
    }
  }

  onTouchEnd(e: TouchEvent) {
    if (e.changedTouches && e.changedTouches.length > 0) {
      const deltaX = e.changedTouches[0].clientX - this.touchStartX;
      const deltaY = e.changedTouches[0].clientY - this.touchStartY;
      if (Math.abs(deltaX) > Math.abs(deltaY) && Math.abs(deltaX) > 40) {
        if (deltaX < 0) {
          this.nextHeroSlide();
        } else {
          this.prevHeroSlide();
        }
      }
    }
    this.startHeroSlider();
  }
}
