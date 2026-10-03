package br.com.folhaconecta.folha;
import br.com.folhaconecta.folha.dto.*; import org.springframework.web.bind.annotation.*; import org.springframework.security.access.prepost.PreAuthorize;
import lombok.RequiredArgsConstructor; import java.util.List;
@RestController @RequestMapping("/api/folhas/{competencia}") @RequiredArgsConstructor
public class FolhaController {
 private final FolhaService servico;
 @GetMapping @PreAuthorize("hasAnyRole('RH','FINANCEIRO','CONTABILIDADE','ADMIN')") public FolhaResponse detalhe(@PathVariable String competencia){return servico.detalhe(competencia);}
 @PostMapping("/calcular") @PreAuthorize("hasRole('FINANCEIRO')") public FolhaResponse calcular(@PathVariable String competencia){return servico.calcular(competencia);}
 @GetMapping("/itens") @PreAuthorize("hasAnyRole('FINANCEIRO','CONTABILIDADE')") public List<ItemFolhaResponse> itens(@PathVariable String competencia){return servico.listarItens(competencia);}
 @GetMapping("/itens/{id}/memoria") @PreAuthorize("hasAnyRole('FINANCEIRO','CONTABILIDADE')") public ItemFolhaResponse memoria(@PathVariable String competencia,@PathVariable Long id){return servico.memoria(competencia,id);}
 @PostMapping("/enviar-contabilidade") @PreAuthorize("hasRole('FINANCEIRO')") public FolhaResponse enviar(@PathVariable String competencia){return servico.enviar(competencia);}
 @PostMapping("/fechar") @PreAuthorize("hasRole('CONTABILIDADE')") public FolhaResponse fechar(@PathVariable String competencia){return servico.fechar(competencia);}
 @PostMapping("/publicar-holerites") @PreAuthorize("hasRole('FINANCEIRO')") public FolhaResponse publicar(@PathVariable String competencia){return servico.publicar(competencia);}
}
