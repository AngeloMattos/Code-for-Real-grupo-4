import { HttpClient } from '@angular/common/http';
import { inject, Injectable, InjectionToken } from '@angular/core';
import { Observable } from 'rxjs';

import { environment } from '../../../environments/environment';
import { RegistroPonto } from '../models/ponto';

export interface PontoApi {
  /** Ponto de todos os funcionários da empresa na competência ("2026-10"). */
  equipe(competencia: string): Observable<RegistroPonto[]>;
  /** Ponto da pessoa logada na competência. */
  meu(competencia: string): Observable<RegistroPonto[]>;
  /** Registro de hoje da pessoa logada; null antes da primeira marcação. */
  hoje(): Observable<RegistroPonto | null>;
  /** Registra a próxima marcação de hoje: primeiro a entrada, depois a saída. */
  registrar(): Observable<RegistroPonto>;
}

/** Troque o provider em app.config.ts (fake → http) quando o Spring estiver no ar. */
export const PONTO_API = new InjectionToken<PontoApi>('PONTO_API');

@Injectable()
export class PontoApiHttp implements PontoApi {
  private readonly http = inject(HttpClient);

  equipe(competencia: string): Observable<RegistroPonto[]> {
    return this.http.get<RegistroPonto[]>(`${environment.apiUrl}/ponto`, { params: { competencia } });
  }

  meu(competencia: string): Observable<RegistroPonto[]> {
    return this.http.get<RegistroPonto[]>(`${environment.apiUrl}/ponto/meu`, { params: { competencia } });
  }

  hoje(): Observable<RegistroPonto | null> {
    return this.http.get<RegistroPonto | null>(`${environment.apiUrl}/ponto/meu/hoje`);
  }

  registrar(): Observable<RegistroPonto> {
    return this.http.post<RegistroPonto>(`${environment.apiUrl}/ponto/meu/marcacoes`, {});
  }
}
