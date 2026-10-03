import { registerLocaleData } from '@angular/common';
import { provideHttpClient, withInterceptors } from '@angular/common/http';
import localePt from '@angular/common/locales/pt';
import { ApplicationConfig, LOCALE_ID, provideBrowserGlobalErrorListeners } from '@angular/core';
import { provideRouter } from '@angular/router';

import { routes } from './app.routes';
import { DASHBOARD_API } from './core/api/dashboard.api';
import { DashboardApiFake } from './core/api/dashboard.api.fake';
import { FOLHA_API } from './core/api/folha.api';
import { FolhaApiFake } from './core/api/folha.api.fake';
import { FUNCIONARIO_API } from './core/api/funcionario.api';
import { FuncionarioApiFake } from './core/api/funcionario.api.fake';
import { PENDENCIA_API } from './core/api/pendencia.api';
import { PendenciaApiFake } from './core/api/pendencia.api.fake';
import { HOLERITE_API } from './core/api/holerite.api';
import { HoleriteApiFake } from './core/api/holerite.api.fake';
import { PONTO_API } from './core/api/ponto.api';
import { PontoApiFake } from './core/api/ponto.api.fake';
import { SOLICITACAO_API } from './core/api/solicitacao.api';
import { SolicitacaoApiFake } from './core/api/solicitacao.api.fake';
import { AUTH_API } from './core/auth/auth.api';
import { AuthApiFake } from './core/auth/auth.api.fake';
import { authInterceptor } from './core/auth/auth.interceptor';

registerLocaleData(localePt);

export const appConfig: ApplicationConfig = {
  providers: [
    provideBrowserGlobalErrorListeners(),
    provideRouter(routes),
    provideHttpClient(withInterceptors([authInterceptor])),
    { provide: LOCALE_ID, useValue: 'pt-BR' },
    // Dados fictícios até o Spring ficar pronto; depois: AuthApiHttp e DashboardApiHttp.
    { provide: AUTH_API, useClass: AuthApiFake },
    { provide: DASHBOARD_API, useClass: DashboardApiFake },
    { provide: PONTO_API, useClass: PontoApiFake },
    { provide: HOLERITE_API, useClass: HoleriteApiFake },
    { provide: SOLICITACAO_API, useClass: SolicitacaoApiFake },
    { provide: PENDENCIA_API, useClass: PendenciaApiFake },
    { provide: FUNCIONARIO_API, useClass: FuncionarioApiFake },
    { provide: FOLHA_API, useClass: FolhaApiFake },
  ],
};
