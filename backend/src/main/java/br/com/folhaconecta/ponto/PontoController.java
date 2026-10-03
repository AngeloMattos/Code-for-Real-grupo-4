package br.com.folhaconecta.ponto;
import br.com.folhaconecta.ponto.dto.*; import org.springframework.web.bind.annotation.*; import org.springframework.security.access.prepost.PreAuthorize;
import jakarta.validation.Valid; import lombok.RequiredArgsConstructor; import java.util.List;
@RestController @RequestMapping("/api/ponto") @RequiredArgsConstructor
public class PontoController {
 private final PontoService servico;
 @PostMapping("/registrar") @PreAuthorize("hasRole('FUNCIONARIO')") public PontoResponse registrar(){return servico.registrar();}
 @GetMapping("/me") @PreAuthorize("hasRole('FUNCIONARIO')") public List<PontoResponse> meus(@RequestParam String competencia){return servico.meusRegistros(competencia);}
 @GetMapping @PreAuthorize("hasAnyRole('RH','FINANCEIRO')") public List<?> equipe(@RequestParam String competencia,@RequestParam(defaultValue="false") boolean inconsistentes){return servico.equipe(competencia,inconsistentes);}
 @PatchMapping("/{id}") @PreAuthorize("hasRole('RH')") public PontoResponse ajustar(@PathVariable Long id,@Valid @RequestBody AjustarPontoRequest entrada){return servico.ajustar(id,entrada);}
 @GetMapping("/{id}/eventos") @PreAuthorize("hasAnyRole('RH','FUNCIONARIO')") public List<PontoService.EventoPontoResponse> eventos(@PathVariable Long id){return servico.historico(id);}
}
