import { Injectable } from '@angular/core';
import { delay, Observable, of } from 'rxjs';

import { Atividade, DashboardFuncionario, DashboardSetor, Kpis } from '../models/dashboard';
import { Pendencia, PendenciaEvento, StatusPendencia, TipoPendencia } from '../models/pendencia';
import { Papel } from '../models/usuario';
import { DashboardApi } from './dashboard.api';
import { bloqueiosDaCompetencia, ETAPA_DO_STATUS, statusFolhaDemo } from './folha.estado.fake';
import { pendenciasCriadas } from './pendencias-criadas.fake';

/** No back isto é a coluna bloqueiaFolha; o DTO não expõe, então fica só no fake. */
export type PendenciaDemo = Pendencia & {
  bloqueiaFolha: boolean;
  /** Histórico de demo servido pelo PendenciaApiFake. */
  conversa?: PendenciaEvento[];
};

const JOAO = { id: 1, nome: 'João Pereira' };
const MARIA = { id: 2, nome: 'Maria Oliveira' };
const PEDRO = { id: 3, nome: 'Pedro Santos' };
const FERNANDA = { id: 4, nome: 'Fernanda Costa' };
const RAFAEL = { id: 5, nome: 'Rafael Souza' };
const JULIANA = { id: 6, nome: 'Juliana Ribeiro' };
const CAMILA = { id: 7, nome: 'Camila Dias' };

const FINALIZADAS: StatusPendencia[] = ['CONCLUIDA', 'CANCELADA'];
const VALIDACAO_RH: TipoPendencia[] = ['ATESTADO', 'FERIAS', 'ALTERACAO_CADASTRAL'];

@Injectable()
export class DashboardApiFake implements DashboardApi {
  setor(papel: Papel, competencia: string): Observable<DashboardSetor> {
    const todas = pendenciasDemo();
    const abertas = todas.filter((p) => !FINALIZADAS.includes(p.status));
    const doSetor = abertas.filter((p) => visivelPara(papel, p));

    return of<DashboardSetor>({
      kpis: calcularKpis(doSetor),
      precisaDaSuaAcao: abertas
        .filter((p) => p.setorResponsavel === papel)
        .sort(porUrgencia)
        .slice(0, 5),
      fechamento: {
        competencia,
        etapaAtual: ETAPA_DO_STATUS[statusFolhaDemo(competencia)],
        bloqueios: bloqueiosDaCompetencia(competencia, abertas).length,
        prazoFechamento: diaDoMesSeguinte(competencia, 5),
      },
      atividades: atividadesDemo(),
    }).pipe(delay(500));
  }

  funcionario(competencia: string): Observable<DashboardFuncionario> {
    const [ano, mes] = competencia.split('-').map(Number);
    const anterior = new Date(ano, mes - 2, 1);

    const minhas = pendenciasDemo().filter((p) => p.funcionarioId === JOAO.id);

    return of<DashboardFuncionario>({
      solicitacoes: minhas.filter((p) => !FINALIZADAS.includes(p.status)).sort(porUrgencia),
      respondidas: minhas
        .filter((p) => p.status === 'CONCLUIDA')
        .sort((a, b) => b.ultimaAtualizacao.localeCompare(a.ultimaAtualizacao))
        .slice(0, 5),
      pontoHoje: { entrada: '08:02', saida: null },
      ultimoHolerite: {
        competencia: `${anterior.getFullYear()}-${String(anterior.getMonth() + 1).padStart(2, '0')}`,
        liquido: 3187.42,
      },
    }).pipe(delay(500));
  }
}

function visivelPara(papel: Papel, p: PendenciaDemo): boolean {
  switch (papel) {
    case 'RH':
    case 'ADMIN':
      return true;
    case 'FINANCEIRO':
    case 'CONTABILIDADE':
      // Ligadas à folha ou já com o próprio setor.
      return p.bloqueiaFolha || p.setorResponsavel === papel;
    default:
      return false;
  }
}

function calcularKpis(pendencias: PendenciaDemo[]): Kpis {
  return {
    abertas: pendencias.length,
    vencemEm3Dias: pendencias.filter((p) => {
      const dias = diasAte(p.prazo);
      return dias !== null && dias >= 0 && dias <= 3;
    }).length,
    atrasadas: pendencias.filter((p) => p.atrasada).length,
    aguardandoValidacao: pendencias.filter(
      (p) => p.setorResponsavel === 'RH' && VALIDACAO_RH.includes(p.tipo),
    ).length,
  };
}

/** Atrasadas primeiro, depois por prazo (ordenação padrão da Central). */
function porUrgencia(a: Pendencia, b: Pendencia): number {
  if (a.atrasada !== b.atrasada) return a.atrasada ? -1 : 1;
  return (a.prazo ?? '9999').localeCompare(b.prazo ?? '9999');
}

/** Pendências da empresa demo; a folha fictícia usa as mesmas para os bloqueios. */
export function pendenciasDemo(): PendenciaDemo[] {
  let id = 0;
  const criar = (
    titulo: string,
    descricao: string,
    tipo: TipoPendencia,
    status: StatusPendencia,
    setorResponsavel: Papel,
    funcionario: { id: number; nome: string },
    prazoEmDias: number,
    atualizadaHaHoras: number,
    bloqueiaFolha = true,
  ): PendenciaDemo => {
    const prazo = dataRelativa(prazoEmDias);
    return {
      id: ++id,
      titulo,
      descricao,
      tipo,
      status,
      setorResponsavel,
      responsavelNome: null,
      funcionarioId: funcionario.id,
      funcionarioNome: funcionario.nome,
      prazo,
      atrasada: !FINALIZADAS.includes(status) && prazoEmDias < 0,
      criadoEm: horasAtras(atualizadaHaHoras + 48),
      ultimaAtualizacao: horasAtras(atualizadaHaHoras),
      bloqueiaFolha,
    };
  };

  return [
    criar(
      'Atestado médico de 2 dias',
      'Atestado de 08/10 e 09/10 enviado pela funcionária, com CID e CRM do médico. As duas faltas no ponto aguardam abono.',
      'ATESTADO', 'EM_ANALISE', 'RH', MARIA, 1, 0.2,
    ),
    criar(
      'Marcação de saída faltando',
      'Sem registro de saída em 30/09. Sem o ajuste, o dia entra como jornada incompleta no cálculo da folha.',
      'AJUSTE_PONTO', 'ABERTA', 'RH', JULIANA, -1, 5,
    ),
    criar(
      'Férias de 15 dias em novembro',
      'Pedido de férias de 03/11 a 17/11. O período aquisitivo está completo; falta confirmar a cobertura com o gestor.',
      'FERIAS', 'ABERTA', 'RH', PEDRO, 3, 20,
    ),
    criar(
      'Atualizar conta bancária',
      'O comprovante enviado está ilegível. Foi pedido um novo comprovante com agência e conta visíveis.',
      'ALTERACAO_CADASTRAL', 'CORRECAO_SOLICITADA', 'FUNCIONARIO', JOAO, 2, 26,
    ),
    criar(
      'Atestado odontológico',
      'Atestado de meio período (14/10) já aprovado pelo RH. Falta lançar o abono das horas na folha.',
      'ATESTADO', 'EM_ANALISE', 'CONTABILIDADE', PEDRO, 2, 1,
    ),
    criar(
      'Comprovante de dependente',
      'Certidão de nascimento do filho para dedução de IRRF e salário-família. Sem o documento, o desconto sai sem a dedução.',
      'DOCUMENTO_SOLICITADO', 'ABERTA', 'FUNCIONARIO', FERNANDA, -2, 3,
    ),
    criar(
      'Divergência no desconto do INSS',
      'O desconto de setembro saiu com a alíquota da faixa anterior. Recalcular e definir se a diferença entra nesta folha.',
      'CORRECAO_FOLHA', 'EM_ANALISE', 'FINANCEIRO', RAFAEL, 4, 6,
    ),
    criar(
      'Horas extras sem aprovação',
      '6 h extras registradas entre 22/09 e 26/09 sem aprovação do gestor. Precisam ser aprovadas para entrar no pagamento.',
      'AJUSTE_PONTO', 'ABERTA', 'FINANCEIRO', JULIANA, 1, 8,
    ),
    criar(
      'Dúvida sobre desconto do VT',
      'O funcionário pergunta por que o desconto do vale-transporte foi maior que 6% do salário neste mês.',
      'DUVIDA', 'ABERTA', 'RH', JOAO, 5, 30, false,
    ),
    criar(
      'Contrato de admissão assinado',
      'Contrato assinado pela funcionária e pelo RH. Falta conferir os dados e registrar a admissão no eSocial.',
      'DOCUMENTO_SOLICITADO', 'EM_ANALISE', 'CONTABILIDADE', CAMILA, -1, 10,
    ),
    criar(
      'Atestado médico de 1 dia',
      'Atestado de 01/10, aprovado e lançado na folha.',
      'ATESTADO', 'CONCLUIDA', 'CONTABILIDADE', RAFAEL, -3, 50,
    ),
    {
      ...criar(
        'Horas extras de setembro pela metade',
        'O holerite de setembro pagou 4 h extras, mas o funcionário fez 8 h na semana do inventário (15/09 a 19/09).',
        'DUVIDA', 'CONCLUIDA', 'RH', JOAO, -1, 22, false,
      ),
      conversa: conversaHorasExtras(),
    },
    ...pendenciasCriadas(),
  ];
}

/** Dúvida do João já respondida pelo RH (Ana Souza), para a demo do histórico em chat. */
function conversaHorasExtras(): PendenciaEvento[] {
  const evento = (
    id: number,
    tipo: PendenciaEvento['tipo'],
    autor: 'JOAO' | 'ANA',
    haHoras: number,
    comentario: string | null,
    status: [StatusPendencia | null, StatusPendencia] | null = null,
  ): PendenciaEvento => ({
    id,
    tipo,
    autorNome: autor === 'JOAO' ? JOAO.nome : 'Ana Souza',
    autorSetor: autor === 'JOAO' ? 'FUNCIONARIO' : 'RH',
    comentario,
    statusAnterior: status?.[0] ?? null,
    statusNovo: status?.[1] ?? null,
    quando: horasAtras(haHoras),
  });

  return [
    evento(1, 'CRIACAO', 'JOAO', 70,
      'Olá! No holerite de setembro vieram só 4 horas extras, mas eu fiz 8 h na semana do inventário (15/09 a 19/09). Podem verificar?',
      [null, 'ABERTA']),
    evento(2, 'MUDANCA_STATUS', 'ANA', 69, null, ['ABERTA', 'EM_ANALISE']),
    evento(3, 'COMENTARIO', 'ANA', 68.5,
      'Oi, João! Conferi no ponto: as 8 h estão registradas, mas só 4 h tinham aprovação do gestor quando a folha de setembro fechou.'),
    evento(4, 'COMENTARIO', 'JOAO', 68,
      'Ah, entendi. O Ricardo aprovou o restante depois. Vou perder essas 4 horas?'),
    evento(5, 'COMENTARIO', 'ANA', 46,
      'Não vai. Confirmei com o Ricardo e com o Financeiro: as 4 h que faltaram, com adicional de 50%, entram no holerite de outubro como diferença de setembro.'),
    evento(6, 'COMENTARIO', 'JOAO', 45, 'Perfeito, obrigado pela ajuda, Ana!'),
    evento(7, 'MUDANCA_STATUS', 'ANA', 22,
      'Dúvida respondida. Diferença de 4 h extras lançada na folha de outubro.',
      ['EM_ANALISE', 'CONCLUIDA']),
  ];
}

function atividadesDemo(): Atividade[] {
  return [
    { id: 1, autorNome: 'Maria Oliveira', autorSetor: 'FUNCIONARIO', descricao: 'enviou um atestado médico', quando: horasAtras(0.17) },
    { id: 2, autorNome: 'Ana Souza', autorSetor: 'RH', descricao: 'aprovou o atestado de Pedro Santos e enviou à Contabilidade', quando: horasAtras(1) },
    { id: 3, autorNome: 'Beatriz Rocha', autorSetor: 'CONTABILIDADE', descricao: 'pediu o comprovante de dependente de Fernanda Costa', quando: horasAtras(3) },
    { id: 4, autorNome: 'Carlos Lima', autorSetor: 'FINANCEIRO', descricao: 'apontou divergência no INSS de Rafael Souza', quando: horasAtras(6) },
    { id: 5, autorNome: 'Ana Souza', autorSetor: 'RH', descricao: 'pediu correção dos dados bancários a João Pereira', quando: horasAtras(26) },
  ];
}

function dataRelativa(dias: number): string {
  const d = new Date();
  d.setDate(d.getDate() + dias);
  return dataIso(d);
}

function diaDoMesSeguinte(competencia: string, dia: number): string {
  const [ano, mes] = competencia.split('-').map(Number);
  return dataIso(new Date(ano, mes, dia));
}

function dataIso(d: Date): string {
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
}

function horasAtras(horas: number): string {
  return new Date(Date.now() - horas * 3_600_000).toISOString();
}

function diasAte(prazo: string | null): number | null {
  if (!prazo) return null;
  const [ano, mes, dia] = prazo.split('-').map(Number);
  const hoje = new Date();
  hoje.setHours(0, 0, 0, 0);
  return Math.round((new Date(ano, mes - 1, dia).getTime() - hoje.getTime()) / 86_400_000);
}
