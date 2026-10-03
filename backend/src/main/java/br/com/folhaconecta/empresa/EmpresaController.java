package br.com.folhaconecta.empresa;
import org.springframework.web.bind.annotation.*; import org.springframework.security.access.prepost.PreAuthorize;
import jakarta.validation.Valid; import java.util.List; import lombok.RequiredArgsConstructor;
@RestController @RequiredArgsConstructor
public class EmpresaController {
 private final EmpresaService servico;
 @GetMapping("/api/empresas/minhas") @PreAuthorize("hasRole('CONTABILIDADE')") public List<EmpresaService.EmpresaResponse> minhas(@RequestParam String competencia){return servico.minhas(competencia);}
 @GetMapping("/api/admin/empresa") @PreAuthorize("hasRole('ADMIN')") public EmpresaService.EmpresaResponse minha(){return servico.minha();}
 @PutMapping("/api/admin/empresa") @PreAuthorize("hasRole('ADMIN')") public EmpresaService.EmpresaResponse editar(@Valid @RequestBody EmpresaService.EmpresaRequest entrada){return servico.editar(entrada);}
}
