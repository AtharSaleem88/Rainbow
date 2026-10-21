import { Injectable, inject } from '@angular/core';
import { Title, Meta } from '@angular/platform-browser';

@Injectable({
  providedIn: 'root'
})
export class SeoService {
  private readonly titleService = inject(Title);
  private readonly metaService = inject(Meta);

  private readonly siteName = 'Rainbow';

  setPageTitle(pageTitle?: string): void {
    if (!pageTitle || pageTitle.trim() === '' || pageTitle.trim().toLowerCase() === 'home') {
      this.titleService.setTitle(this.siteName);
    } else {
      this.titleService.setTitle(`${pageTitle.trim()} — ${this.siteName}`);
    }
  }

  setMetaDescription(description: string): void {
    this.metaService.updateTag({ name: 'description', content: description });
  }

  setSocialMeta(title: string, description: string, image?: string): void {
    this.metaService.updateTag({ property: 'og:title', content: title });
    this.metaService.updateTag({ property: 'og:description', content: description });
    if (image) {
      this.metaService.updateTag({ property: 'og:image', content: image });
    }
  }
}
