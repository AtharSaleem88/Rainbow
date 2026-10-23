import { Component, Input, signal, OnInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { CampaignBanner } from '../../models/home.model';

@Component({
  selector: 'app-campaign-slider',
  standalone: true,
  imports: [CommonModule, RouterModule],
  templateUrl: './campaign-slider.component.html',
  styleUrls: ['./campaign-slider.component.scss']
})
export class CampaignSliderComponent implements OnInit, OnDestroy {
  @Input({ required: true }) banners: CampaignBanner[] = [];

  activeCampaignIndex = signal(0);
  private campaignInterval: ReturnType<typeof setInterval> | null = null;

  get visibleCampaignBanners(): CampaignBanner[] {
    if (!this.banners.length) return [];
    const start = this.activeCampaignIndex();
    return [0, 1].map(offset => this.banners[(start + offset) % this.banners.length]);
  }

  ngOnInit(): void {
    this.startCampaignSlider();
  }

  ngOnDestroy(): void {
    this.stopCampaignSlider();
  }

  startCampaignSlider(): void {
    this.stopCampaignSlider();
    if (!this.banners.length) return;
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;
    this.campaignInterval = setInterval(() => {
      this.nextCampaignBanner();
    }, 6000);
  }

  stopCampaignSlider(): void {
    if (this.campaignInterval) {
      clearInterval(this.campaignInterval);
      this.campaignInterval = null;
    }
  }

  nextCampaignBanner(): void {
    if (!this.banners.length) return;
    this.activeCampaignIndex.update(idx => (idx + 1) % this.banners.length);
    this.startCampaignSlider();
  }

  prevCampaignBanner(): void {
    if (!this.banners.length) return;
    this.activeCampaignIndex.update(idx => (idx - 1 + this.banners.length) % this.banners.length);
    this.startCampaignSlider();
  }

  selectCampaignBanner(index: number): void {
    this.activeCampaignIndex.set(index);
    this.startCampaignSlider();
  }
}
