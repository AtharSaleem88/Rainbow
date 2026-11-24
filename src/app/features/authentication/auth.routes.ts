import { Routes } from '@angular/router';

export const AUTH_ROUTES: Routes = [
  {
    path: 'login',
    loadComponent: () => import('./login.component').then(m => m.LoginComponent),
    title: 'Sign In — Rainbow'
  },
  {
    path: 'signup',
    loadComponent: () => import('./signup.component').then(m => m.SignupComponent),
    title: 'Create an Account — Rainbow'
  },
  {
    path: 'forgot-password',
    loadComponent: () => import('./forgot-password.component').then(m => m.ForgotPasswordComponent),
    title: 'Forgot Password — Rainbow'
  }
];
