// Menu e rotas por papel (docs/Desgin.md §3 e §6). Fonte única: a sidebar e o app.routes leem daqui.
import { NomeIcone } from '../shared/components/icone/icone';
import { Papel } from './models/usuario';

export interface ItemMenu {
  /** Caminho sem a barra inicial. */
  caminho: string;
  rotulo: string;
  descricao: string;
  icone: NomeIcone;
  papeis: Papel[];
}

const TODOS: Papel[] = ['FUNCIONARIO', 'RH', 'FINANCEIRO', 'CONTABILIDADE', 'ADMIN'];

export const MENU: ItemMenu[] = [
  {
    caminho: 'inicio',
    rotulo: 'Início',
    descricao: 'Dashboard do seu setor.',
    icone: 'painel',
    papeis: TODOS,
  },
  {
    caminho: 'pendencias',
    rotulo: 'Pendências',
    descricao: 'O que falta, com quem está e até quando.',
    icone: 'pendencias',
    papeis: TODOS,
  },
  {
    caminho: 'solicitacoes/nova',
    rotulo: 'Enviar documento',
    descricao: 'Envie um atestado, pedido de férias ou alteração cadastral ao RH.',
    icone: 'enviar-arquivo',
    papeis: ['FUNCIONARIO'],
  },
  {
    caminho: 'ponto',
    rotulo: 'Ponto',
    descricao: 'Entradas, saídas e marcações faltando.',
    icone: 'relogio',
    papeis: ['FUNCIONARIO', 'RH'],
  },
  {
    caminho: 'holerites',
    rotulo: 'Holerites',
    descricao: 'Seus holerites publicados pelo Financeiro.',
    icone: 'holerite',
    papeis: ['FUNCIONARIO'],
  },
  {
    caminho: 'funcionarios',
    rotulo: 'Funcionários',
    descricao: 'Cadastro dos funcionários, com filtro por setor.',
    icone: 'pessoas',
    papeis: ['RH', 'ADMIN'],
  },
  {
    caminho: 'documentos',
    rotulo: 'Documentos',
    descricao: 'Validação de atestados e documentos enviados.',
    icone: 'arquivo-ok',
    papeis: ['RH'],
  },
  {
    caminho: 'folha',
    rotulo: 'Folha de pagamento',
    descricao: 'Prévia, bloqueios e fechamento da folha do mês.',
    icone: 'calculadora',
    papeis: ['RH', 'FINANCEIRO', 'CONTABILIDADE', 'ADMIN'],
  },
  {
    caminho: 'empresas',
    rotulo: 'Empresas',
    descricao: 'Carteira de empresas atendidas e o status de cada folha.',
    icone: 'empresas',
    papeis: ['CONTABILIDADE'],
  },
  {
    caminho: 'admin/usuarios',
    rotulo: 'Usuários e setores',
    descricao: 'Quem acessa o sistema e em qual setor.',
    icone: 'usuario-config',
    papeis: ['ADMIN'],
  },
];

export function menuDoPapel(papel: Papel | null): ItemMenu[] {
  return papel ? MENU.filter((item) => item.papeis.includes(papel)) : [];
}
