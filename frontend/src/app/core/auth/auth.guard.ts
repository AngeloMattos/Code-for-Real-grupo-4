import { inject } from '@angular/core';
import { CanActivateFn, Router } from '@angular/router';

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

/** Quem já está logado não precisa ver o login de novo. */
export const visitanteGuard: CanActivateFn = () =>
  inject(AuthService).estaAutenticado() ? inject(Router).createUrlTree(['/inicio']) : true;
