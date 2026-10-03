import { Route, Routes } from '@angular/router';

import { authGuard, papelGuard, visitanteGuard } from './core/auth/auth.guard';
import { ItemMenu, MENU } from './core/navegacao';

/** Telas do menu já construídas; as demais abrem a página "em construção". */
const TELAS: Record<string, Route['loadComponent']> = {
  ponto: () => import('./pages/ponto/ponto').then((m) => m.Ponto),
  folha: () => import('./pages/folha/folha').then((m) => m.FolhaPagamento),
  holerites: () => import('./pages/holerites/holerites').then((m) => m.Holerites),
  'solicitacoes/nova': () =>
    import('./pages/enviar-documento/enviar-documento').then((m) => m.EnviarDocumento),
};

/** Rota de um item do menu, protegida pelos papéis do próprio item. */
function rotaDoMenu(item: ItemMenu): Route {
  return {
    path: item.caminho,
    title: `${item.rotulo} · Folha Conecta`,
    canMatch: [papelGuard],
    data: { papeis: item.papeis, titulo: item.rotulo, descricao: item.descricao },
    loadComponent:
      TELAS[item.caminho] ??
      (() => import('./pages/em-construcao/em-construcao').then((m) => m.EmConstrucao)),
  };
}

export const routes: Routes = [
  {
    path: 'login',
    title: 'Entrar · Folha Conecta',
    canActivate: [visitanteGuard],
    loadComponent: () => import('./pages/auth/login/login').then((m) => m.Login),
  },
  {
    // Layout base (sidebar + barra superior) de todas as telas logadas.
    path: '',
    canActivate: [authGuard],
    canActivateChild: [authGuard],
    loadComponent: () => import('./layout/app-shell/app-shell').then((m) => m.AppShell),
    children: [
      { path: '', pathMatch: 'full', redirectTo: 'inicio' },
      {
        path: 'inicio',
        title: 'Início · Folha Conecta',
        loadComponent: () => import('./pages/inicio/inicio').then((m) => m.Inicio),
      },
      {
        // Abrir e atribuir pendência: RH, Financeiro e Contabilidade (o funcionário usa /solicitacoes/nova).
        path: 'pendencias/nova',
        title: 'Nova pendência · Folha Conecta',
        canMatch: [papelGuard],
        data: { papeis: ['RH', 'FINANCEIRO', 'CONTABILIDADE'] },
        loadComponent: () => import('./pages/nova-pendencia/nova-pendencia').then((m) => m.NovaPendencia),
      },
      ...MENU.filter((item) => item.caminho !== 'inicio').map(rotaDoMenu),
    ],
  },
  { path: '**', redirectTo: 'inicio' },
];
