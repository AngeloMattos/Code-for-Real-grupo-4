import { Injectable, inject, InjectionToken } from '@angular/core'; import { HttpClient, HttpParams } from '@angular/common/http'; import { firstValueFrom } from 'rxjs';
import { environment } from '../../../environments/environment';
export interface Api { get<T>(caminho: string, filtros?: Record<string,string|number|boolean|undefined>): Promise<T>; post<T>(caminho: string, dados?: unknown): Promise<T>; patch<T>(caminho: string, dados: unknown): Promise<T>; put<T>(caminho: string, dados: unknown): Promise<T>; arquivo(caminho: string): Promise<Blob>; }
export const API = new InjectionToken<Api>('API Folha Conecta');
@Injectable({providedIn:'root'})
export class RestApi implements Api {
 private http = inject(HttpClient);
 get<T>(caminho: string, filtros: Record<string,string|number|boolean|undefined> = {}) { let params = new HttpParams(); for (const [chave, valor] of Object.entries(filtros)) if (valor !== undefined && valor !== '') params = params.set(chave, valor); return firstValueFrom(this.http.get<T>(environment.apiUrl + caminho, { params })); }
 post<T>(caminho: string, dados: unknown = {}) { return firstValueFrom(this.http.post<T>(environment.apiUrl + caminho, dados)); }
 patch<T>(caminho: string, dados: unknown) { return firstValueFrom(this.http.patch<T>(environment.apiUrl + caminho, dados)); }
 put<T>(caminho: string, dados: unknown) { return firstValueFrom(this.http.put<T>(environment.apiUrl + caminho, dados)); }
 arquivo(caminho: string) { return firstValueFrom(this.http.get(environment.apiUrl + caminho, { responseType: 'blob' })); }
}
