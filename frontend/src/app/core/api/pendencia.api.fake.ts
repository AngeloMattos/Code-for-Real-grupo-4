import { inject, Injectable } from '@angular/core';
import { delay, Observable, of } from 'rxjs';

import { AuthService } from '../auth/auth.service';
import { CriarPendenciaRequest, Pendencia, PendenciaEvento } from '../models/pendencia';
import { PendenciaDemo, pendenciasDemo } from './dashboard.api.fake';
import { PendenciaApi } from './pendencia.api';
import { guardarPendencia, pendenciasCriadas } from './pendencias-criadas.fake';
import { FUNCIONARIOS_DEMO } from './ponto.api.fake';

@Injectable()
export class PendenciaApiFake implements PendenciaApi {
  private readonly auth = inject(AuthService);

  eventos(id: number): Observable<PendenciaEvento[]> {
    const p = pendenciasDemo().find((x) => x.id === id);
    if (!p) return of<PendenciaEvento[]>([]).pipe(delay(300));

    // Sem conversa de demo: só o evento de criação.
    const eventos = p.conversa ?? [
      {
        id: 1,
        tipo: 'CRIACAO',
        autorNome: p.funcionarioNome,
        autorSetor: 'FUNCIONARIO',
        comentario: null,
        statusAnterior: null,
        statusNovo: 'ABERTA',
        quando: p.criadoEm,
      },
    ];
    return of(eventos).pipe(delay(300));
  }

  criar(req: CriarPendenciaRequest): Observable<Pendencia> {
    const agora = new Date().toISOString();
    const usuario = this.auth.usuario();
    const funcionario = FUNCIONARIOS_DEMO.find((f) => f.id === req.funcionarioId);

    const nova: PendenciaDemo = {
      // Longe dos ids do seed para não colidir.
      id: 1000 + pendenciasCriadas().length + 1,
      titulo: req.titulo,
      descricao: req.descricao,
      tipo: req.tipo,
      status: 'ABERTA',
      setorResponsavel: req.setorResponsavel,
      responsavelNome: null,
      funcionarioId: req.funcionarioId,
      funcionarioNome: funcionario?.nome ?? 'Funcionário',
      prazo: req.prazo,
      atrasada: false,
      criadoEm: agora,
      ultimaAtualizacao: agora,
      bloqueiaFolha: req.bloqueiaFolha,
      // No back, o PendenciaService grava o evento CRIADA na mesma transação.
      conversa: [
        {
          id: 1,
          tipo: 'CRIACAO',
          autorNome: usuario?.nome ?? 'Usuário',
          autorSetor: this.auth.papel() ?? 'RH',
          comentario: req.descricao,
          statusAnterior: null,
          statusNovo: 'ABERTA',
          quando: agora,
        },
      ],
    };
    guardarPendencia(nova);

    const { bloqueiaFolha: _, conversa: __, ...resposta } = nova;
    return of<Pendencia>(resposta).pipe(delay(700));
  }
}
