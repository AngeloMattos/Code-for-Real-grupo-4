package br.com.folhaconecta.folha.dto;
import br.com.folhaconecta.folha.StatusFolha; import br.com.folhaconecta.pendencia.dto.PendenciaResponse; import java.time.*; import java.util.List;
public record FolhaResponse(Long id,String competencia,StatusFolha status,LocalDateTime calculadaEm,LocalDateTime fechadaEm,boolean bloqueada,List<PendenciaResponse> bloqueios,List<String> etapas,int etapaAtual){}
