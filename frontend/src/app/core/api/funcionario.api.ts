import { HttpClient } from '@angular/common/http';
import { inject, Injectable, InjectionToken } from '@angular/core';
import { Observable } from 'rxjs';

import { environment } from '../../../environments/environment';
import { FuncionarioResumo } from '../models/funcionario';

export interface FuncionarioApi {
  /** GET /funcionarios: RH, Financeiro, Contabilidade e Admin. */
  listar(): Observable<FuncionarioResumo[]>;
}

/** Troque o provider em app.config.ts (fake → http) quando o Spring estiver no ar. */
export const FUNCIONARIO_API = new InjectionToken<FuncionarioApi>('FUNCIONARIO_API');

@Injectable()
export class FuncionarioApiHttp implements FuncionarioApi {
  private readonly http = inject(HttpClient);

  listar(): Observable<FuncionarioResumo[]> {
    return this.http.get<FuncionarioResumo[]>(`${environment.apiUrl}/funcionarios`);
  }
}
