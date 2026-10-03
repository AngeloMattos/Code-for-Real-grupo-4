import { Injectable, signal } from '@angular/core';

/** Contador do sino. Fictício até ligar em GET /api/notificacoes. */
@Injectable({ providedIn: 'root' })
export class NotificacoesService {
  readonly naoLidas = signal(3);
}
