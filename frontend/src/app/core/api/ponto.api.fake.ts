import { Injectable } from '@angular/core';
import { delay, Observable, of, throwError } from 'rxjs';

import { RegistroPonto, SituacaoPonto } from '../models/ponto';
import { PontoApi } from './ponto.api';

/** Funcionários da empresa demo; a folha fictícia usa os mesmos. */
export const FUNCIONARIOS_DEMO = [
  { id: 1, nome: 'João Pereira', departamento: 'Produção' },
  { id: 5, nome: 'Rafael Souza', departamento: 'Produção' },
  { id: 8, nome: 'Lucas Almeida', departamento: 'Produção' },
  { id: 3, nome: 'Pedro Santos', departamento: 'Logística' },
  { id: 6, nome: 'Juliana Ribeiro', departamento: 'Logística' },
  { id: 10, nome: 'Patrícia Gomes', departamento: 'Logística' },
  { id: 2, nome: 'Maria Oliveira', departamento: 'Administrativo' },
  { id: 7, nome: 'Camila Dias', departamento: 'Administrativo' },
  { id: 4, nome: 'Fernanda Costa', departamento: 'Comercial' },
  { id: 9, nome: 'Bruno Martins', departamento: 'Comercial' },
];

const JORNADA = 8 * 60;
const ALMOCO = 60;

/** João Pereira: o funcionário que entra pela aba "Sou funcionário". */
const MEU_FUNCIONARIO = FUNCIONARIOS_DEMO[0];

/** Marcações de hoje do funcionário da demo; começa como no dashboard (entrada às 08:02). */
let meuHoje: { entrada: string | null; saida: string | null } = { entrada: '08:02', saida: null };

/**
 * Gera entradas e saídas em todo dia útil da competência até hoje.
 * Usa sorteio com semente fixa: os mesmos dados a cada recarga, bom para ensaiar a demo.
 */
@Injectable()
export class PontoApiFake implements PontoApi {
  equipe(competencia: string): Observable<RegistroPonto[]> {
    return of(registrosPontoDemo(competencia)).pipe(delay(500));
  }

  meu(competencia: string): Observable<RegistroPonto[]> {
    const hoje = dataIso(new Date());
    const registros = registrosPontoDemo(competencia).filter(
      (r) => r.funcionarioId === MEU_FUNCIONARIO.id && r.data !== hoje,
    );
    const deHoje = meuRegistroDeHoje();
    if (deHoje && hoje.startsWith(competencia)) registros.push(deHoje);
    return of(registros).pipe(delay(400));
  }

  hoje(): Observable<RegistroPonto | null> {
    return of(meuRegistroDeHoje()).pipe(delay(300));
  }

  registrar(): Observable<RegistroPonto> {
    const agora = new Date();
    const marcacao = hora(agora.getHours() * 60 + agora.getMinutes());
    if (!meuHoje.entrada) meuHoje = { entrada: marcacao, saida: null };
    else if (!meuHoje.saida) meuHoje = { ...meuHoje, saida: marcacao };
    else return throwError(() => new Error('Entrada e saída de hoje já foram registradas.'));
    return of(meuRegistroDeHoje()!).pipe(delay(400));
  }
}

function meuRegistroDeHoje(): RegistroPonto | null {
  const { entrada, saida } = meuHoje;
  if (!entrada) return null;
  const total = saida ? Math.max(0, minutos(saida) - minutos(entrada) - ALMOCO) : null;
  return {
    id: 0,
    funcionarioId: MEU_FUNCIONARIO.id,
    funcionarioNome: MEU_FUNCIONARIO.nome,
    departamento: MEU_FUNCIONARIO.departamento,
    data: dataIso(new Date()),
    entrada,
    saida,
    totalMinutos: total,
    extrasMinutos: total === null ? 0 : Math.max(0, total - JORNADA),
    situacao: saida ? 'OK' : 'EM_ANDAMENTO',
    ajustado: false,
  };
}

/** Também usado pela folha fictícia para tirar horas extras e faltas do mesmo ponto. */
export function registrosPontoDemo(competencia: string): RegistroPonto[] {
  const [ano, mes] = competencia.split('-').map(Number);
  const hoje = new Date();
  hoje.setHours(0, 0, 0, 0);

  const registros: RegistroPonto[] = [];
  const ultimoDia = new Date(ano, mes, 0).getDate();

  for (let dia = 1; dia <= ultimoDia; dia++) {
    const data = new Date(ano, mes - 1, dia);
    const diaDaSemana = data.getDay();
    if (data > hoje || diaDaSemana === 0 || diaDaSemana === 6) continue;

    for (const f of FUNCIONARIOS_DEMO) {
      const sorteio = aleatorio(ano * 10_000 + mes * 100 + dia + f.id * 7_919);
      registros.push(gerar(registros.length + 1, f, data, data.getTime() === hoje.getTime(), sorteio));
    }
  }

  return registros;
}

function gerar(
  id: number,
  f: (typeof FUNCIONARIOS_DEMO)[number],
  data: Date,
  ehHoje: boolean,
  sorteio: () => number,
): RegistroPonto {
  const r = sorteio();
  let entrada: number | null = 7 * 60 + 45 + Math.floor(sorteio() * 35); // 07:45–08:20
  let saida: number | null =
    sorteio() < 0.25
      ? 18 * 60 + Math.floor(sorteio() * 90) // fez hora extra: 18:00–19:30
      : 16 * 60 + 55 + Math.floor(sorteio() * 25); // 16:55–17:20

  let situacao: SituacaoPonto = 'OK';
  if (ehHoje) {
    saida = null;
    situacao = 'EM_ANDAMENTO';
  } else if (r < 0.03) {
    entrada = null;
    saida = null;
    situacao = 'SEM_MARCACAO';
  } else if (r < 0.08) {
    saida = null;
    situacao = 'MARCACAO_FALTANDO';
  } else if (r < 0.1) {
    entrada = null;
    situacao = 'MARCACAO_FALTANDO';
  }

  const total = entrada !== null && saida !== null ? saida - entrada - ALMOCO : null;
  return {
    id,
    funcionarioId: f.id,
    funcionarioNome: f.nome,
    departamento: f.departamento,
    data: dataIso(data),
    entrada: entrada === null ? null : hora(entrada),
    saida: saida === null ? null : hora(saida),
    totalMinutos: total,
    extrasMinutos: total === null ? 0 : Math.max(0, total - JORNADA),
    situacao,
    ajustado: false,
  };
}

/** Mulberry32: gerador pseudoaleatório pequeno e determinístico. */
function aleatorio(semente: number): () => number {
  let a = semente >>> 0;
  return () => {
    a = (a + 0x6d2b79f5) >>> 0;
    let t = a;
    t = Math.imul(t ^ (t >>> 15), t | 1);
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
    return ((t ^ (t >>> 14)) >>> 0) / 4_294_967_296;
  };
}

function hora(minutos: number): string {
  return `${String(Math.floor(minutos / 60)).padStart(2, '0')}:${String(minutos % 60).padStart(2, '0')}`;
}

/** "08:02" → 482. */
function minutos(hhmm: string): number {
  const [h, m] = hhmm.split(':').map(Number);
  return h * 60 + m;
}

function dataIso(d: Date): string {
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
}
