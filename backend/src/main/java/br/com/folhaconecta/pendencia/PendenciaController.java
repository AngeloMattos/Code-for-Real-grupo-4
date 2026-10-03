package br.com.folhaconecta.pendencia;
import br.com.folhaconecta.pendencia.dto.*; import br.com.folhaconecta.shared.web.*;
import org.springframework.web.bind.annotation.*; import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.data.domain.Pageable; import org.springframework.data.web.PageableDefault; import org.springframework.web.multipart.MultipartFile;
import jakarta.validation.Valid; import lombok.RequiredArgsConstructor; import java.util.*;
@RestController @RequiredArgsConstructor
public class PendenciaController {
 private final PendenciaService servico;
 @GetMapping("/api/pendencias") public PaginaResponse<PendenciaResponse> listar(PendenciaService.PendenciaFiltro filtro,@PageableDefault(size=20,sort="prazo") Pageable pagina){return servico.listar(filtro,pagina);}
 @GetMapping("/api/pendencias/{id}") public PendenciaResponse detalhe(@PathVariable Long id){return servico.detalhe(id);}
 @GetMapping("/api/pendencias/{id}/eventos") public List<EventoResponse> eventos(@PathVariable Long id){return servico.historico(id);}
 @PostMapping("/api/pendencias") @PreAuthorize("hasAnyRole('RH','FINANCEIRO','CONTABILIDADE')") public PendenciaResponse criar(@Valid @RequestBody CriarPendenciaRequest entrada){return servico.criar(entrada);}
 @PostMapping(value="/api/solicitacoes",consumes="multipart/form-data") @PreAuthorize("hasRole('FUNCIONARIO')") public PendenciaResponse solicitar(@Valid @RequestPart("dados") SolicitacaoRequest entrada,@RequestPart(value="arquivo",required=false) MultipartFile arquivo){return servico.solicitar(entrada,arquivo);}
 @PatchMapping("/api/pendencias/{id}/status") public PendenciaResponse mudar(@PathVariable Long id,@Valid @RequestBody MudarStatusRequest entrada){return servico.mudarStatus(id,entrada);}
 @PatchMapping("/api/pendencias/{id}") @PreAuthorize("hasRole('RH')") public PendenciaResponse atribuir(@PathVariable Long id,@RequestBody PendenciaService.AlterarPendenciaRequest entrada){return servico.atribuir(id,entrada);}
 @PostMapping("/api/pendencias/{id}/comentarios") public PendenciaResponse comentar(@PathVariable Long id,@Valid @RequestBody PendenciaService.ComentarioRequest entrada){return servico.comentar(id,entrada.comentario());}
 @PostMapping(value="/api/pendencias/{id}/documentos",consumes="multipart/form-data") @PreAuthorize("hasAnyRole('RH','FUNCIONARIO')") public PendenciaResponse anexar(@PathVariable Long id,@RequestPart("arquivo") MultipartFile arquivo){return servico.anexar(id,arquivo);}
}
