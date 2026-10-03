import { Injectable } from '@angular/core';
import { delay, Observable, of } from 'rxjs';

import { Holerite } from '../models/holerite';
import { calcularItens } from './folha.api.fake';
import { estadoFolhaDemo } from './folha.estado.fake';
import { HoleriteApi } from './holerite.api';

/** João Pereira: o funcionário que entra pela aba "Sou funcionário". */
const MEU_FUNCIONARIO_ID = 1;
const EMPRESA = 'Metalúrgica Horizonte';

/** Últimos 12 meses com folha fechada e holerites publicados, a partir da mesma folha fictícia. */
@Injectable()
export class HoleriteApiFake implements HoleriteApi {
  meus(): Observable<Holerite[]> {
    const hoje = new Date();
    const competencias = Array.from({ length: 12 }, (_, i) => {
      const d = new Date(hoje.getFullYear(), hoje.getMonth() - i, 1);
      return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}`;
    });

    const holerites = competencias
      .filter((c) => estadoFolhaDemo(c).holeritesPublicados)
      .map((competencia): Holerite | null => {
        const item = calcularItens(competencia).find((i) => i.funcionarioId === MEU_FUNCIONARIO_ID);
        if (!item) return null;
        const linhas = item.memoria.filter((l) => l.valor > 0);
        const soma = (natureza: 'PROVENTO' | 'DESCONTO') =>
          centavos(linhas.filter((l) => l.natureza === natureza).reduce((t, l) => t + l.valor, 0));
        const [ano, mes] = competencia.split('-').map(Number);
        return {
          competencia,
          publicadoEm: new Date(ano, mes, 5, 9).toISOString(),
          funcionarioNome: item.funcionarioNome,
          cargo: item.cargo,
          departamento: item.departamento,
          empresaNome: EMPRESA,
          linhas,
          totalProventos: soma('PROVENTO'),
          totalDescontos: soma('DESCONTO'),
          liquido: item.liquido,
        };
      })
      .filter((h): h is Holerite => h !== null);

    return of(holerites).pipe(delay(500));
  }
}

function centavos(valor: number): number {
  return Math.round(valor * 100) / 100;
}
