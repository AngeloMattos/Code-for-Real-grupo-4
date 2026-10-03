import { Injectable, signal } from '@angular/core'; import { HttpErrorResponse } from '@angular/common/http';
@Injectable({providedIn:'root'})
export class UiService {
 readonly pendenciaId = signal<number|null>(null); readonly versao = signal(0);
 abrirPendencia(id:number) { this.pendenciaId.set(id); }
 atualizar() { this.versao.update(v=>v+1); }
 readonly toast = signal(''); readonly erro = signal(''); readonly hoje = signal('2026-10-20'); readonly competencia = signal('2026-10'); private timer?: ReturnType<typeof setTimeout>;
 avisar(mensagem: string) { this.toast.set(mensagem); clearTimeout(this.timer); this.timer = setTimeout(() => this.toast.set(''), 5000); }
 mensagem(erro: unknown) { return erro instanceof HttpErrorResponse ? erro.error?.mensagem || (erro.status === 0 ? 'Não foi possível conectar à API. Tente novamente.' : 'Não foi possível concluir. Tente novamente.') : 'Não foi possível concluir. Tente novamente.'; }
 falhar(erro: unknown) { this.erro.set(this.mensagem(erro)); }
 async baixar(blob: Blob, nome: string, visualizar = false) { const url = URL.createObjectURL(blob); if (visualizar) window.open(url, '_blank', 'noopener'); else { const a = document.createElement('a'); a.href = url; a.download = nome; a.click(); } setTimeout(() => URL.revokeObjectURL(url), 60000); }
}
