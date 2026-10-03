package br.com.folhaconecta.pendencia.dto;
import br.com.folhaconecta.pendencia.*; import br.com.folhaconecta.usuario.Papel; import java.time.*; import java.util.*;
public record PendenciaResponse(Long id,String titulo,String descricao,TipoPendencia tipo,StatusPendencia status,Papel setorResponsavel,String responsavelNome,Long funcionarioId,String funcionarioNome,LocalDate prazo,boolean atrasada,String competencia,boolean bloqueiaFolha,boolean abonado,LocalDate dataInicio,LocalDate dataFim,LocalDateTime criadoEm,LocalDateTime ultimaAtualizacao,String criadoPor,List<DocumentoResumo> documentos){
 public record DocumentoResumo(Long id,String nomeOriginal,String contentType,long tamanhoBytes,boolean sensivel){}
}
