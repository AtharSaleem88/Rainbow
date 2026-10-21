import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';

@Component({
  selector: 'app-promo-banners',
  standalone: true,
  imports: [CommonModule, RouterModule],
  templateUrl: './promo-banners.component.html',
  styleUrls: ['./promo-banners.component.scss']
})
export class PromoBannersComponent {}
