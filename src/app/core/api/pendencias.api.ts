import { Injectable, inject } from '@angular/core'; import { API } from './api.service'; import { Evento, Pagina, Papel, Pendencia, StatusPendencia } from '../models/modelos';
export interface PendenciasApi { listar(filtros: Record<string,string|number|boolean|undefined>): Promise<Pagina<Pendencia>>; detalhe(id: number): Promise<Pendencia>; historico(id: number): Promise<Evento[]>; }
@Injectable({providedIn:'root'})
export class PendenciasRestApi implements PendenciasApi {
 private api = inject(API);
 listar(filtros: Record<string,string|number|boolean|undefined>) { return this.api.get<Pagina<Pendencia>>('/pendencias', filtros); }
 detalhe(id: number) { return this.api.get<Pendencia>(`/pendencias/${id}`); }
 historico(id: number) { return this.api.get<Evento[]>(`/pendencias/${id}/eventos`); }
 status(id: number, novoStatus: StatusPendencia, proximoSetor: Papel, comentario: string) { return this.api.patch<Pendencia>(`/pendencias/${id}/status`, { novoStatus, proximoSetor, comentario }); }
 comentar(id: number, comentario: string) { return this.api.post<Pendencia>(`/pendencias/${id}/comentarios`, { comentario }); }
 anexar(id: number, arquivo: File) { const dados = new FormData(); dados.append('arquivo', arquivo); return this.api.post<Pendencia>(`/pendencias/${id}/documentos`, dados); }
}
