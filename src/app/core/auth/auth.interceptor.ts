import { inject } from '@angular/core'; import { HttpInterceptorFn, HttpErrorResponse } from '@angular/common/http';
import { catchError, switchMap, throwError } from 'rxjs'; import { AuthService } from './auth.service'; import { environment } from '../../../environments/environment';
export const authInterceptor: HttpInterceptorFn = (req, next) => {
 if (!req.url.startsWith(environment.apiUrl) || /\/auth\/(login|refresh|logout|primeiro-acesso|esqueci-senha)$/.test(req.url)) return next(req);
 const auth = inject(AuthService); const autenticada = auth.token() ? req.clone({ setHeaders: { Authorization: `Bearer ${auth.token()}` }, withCredentials: true }) : req;
 return next(autenticada).pipe(catchError((erro: HttpErrorResponse) => erro.status === 401 && auth.token() ? auth.renovar().pipe(switchMap(() => next(req.clone({ setHeaders: { Authorization: `Bearer ${auth.token()}` }, withCredentials: true })))) : throwError(() => erro)));
};
