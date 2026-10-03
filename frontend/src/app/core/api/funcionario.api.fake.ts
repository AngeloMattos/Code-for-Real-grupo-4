import { Injectable } from '@angular/core';
import { delay, Observable, of } from 'rxjs';

import { FuncionarioResumo } from '../models/funcionario';
import { FuncionarioApi } from './funcionario.api';
import { FUNCIONARIOS_DEMO } from './ponto.api.fake';

@Injectable()
export class FuncionarioApiFake implements FuncionarioApi {
  listar(): Observable<FuncionarioResumo[]> {
    const lista = [...FUNCIONARIOS_DEMO].sort((a, b) => a.nome.localeCompare(b.nome));
    return of(lista).pipe(delay(300));
  }
}
