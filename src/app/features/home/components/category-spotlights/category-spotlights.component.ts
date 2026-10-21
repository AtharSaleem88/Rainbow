import { Component, Input } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { SpotlightCategory } from '../../models/home.model';

@Component({
  selector: 'app-category-spotlights',
  standalone: true,
  imports: [CommonModule, RouterModule],
  templateUrl: './category-spotlights.component.html',
  styleUrls: ['./category-spotlights.component.scss']
})
export class CategorySpotlightsComponent {
  @Input({ required: true }) spotlights: SpotlightCategory[] = [];
}
