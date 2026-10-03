package br.com.folhaconecta.folha;
import br.com.folhaconecta.folha.dto.ItemFolhaResponse; import org.springframework.web.bind.annotation.*; import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.http.*; import lombok.RequiredArgsConstructor; import java.util.List;
@RestController @RequestMapping("/api/holerites/me") @PreAuthorize("hasRole('FUNCIONARIO')") @RequiredArgsConstructor
public class HoleriteController {
 private final FolhaService servico; private final HoleritePdfService pdf;
 @GetMapping public List<ItemFolhaResponse> listar(){return servico.meusHolerites();}
 @GetMapping("/{competencia}") public ItemFolhaResponse detalhe(@PathVariable String competencia){return servico.meuHolerite(competencia);}
 @GetMapping("/{competencia}/pdf") public ResponseEntity<byte[]> baixar(@PathVariable String competencia){return ResponseEntity.ok().contentType(MediaType.APPLICATION_PDF).header(HttpHeaders.CONTENT_DISPOSITION,"attachment; filename=holerite-"+competencia+".pdf").body(pdf.gerar(competencia));}
}
