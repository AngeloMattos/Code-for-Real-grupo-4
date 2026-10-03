import { Injectable } from '@angular/core';
import { delay, Observable, of } from 'rxjs';

import { LoginRequest, LoginResponse, Papel, TipoLogin, Usuario } from '../models/usuario';
import { AuthApi } from './auth.api';

export interface UsuarioDemo {
  papel: Papel;
  rotulo: string;
  tipo: TipoLogin;
  login: string;
  senha: string;
  usuario: Usuario;
}

const EMPRESA_DEMO = { id: 1, nomeFantasia: 'Metalúrgica Horizonte' };
const SENHA_DEMO = 'demo1234';

// Mesmos logins do seed V2__dados_demo.sql (docs/BACKEND.md §10).
export const USUARIOS_DEMO: UsuarioDemo[] = [
  {
    papel: 'FUNCIONARIO',
    rotulo: 'Funcionário',
    tipo: 'FUNCIONARIO',
    login: '123.456.789-00',
    senha: SENHA_DEMO,
    usuario: { nome: 'João Pereira', papeis: ['FUNCIONARIO'], empresa: EMPRESA_DEMO },
  },
  {
    papel: 'RH',
    rotulo: 'RH',
    tipo: 'EMPRESA',
    login: 'rh@demo.com',
    senha: SENHA_DEMO,
    usuario: { nome: 'Ana Souza', papeis: ['RH'], empresa: EMPRESA_DEMO },
  },
  {
    papel: 'FINANCEIRO',
    rotulo: 'Financeiro',
    tipo: 'EMPRESA',
    login: 'financeiro@demo.com',
    senha: SENHA_DEMO,
    usuario: { nome: 'Carlos Lima', papeis: ['FINANCEIRO'], empresa: EMPRESA_DEMO },
  },
  {
    papel: 'CONTABILIDADE',
    rotulo: 'Contabilidade',
    tipo: 'EMPRESA',
    login: 'contabil@demo.com',
    senha: SENHA_DEMO,
    usuario: { nome: 'Beatriz Rocha', papeis: ['CONTABILIDADE'], empresa: EMPRESA_DEMO },
  },
  {
    papel: 'ADMIN',
    rotulo: 'Admin',
    tipo: 'EMPRESA',
    login: 'admin@demo.com',
    senha: SENHA_DEMO,
    usuario: { nome: 'Marcos Admin', papeis: ['ADMIN'], empresa: EMPRESA_DEMO },
  },
];

const QUINZE_MINUTOS = 15 * 60 * 1000;

/** No e-mail da aba "Sou empresa", a primeira palavra-chave encontrada define o setor; sem nenhuma, entra como RH. */
const SETOR_POR_EMAIL: [string, Papel][] = [
  ['financeiro', 'FINANCEIRO'],
  ['contab', 'CONTABILIDADE'],
  ['admin', 'ADMIN'],
  ['rh', 'RH'],
];

/**
 * Login de demonstração: aceita qualquer CPF/e-mail e senha.
 * "Sou funcionário" entra como Funcionário; "Sou empresa" entra no setor indicado pelo e-mail.
 */
@Injectable()
export class AuthApiFake implements AuthApi {
  login(req: LoginRequest): Observable<LoginResponse> {
    const encontrado = demoPara(req);

    return of({
      accessToken: `demo.${encontrado.papel.toLowerCase()}.${Date.now()}`,
      expiraEm: new Date(Date.now() + QUINZE_MINUTOS).toISOString(),
      usuario: encontrado.usuario,
    }).pipe(delay(600));
  }
}

function demoPara(req: LoginRequest): UsuarioDemo {
  const email = req.login.trim().toLowerCase();
  const papel: Papel =
    req.tipo === 'FUNCIONARIO'
      ? 'FUNCIONARIO'
      : (SETOR_POR_EMAIL.find(([chave]) => email.includes(chave))?.[1] ?? 'RH');
  return USUARIOS_DEMO.find((u) => u.papel === papel)!;
}
