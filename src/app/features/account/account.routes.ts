import { Routes } from '@angular/router';
import { authGuard } from '../../core/guards/auth.guard';

export const ACCOUNT_ROUTES: Routes = [
  {
    path: '',
    loadComponent: () => import('./account.component').then(m => m.AccountComponent),
    canActivate: [authGuard],
    title: 'My Account — Rainbow'
  }
];
