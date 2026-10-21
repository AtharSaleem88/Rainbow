import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-store-policy',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './store-policy.component.html',
  styleUrls: ['./store-policy.component.scss']
})
export class StorePolicyComponent {
  readonly policies = [
    {
      icon: 'assets/images/icons/supermarket/icon_12.png',
      title: 'Free Delivery',
      desc: 'For all orders over Rs. 2000'
    },
    {
      icon: 'assets/images/icons/supermarket/icon_13.png',
      title: 'Safe payment',
      desc: '100% secure checkout'
    },
    {
      icon: 'assets/images/icons/supermarket/icon_14.png',
      title: 'Shop with confidence',
      desc: 'Freshness guarantee'
    },
    {
      icon: 'assets/images/icons/supermarket/icon_15.png',
      title: '24/7 help center',
      desc: 'Dedicated customer support'
    },
    {
      icon: 'assets/images/icons/supermarket/icon_16.png',
      title: 'Friendly services',
      desc: 'Satisfaction guarantee'
    }
  ];
}
