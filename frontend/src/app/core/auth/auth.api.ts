import { HttpClient } from '@angular/common/http';
import { inject, Injectable, InjectionToken } from '@angular/core';
import { Observable } from 'rxjs';

import { environment } from '../../../environments/environment';
import { LoginRequest, LoginResponse } from '../models/usuario';

export interface AuthApi {
  login(req: LoginRequest): Observable<LoginResponse>;
}

/** Troque o provider em app.config.ts (fake → http) quando o Spring estiver no ar. */
export const AUTH_API = new InjectionToken<AuthApi>('AUTH_API');

@Injectable()
export class AuthApiHttp implements AuthApi {
  private readonly http = inject(HttpClient);

  login(req: LoginRequest): Observable<LoginResponse> {
    // withCredentials: o refresh token volta em cookie HttpOnly.
    return this.http.post<LoginResponse>(`${environment.apiUrl}/auth/login`, req, {
      withCredentials: true,
    });
  }
}
