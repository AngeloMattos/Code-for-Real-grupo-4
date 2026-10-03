import { Injectable, inject, signal } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Router } from '@angular/router';
import { Observable, catchError, finalize, firstValueFrom, shareReplay, tap, throwError } from 'rxjs';
import { environment } from '../../../environments/environment';
import { Papel, Sessao, Usuario } from '../models/modelos';
@Injectable({ providedIn: 'root' })
export class AuthService {
 private http = inject(HttpClient); private router = inject(Router); private renovacao?: Observable<Sessao>;
 readonly usuario = signal<Usuario | null>(null); readonly token = signal<string | null>(null); readonly setor = signal<Papel | null>(null);
 aplicar(sessao: Sessao) { this.token.set(sessao.accessToken); this.usuario.set(sessao.usuario); if (!this.setor() || !sessao.usuario.papeis.includes(this.setor()!)) this.setor.set(sessao.usuario.papeis[0]); }
 tem(...papeis: Papel[]) { return !!this.usuario() && papeis.some(p => this.usuario()!.papeis.includes(p)); }
 async restaurar() { try { this.aplicar(await firstValueFrom(this.http.post<Sessao>(`${environment.apiUrl}/auth/refresh`, {}, { withCredentials: true }))); } catch { this.limpar(); } }
 async entrar(tipo: 'FUNCIONARIO' | 'EMPRESA', login: string, senha: string) { const sessao = await firstValueFrom(this.http.post<Sessao>(`${environment.apiUrl}/auth/login`, { tipo, login, senha }, { withCredentials: true })); this.aplicar(sessao); const destino = sessionStorage.getItem('pagina-retorno'); sessionStorage.removeItem('pagina-retorno'); await this.router.navigateByUrl(sessao.usuario.papeis.length > 1 ? '/escolher-setor' : destino || '/inicio'); }
 renovar() { if (!this.renovacao) this.renovacao = this.http.post<Sessao>(`${environment.apiUrl}/auth/refresh`, {}, { withCredentials: true }).pipe(tap(s => this.aplicar(s)), catchError(e => { this.expirar(); return throwError(() => e); }), finalize(() => this.renovacao = undefined), shareReplay({ bufferSize: 1, refCount: false })); return this.renovacao; }
 async trocarEmpresa(empresaId: number) { this.aplicar(await firstValueFrom(this.http.post<Sessao>(`${environment.apiUrl}/auth/trocar-empresa`, { empresaId }, { withCredentials: true }))); }
 async atualizarUsuario() { this.usuario.set(await firstValueFrom(this.http.get<Usuario>(`${environment.apiUrl}/auth/me`))); }
 async sair() { try { await firstValueFrom(this.http.post(`${environment.apiUrl}/auth/logout`, {}, { withCredentials: true })); } finally { this.limpar(); await this.router.navigateByUrl('/login'); } }
 expirar() { if (!this.router.url.startsWith('/login')) sessionStorage.setItem('pagina-retorno', this.router.url); this.limpar(); void this.router.navigate(['/login'], { queryParams: { expirada: 1 } }); }
 private limpar() { this.token.set(null); this.usuario.set(null); this.setor.set(null); }
}
