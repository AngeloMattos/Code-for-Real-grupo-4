package br.com.folhaconecta.pendencia.dto;
import br.com.folhaconecta.pendencia.*; import br.com.folhaconecta.usuario.Papel; import java.time.*; import java.util.Set;
public record EventoResponse(Long id,TipoEvento tipo,StatusPendencia statusAnterior,StatusPendencia statusNovo,String comentario,String autor,Set<Papel> papeis,LocalDateTime criadoEm){
 public static EventoResponse de(PendenciaEvento evento){return new EventoResponse(evento.getId(),evento.getTipo(),evento.getStatusAnterior(),evento.getStatusNovo(),evento.getComentario(),evento.getAutor().getNome(),evento.getAutor().getPapeis(),evento.getCriadoEm());}
}
