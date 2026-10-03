import { HttpErrorResponse } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { delay, Observable, of, throwError, timer, mergeMap } from 'rxjs';

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

@Injectable()
export class AuthApiFake implements AuthApi {
  login(req: LoginRequest): Observable<LoginResponse> {
    const encontrado = USUARIOS_DEMO.find(
      (u) =>
        u.tipo === req.tipo &&
        normalizar(u.login) === normalizar(req.login) &&
        u.senha === req.senha,
    );

    if (!encontrado) {
      return timer(600).pipe(
        mergeMap(() => throwError(() => new HttpErrorResponse({ status: 401 }))),
      );
    }

    return of({
      accessToken: `demo.${encontrado.papel.toLowerCase()}.${Date.now()}`,
      expiraEm: new Date(Date.now() + QUINZE_MINUTOS).toISOString(),
      usuario: encontrado.usuario,
    }).pipe(delay(600));
  }
}

function normalizar(login: string): string {
  return login.trim().toLowerCase().replace(/[.\-]/g, '');
}
