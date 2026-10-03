package br.com.folhaconecta.documento;
import org.springframework.web.bind.annotation.*; import org.springframework.http.*; import org.springframework.core.io.Resource;
import lombok.RequiredArgsConstructor; import java.nio.charset.StandardCharsets;
@RestController @RequestMapping("/api/documentos") @RequiredArgsConstructor
public class DocumentoController {
 private final ArmazenamentoService servico;
 @GetMapping("/{id}/arquivo") public ResponseEntity<Resource> arquivo(@PathVariable Long id){var arquivo=servico.abrir(id);return ResponseEntity.ok().contentType(MediaType.parseMediaType(arquivo.contentType())).header(HttpHeaders.CONTENT_DISPOSITION,ContentDisposition.inline().filename(arquivo.nome(),StandardCharsets.UTF_8).build().toString()).header("X-Content-Type-Options","nosniff").body(arquivo.recurso());}
}
