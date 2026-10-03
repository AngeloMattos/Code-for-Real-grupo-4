import { HttpErrorResponse } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { delay, mergeMap, Observable, of, throwError, timer } from 'rxjs';

import { Folha, ItemFolha, LinhaMemoria, StatusFolha } from '../models/folha';
import { NOME_STATUS, NOME_TIPO, Pendencia } from '../models/pendencia';
import { pendenciasDemo } from './dashboard.api.fake';
import { FolhaApi } from './folha.api';
import { atualizarFolhaDemo, bloqueiosDaCompetencia, estadoFolhaDemo } from './folha.estado.fake';
import { FUNCIONARIOS_DEMO, registrosPontoDemo } from './ponto.api.fake';

const CADASTRO: Record<number, { cargo: string; salario: number }> = {
  1: { cargo: 'Operador de produção', salario: 2850 },
  5: { cargo: 'Soldador', salario: 3200 },
  8: { cargo: 'Auxiliar de produção', salario: 2600 },
  3: { cargo: 'Conferente', salario: 3100 },
  6: { cargo: 'Auxiliar de logística', salario: 2700 },
  10: { cargo: 'Supervisora de logística', salario: 4200 },
  2: { cargo: 'Analista administrativa', salario: 3900 },
  7: { cargo: 'Coordenadora administrativa', salario: 5800 },
  4: { cargo: 'Vendedora', salario: 4500 },
  9: { cargo: 'Gerente comercial', salario: 7200 },
};

/**
 * Tabelas de EXEMPLO só para a demo. No sistema de verdade elas ficam no back
 * (TabelasFiscais, lidas do application.yml com os valores oficiais do ano).
 */
const INSS = [
  { ate: 1518.0, aliquota: 0.075 },
  { ate: 2793.88, aliquota: 0.09 },
  { ate: 4190.83, aliquota: 0.12 },
  { ate: 8157.41, aliquota: 0.14 },
];

const IRRF = [
  { ate: 2428.8, aliquota: 0, deducao: 0 },
  { ate: 2826.65, aliquota: 0.075, deducao: 182.16 },
  { ate: 3751.05, aliquota: 0.15, deducao: 394.16 },
  { ate: 4664.68, aliquota: 0.225, deducao: 675.49 },
  { ate: Infinity, aliquota: 0.275, deducao: 908.73 },
];

const CARGA_MENSAL = 220;
const REAIS = new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' });

/** Simula os endpoints de /folhas, com as mesmas regras de bloqueio e transição do back. */
@Injectable()
export class FolhaApiFake implements FolhaApi {
  folha(competencia: string): Observable<Folha> {
    return of(montarFolha(competencia)).pipe(delay(400));
  }

  itens(competencia: string): Observable<ItemFolha[]> {
    const status = estadoFolhaDemo(competencia).status;
    return of(status === 'ABERTA' ? [] : calcularItens(competencia)).pipe(delay(500));
  }

  calcular(competencia: string): Observable<Folha> {
    if (!['ABERTA', 'PREVIA_CALCULADA'].includes(estadoFolhaDemo(competencia).status)) {
      return erro409('A prévia só pode ser calculada antes de a folha ir para a contabilidade.');
    }
    atualizarFolhaDemo(competencia, { status: 'PREVIA_CALCULADA', calculadaEm: new Date().toISOString() });
    return of(montarFolha(competencia)).pipe(delay(900));
  }

  enviarParaContabilidade(competencia: string): Observable<Folha> {
    const folha = montarFolha(competencia);
    if (folha.status !== 'PREVIA_CALCULADA') {
      return erro409('Calcule a prévia antes de enviar para a contabilidade.');
    }
    if (folha.bloqueios.length) {
      return erro409(`A folha tem ${folha.bloqueios.length} pendências bloqueantes. Resolva antes de enviar.`);
    }
    return this.mudar(competencia, 'EM_CONFERENCIA');
  }

  fechar(competencia: string): Observable<Folha> {
    if (estadoFolhaDemo(competencia).status !== 'EM_CONFERENCIA') {
      return erro409('Só uma folha em conferência pode ser fechada.');
    }
    atualizarFolhaDemo(competencia, { fechadaEm: new Date().toISOString(), fechadaPorNome: 'Beatriz Rocha' });
    return this.mudar(competencia, 'FECHADA');
  }

  publicarHolerites(competencia: string): Observable<Folha> {
    if (estadoFolhaDemo(competencia).status !== 'FECHADA') {
      return erro409('Os holerites só podem ser publicados depois que a folha é fechada.');
    }
    atualizarFolhaDemo(competencia, { holeritesPublicados: true });
    return of(montarFolha(competencia)).pipe(delay(600));
  }

  private mudar(competencia: string, status: StatusFolha): Observable<Folha> {
    atualizarFolhaDemo(competencia, { status });
    return of(montarFolha(competencia)).pipe(delay(600));
  }
}

function montarFolha(competencia: string): Folha {
  const [ano, mes] = competencia.split('-').map(Number);
  const prazo = new Date(ano, mes, 5);
  return {
    competencia,
    ...estadoFolhaDemo(competencia),
    prazoFechamento: `${prazo.getFullYear()}-${String(prazo.getMonth() + 1).padStart(2, '0')}-05`,
    bloqueios: bloqueiosDaCompetencia(competencia, pendenciasDemo()).map(
      ({ bloqueiaFolha: _, ...p }) => p,
    ),
  };
}

/** Mesmo formato de erro do GlobalExceptionHandler (docs/BACKEND.md §6). */
function erro409(mensagem: string): Observable<never> {
  return timer(500).pipe(
    mergeMap(() =>
      throwError(
        () =>
          new HttpErrorResponse({
            status: 409,
            error: { status: 409, erro: 'REGRA_NEGOCIO', mensagem, campos: {} },
          }),
      ),
    ),
  );
}

// ---------- Cálculo simplificado do MVP (docs/Desgin.md §5) ----------

/** Também usado pelo fake dos holerites. */
export function calcularItens(competencia: string): ItemFolha[] {
  const ponto = registrosPontoDemo(competencia);
  const bloqueios = bloqueiosDaCompetencia(competencia, pendenciasDemo());

  return FUNCIONARIOS_DEMO.map((f) => {
    const { cargo, salario } = CADASTRO[f.id];
    const doFuncionario = ponto.filter((r) => r.funcionarioId === f.id);
    const minutosExtras = doFuncionario.reduce((soma, r) => soma + r.extrasMinutos, 0);
    const diasSemMarcacao = doFuncionario.filter((r) => r.situacao === 'SEM_MARCACAO').map((r) => r.data);

    const horasExtras = minutosExtras / 60;
    const valorHora = salario / CARGA_MENSAL;
    const valorHorasExtras = centavos(valorHora * 1.5 * horasExtras);
    const valorFaltas = centavos((salario / 30) * diasSemMarcacao.length);

    const bruto = salario + valorHorasExtras - valorFaltas;
    const inss = calcularInss(bruto);
    const baseIrrf = bruto - inss;
    const faixaIrrf = IRRF.find((f) => baseIrrf <= f.ate)!;
    const irrf = centavos(Math.max(0, baseIrrf * faixaIrrf.aliquota - faixaIrrf.deducao));
    const valeTransporte = centavos(salario * 0.06);
    const liquido = centavos(bruto - inss - irrf - valeTransporte);

    const bloqueio = bloqueios.find((p) => p.funcionarioId === f.id);

    const memoria: LinhaMemoria[] = [
      { rotulo: 'Salário base', natureza: 'PROVENTO', valor: salario, origem: `Cadastro do funcionário · ${cargo}` },
      {
        rotulo: 'Horas extras',
        natureza: 'PROVENTO',
        valor: valorHorasExtras,
        origem: minutosExtras
          ? `${formatarHoras(minutosExtras)} além de 8 h/dia no ponto · (${REAIS.format(salario)} ÷ ${CARGA_MENSAL}) × 1,5 × ${horasExtras.toFixed(2).replace('.', ',')} h`
          : 'Nenhuma hora extra no ponto do mês',
      },
      {
        rotulo: 'Faltas',
        natureza: 'DESCONTO',
        valor: valorFaltas,
        origem: diasSemMarcacao.length
          ? `${diasSemMarcacao.length} ${diasSemMarcacao.length === 1 ? 'dia' : 'dias'} sem marcação no ponto em ${diasSemMarcacao.map(diaMes).join(', ')} · (salário ÷ 30) × ${diasSemMarcacao.length}. Atestado aprovado pelo RH abona a falta.`
          : 'Nenhum dia sem marcação no ponto',
      },
      { rotulo: 'INSS', natureza: 'DESCONTO', valor: inss, origem: `Tabela progressiva sobre ${REAIS.format(bruto)} (salário + horas extras − faltas)` },
      {
        rotulo: 'IRRF',
        natureza: 'DESCONTO',
        valor: irrf,
        origem: faixaIrrf.aliquota
          ? `Base ${REAIS.format(baseIrrf)} (bruto − INSS) × ${(faixaIrrf.aliquota * 100).toFixed(1).replace('.', ',')}% − dedução de ${REAIS.format(faixaIrrf.deducao)}`
          : `Base ${REAIS.format(baseIrrf)} (bruto − INSS) dentro da faixa de isenção`,
      },
      { rotulo: 'Vale-transporte', natureza: 'DESCONTO', valor: valeTransporte, origem: '6% do salário base' },
    ];

    return {
      id: f.id,
      funcionarioId: f.id,
      funcionarioNome: f.nome,
      cargo,
      departamento: f.departamento,
      salarioBase: salario,
      horasExtras: centavos(horasExtras),
      valorHorasExtras,
      diasFalta: diasSemMarcacao.length,
      valorFaltas,
      inss,
      irrf,
      valeTransporte,
      liquido,
      bloqueio: bloqueio ? descreverBloqueio(bloqueio) : null,
      memoria,
    };
  }).sort((a, b) => a.funcionarioNome.localeCompare(b.funcionarioNome));
}

function calcularInss(base: number): number {
  let total = 0;
  let anterior = 0;
  for (const faixa of INSS) {
    if (base <= anterior) break;
    total += (Math.min(base, faixa.ate) - anterior) * faixa.aliquota;
    anterior = faixa.ate;
  }
  return centavos(total);
}

/** "Atestado em análise", "Ajuste de ponto aberta"... */
function descreverBloqueio(p: Pendencia): string {
  return `${NOME_TIPO[p.tipo]} · ${NOME_STATUS[p.status].toLowerCase()}`;
}

function centavos(valor: number): number {
  return Math.round(valor * 100) / 100;
}

function formatarHoras(minutos: number): string {
  return `${Math.floor(minutos / 60)}h${String(minutos % 60).padStart(2, '0')}`;
}

function diaMes(iso: string): string {
  const [, mes, dia] = iso.split('-');
  return `${dia}/${mes}`;
}
