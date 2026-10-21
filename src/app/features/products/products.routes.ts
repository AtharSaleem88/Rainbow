import { Routes } from '@angular/router';

export const PRODUCT_ROUTES: Routes = [
  {
    path: '',
    loadComponent: () => import('./shop.component').then(m => m.ShopComponent),
    title: 'Shop All Products — Rainbow'
  }
];
