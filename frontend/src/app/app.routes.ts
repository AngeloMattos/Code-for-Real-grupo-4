import { Routes } from '@angular/router';

import { authGuard, visitanteGuard } from './core/auth/auth.guard';

export const routes: Routes = [
  { path: '', pathMatch: 'full', redirectTo: 'inicio' },
  {
    path: 'login',
    title: 'Entrar · Folha Conecta',
    canActivate: [visitanteGuard],
    loadComponent: () => import('./pages/auth/login/login').then((m) => m.Login),
  },
  {
    path: 'inicio',
    title: 'Início · Folha Conecta',
    canActivate: [authGuard],
    loadComponent: () => import('./pages/inicio/inicio').then((m) => m.Inicio),
  },
  { path: '**', redirectTo: 'inicio' },
];
