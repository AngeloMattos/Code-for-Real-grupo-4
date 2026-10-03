import { HttpClient } from '@angular/common/http';
import { inject, Injectable, InjectionToken } from '@angular/core';
import { Observable } from 'rxjs';

import { environment } from '../../../environments/environment';
import { Holerite } from '../models/holerite';

export interface HoleriteApi {
  /** Holerites publicados da pessoa logada, do mais recente para o mais antigo. */
  meus(): Observable<Holerite[]>;
}

/** Troque o provider em app.config.ts (fake → http) quando o Spring estiver no ar. */
export const HOLERITE_API = new InjectionToken<HoleriteApi>('HOLERITE_API');

@Injectable()
export class HoleriteApiHttp implements HoleriteApi {
  private readonly http = inject(HttpClient);

  meus(): Observable<Holerite[]> {
    return this.http.get<Holerite[]>(`${environment.apiUrl}/holerites`);
  }
}
