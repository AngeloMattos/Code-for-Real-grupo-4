import { HttpClient } from '@angular/common/http';
import { inject, Injectable, InjectionToken } from '@angular/core';
import { Observable } from 'rxjs';

import { environment } from '../../../environments/environment';
import { DashboardFuncionario, DashboardSetor } from '../models/dashboard';
import { Papel } from '../models/usuario';

export interface DashboardApi {
  setor(papel: Papel, competencia: string): Observable<DashboardSetor>;
  funcionario(competencia: string): Observable<DashboardFuncionario>;
}

/** Troque o provider em app.config.ts (fake → http) quando o Spring estiver no ar. */
export const DASHBOARD_API = new InjectionToken<DashboardApi>('DASHBOARD_API');

@Injectable()
export class DashboardApiHttp implements DashboardApi {
  private readonly http = inject(HttpClient);
  private readonly url = `${environment.apiUrl}/dashboard`;

  // O back decide o conteúdo pelo papel do token; o papel aqui só serve ao fake.
  setor(_papel: Papel, competencia: string): Observable<DashboardSetor> {
    return this.http.get<DashboardSetor>(this.url, { params: { competencia } });
  }

  funcionario(competencia: string): Observable<DashboardFuncionario> {
    return this.http.get<DashboardFuncionario>(this.url, { params: { competencia } });
  }
}
