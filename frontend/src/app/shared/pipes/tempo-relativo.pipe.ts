import { Pipe, PipeTransform } from '@angular/core';

/** "agora", "há 10 min", "há 2 h", "ontem", "há 3 dias". */
@Pipe({ name: 'tempoRelativo' })
export class TempoRelativoPipe implements PipeTransform {
  transform(iso: string | null | undefined): string {
    if (!iso) return '';
    const minutos = Math.floor((Date.now() - new Date(iso).getTime()) / 60_000);
    if (minutos < 1) return 'agora';
    if (minutos < 60) return `há ${minutos} min`;
    const horas = Math.floor(minutos / 60);
    if (horas < 24) return `há ${horas} h`;
    const dias = Math.floor(horas / 24);
    return dias === 1 ? 'ontem' : `há ${dias} dias`;
  }
}
