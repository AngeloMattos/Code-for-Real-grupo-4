// O que cada setor pode fazer numa pendência. Espelha TransicaoStatus (docs/BACKEND.md §9);
// o back continua sendo quem valida (409 se a transição não for permitida).
import { Pendencia, TipoPendencia } from './models/pendencia';
import { NOME_SETOR, Papel } from './models/usuario';

export interface AcaoPendencia {
  rotulo: string;
  explicacao: string;
  tom: 'primaria' | 'secundaria' | 'perigo';
}

/** O que conferir antes de decidir, por tipo de pendência. */
export const ORIENTACAO_TIPO: Record<TipoPendencia, string> = {
  ATESTADO:
    'Confira datas, CID, assinatura e CRM do médico. Aprovado, o atestado abona as faltas do período no ponto.',
  FERIAS:
    'Confira o período aquisitivo, o aviso de 30 dias e a cobertura da equipe. As férias entram na folha do mês em que começam.',
  ALTERACAO_CADASTRAL:
    'Confira se o comprovante está legível e bate com os dados informados antes de atualizar o cadastro.',
  DUVIDA: 'Responda no histórico. Uma dúvida simples pode ser concluída direto pelo RH.',
  AJUSTE_PONTO:
    'Confira a marcação com o gestor. O ajuste manual exige justificativa e fica registrado no histórico.',
  DOCUMENTO_SOLICITADO:
    'Confira se o documento recebido é o pedido e está completo. Sem ele, a pendência pode bloquear a folha.',
  CORRECAO_FOLHA:
    'Confira o cálculo e a origem da divergência. Defina se a diferença entra nesta folha ou na próxima.',
};

const FINALIZADAS = ['CONCLUIDA', 'CANCELADA'];

export interface SituacaoAcoes {
  acoes: AcaoPendencia[];
  /** Por que não há (ou há poucas) ações para quem está vendo. */
  aviso: string | null;
}

export function acoesDaPendencia(p: Pendencia, papel: Papel): SituacaoAcoes {
  if (FINALIZADAS.includes(p.status)) {
    const encerrada = p.status === 'CONCLUIDA' ? 'concluída' : 'cancelada';
    return {
      acoes: [],
      aviso:
        papel === 'FUNCIONARIO'
          ? `Solicitação ${encerrada}. A resposta fica no histórico acima; se precisar de algo mais, abra uma nova solicitação.`
          : `Pendência ${encerrada}. Fica só para consulta no histórico.`,
    };
  }

  if (papel === 'FUNCIONARIO') return acoesDoFuncionario(p);

  if (papel === 'ADMIN') {
    return { acoes: [], aviso: 'O Admin acompanha as pendências só para leitura.' };
  }

  const acoes: AcaoPendencia[] = [];
  const comigo = p.setorResponsavel === papel;

  if (comigo) {
    acoes.push(...acoesDoResponsavel(p, papel));
  }

  if (papel === 'RH') {
    acoes.push({
      rotulo: 'Alterar prazo ou responsável',
      explicacao: 'Muda a data limite ou quem cuida da pendência. Fica registrado no histórico.',
      tom: 'secundaria',
    });
    acoes.push({
      rotulo: 'Cancelar pendência',
      explicacao: 'Encerra sem concluir, com comentário obrigatório explicando o motivo.',
      tom: 'perigo',
    });
  }

  acoes.push({
    rotulo: 'Comentar',
    explicacao: 'Deixa um recado no histórico para os outros setores e o funcionário.',
    tom: 'secundaria',
  });

  let aviso: string | null = null;
  if (!comigo) {
    aviso =
      p.setorResponsavel === 'FUNCIONARIO'
        ? `Aguardando ${p.funcionarioNome}. A pendência volta para o setor que pediu quando o funcionário responder.`
        : `Está com ${NOME_SETOR[p.setorResponsavel]}. Você pode acompanhar e comentar.`;
  }

  return { acoes, aviso };
}

function acoesDoFuncionario(p: Pendencia): SituacaoAcoes {
  const acoes: AcaoPendencia[] = [];
  if (p.setorResponsavel === 'FUNCIONARIO') {
    acoes.push({
      rotulo: 'Reenviar documento',
      explicacao: 'Envia o arquivo corrigido. A solicitação volta para o setor que pediu a correção.',
      tom: 'primaria',
    });
  }
  acoes.push({
    rotulo: 'Comentar',
    explicacao: 'Manda uma mensagem no histórico para quem está cuidando da sua solicitação.',
    tom: 'secundaria',
  });

  return {
    acoes,
    aviso:
      p.setorResponsavel === 'FUNCIONARIO'
        ? 'Precisa de correção sua. Veja no histórico o que foi pedido.'
        : `Está com ${NOME_SETOR[p.setorResponsavel]}. Você recebe uma notificação quando houver resposta.`,
  };
}

function acoesDoResponsavel(p: Pendencia, papel: Papel): AcaoPendencia[] {
  if (p.status === 'ABERTA') {
    return [
      {
        rotulo: 'Iniciar análise',
        explicacao: `Marca a pendência como "Em análise" com ${NOME_SETOR[papel]}, para os outros setores saberem que alguém está cuidando.`,
        tom: 'primaria',
      },
    ];
  }

  if (p.status !== 'EM_ANALISE') return [];

  const concluir: AcaoPendencia = {
    rotulo: 'Concluir',
    explicacao: 'Encerra a pendência como resolvida. Se ela bloqueava a folha, o bloqueio sai.',
    tom: 'primaria',
  };

  switch (papel) {
    case 'RH':
      return [
        {
          rotulo: 'Aprovar e encaminhar',
          explicacao:
            'Aprova e envia à Contabilidade ou ao Financeiro para lançar na folha. O setor escolhido é notificado.',
          tom: 'primaria',
        },
        {
          rotulo: 'Solicitar correção',
          explicacao: `Devolve para ${p.funcionarioNome} corrigir ou reenviar o documento, com comentário obrigatório.`,
          tom: 'secundaria',
        },
        concluir,
      ];
    case 'CONTABILIDADE':
      return [
        concluir,
        {
          rotulo: 'Pedir documento',
          explicacao: 'Devolve ao RH pedindo um documento ou correção, com comentário obrigatório.',
          tom: 'secundaria',
        },
      ];
    case 'FINANCEIRO':
      return [
        concluir,
        {
          rotulo: 'Solicitar correção',
          explicacao: `Devolve para ${p.funcionarioNome} com o que precisa ser corrigido, com comentário obrigatório.`,
          tom: 'secundaria',
        },
      ];
    default:
      return [];
  }
}
