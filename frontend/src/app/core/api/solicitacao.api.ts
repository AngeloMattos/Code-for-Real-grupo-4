import { HttpClient } from '@angular/common/http';
import { inject, Injectable, InjectionToken } from '@angular/core';
import { Observable } from 'rxjs';

import { environment } from '../../../environments/environment';
import { Papel } from '../models/usuario';

/** Envio de documento do funcionário (POST /solicitacoes, multipart). */
export interface NovaSolicitacao {
  titulo: string;
  /** Setor que recebe; por enquanto só o RH. */
  destino: Extract<Papel, 'RH'>;
  arquivo: File;
}

export interface SolicitacaoEnviada {
  id: number;
  titulo: string;
  enviadaEm: string;
}

export interface SolicitacaoApi {
  enviar(nova: NovaSolicitacao): Observable<SolicitacaoEnviada>;
}

/** Troque o provider em app.config.ts (fake → http) quando o Spring estiver no ar. */
export const SOLICITACAO_API = new InjectionToken<SolicitacaoApi>('SOLICITACAO_API');

@Injectable()
export class SolicitacaoApiHttp implements SolicitacaoApi {
  private readonly http = inject(HttpClient);

  enviar({ titulo, destino, arquivo }: NovaSolicitacao): Observable<SolicitacaoEnviada> {
    const corpo = new FormData();
    corpo.append('titulo', titulo);
    corpo.append('destino', destino);
    corpo.append('arquivo', arquivo);
    return this.http.post<SolicitacaoEnviada>(`${environment.apiUrl}/solicitacoes`, corpo);
  }
}
