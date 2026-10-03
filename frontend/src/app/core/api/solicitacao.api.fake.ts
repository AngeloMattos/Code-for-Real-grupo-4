import { Injectable } from '@angular/core';
import { delay, Observable, of } from 'rxjs';

import { NovaSolicitacao, SolicitacaoApi, SolicitacaoEnviada } from './solicitacao.api';

let proximoId = 1000;

/** Finge o upload: devolve o protocolo depois de um tempo. O arquivo não sai do navegador. */
@Injectable()
export class SolicitacaoApiFake implements SolicitacaoApi {
  enviar(nova: NovaSolicitacao): Observable<SolicitacaoEnviada> {
    return of({ id: proximoId++, titulo: nova.titulo, enviadaEm: new Date().toISOString() }).pipe(delay(900));
  }
}
