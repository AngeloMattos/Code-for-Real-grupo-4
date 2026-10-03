import { HttpClient } from '@angular/common/http';
import { inject, Injectable, InjectionToken } from '@angular/core';
import { Observable } from 'rxjs';

import { environment } from '../../../environments/environment';
import { Folha, ItemFolha } from '../models/folha';

export interface FolhaApi {
  folha(competencia: string): Observable<Folha>;
  /** Valores por funcionário: só Financeiro e Contabilidade (LGPD). */
  itens(competencia: string): Observable<ItemFolha[]>;
  calcular(competencia: string): Observable<Folha>;
  /** 409 com a lista de pendências quando houver bloqueio. */
  enviarParaContabilidade(competencia: string): Observable<Folha>;
  fechar(competencia: string): Observable<Folha>;
  publicarHolerites(competencia: string): Observable<Folha>;
}

/** Troque o provider em app.config.ts (fake → http) quando o Spring estiver no ar. */
export const FOLHA_API = new InjectionToken<FolhaApi>('FOLHA_API');

@Injectable()
export class FolhaApiHttp implements FolhaApi {
  private readonly http = inject(HttpClient);
  private readonly url = `${environment.apiUrl}/folhas`;

  folha(competencia: string): Observable<Folha> {
    return this.http.get<Folha>(`${this.url}/${competencia}`);
  }

  itens(competencia: string): Observable<ItemFolha[]> {
    return this.http.get<ItemFolha[]>(`${this.url}/${competencia}/itens`);
  }

  calcular(competencia: string): Observable<Folha> {
    return this.http.post<Folha>(`${this.url}/${competencia}/calcular`, {});
  }

  enviarParaContabilidade(competencia: string): Observable<Folha> {
    return this.http.post<Folha>(`${this.url}/${competencia}/enviar-contabilidade`, {});
  }

  fechar(competencia: string): Observable<Folha> {
    return this.http.post<Folha>(`${this.url}/${competencia}/fechar`, {});
  }

  publicarHolerites(competencia: string): Observable<Folha> {
    return this.http.post<Folha>(`${this.url}/${competencia}/publicar-holerites`, {});
  }
}
