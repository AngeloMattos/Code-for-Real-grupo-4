import { inject } from '@angular/core';
import { CanActivateFn, CanMatchFn, Router } from '@angular/router';

import { Papel } from '../models/usuario';
import { AuthService } from './auth.service';

/** Sem sessão válida, volta ao login guardando a página para retornar depois. */
export const authGuard: CanActivateFn = (_route, state) => {
  const auth = inject(AuthService);
  if (auth.estaAutenticado()) {
    return true;
  }

  const expirou = auth.sessaoExpirou();
  auth.logout();
  return inject(Router).createUrlTree(['/login'], {
    queryParams: { retorno: state.url, ...(expirou ? { expirada: 1 } : {}) },
  });
};

/**
 * Só casa a rota se o setor logado estiver em `data.papeis`; senão cai no `**` e volta ao início.
 * É experiência de uso, não segurança: quem garante o acesso é o Spring.
 */
export const papelGuard: CanMatchFn = (route) => {
  const papeis = route.data?.['papeis'] as Papel[] | undefined;
  const papel = inject(AuthService).papel();
  return !papeis || (papel !== null && papeis.includes(papel));
};

/** Quem já está logado não precisa ver o login de novo. */
export const visitanteGuard: CanActivateFn = () =>
  inject(AuthService).estaAutenticado() ? inject(Router).createUrlTree(['/inicio']) : true;
