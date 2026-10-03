import { HttpClient } from '@angular/common/http';
import { inject, Injectable, InjectionToken } from '@angular/core';
import { Observable } from 'rxjs';

import { environment } from '../../../environments/environment';
import { CriarPendenciaRequest, Pendencia, PendenciaEvento } from '../models/pendencia';

export interface PendenciaApi {
  eventos(id: number): Observable<PendenciaEvento[]>;
  /** Abre e atribui uma pendência (RH, Financeiro, Contabilidade). */
  criar(req: CriarPendenciaRequest): Observable<Pendencia>;
}

/** Troque o provider em app.config.ts (fake → http) quando o Spring estiver no ar. */
export const PENDENCIA_API = new InjectionToken<PendenciaApi>('PENDENCIA_API');

@Injectable()
export class PendenciaApiHttp implements PendenciaApi {
  private readonly http = inject(HttpClient);
  private readonly url = `${environment.apiUrl}/pendencias`;

  eventos(id: number): Observable<PendenciaEvento[]> {
    return this.http.get<PendenciaEvento[]>(`${this.url}/${id}/eventos`);
  }

  criar(req: CriarPendenciaRequest): Observable<Pendencia> {
    return this.http.post<Pendencia>(this.url, req);
  }
}
