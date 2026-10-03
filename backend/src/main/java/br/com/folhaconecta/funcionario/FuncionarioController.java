package br.com.folhaconecta.funcionario;
import br.com.folhaconecta.funcionario.dto.*; import br.com.folhaconecta.shared.web.*;
import org.springframework.web.bind.annotation.*; import org.springframework.security.access.prepost.PreAuthorize; import org.springframework.data.domain.Pageable; import org.springframework.data.web.PageableDefault;
import jakarta.validation.Valid; import lombok.RequiredArgsConstructor;
@RestController @RequestMapping("/api/funcionarios") @RequiredArgsConstructor
public class FuncionarioController {
 private final FuncionarioService servico;
 @GetMapping @PreAuthorize("hasAnyRole('RH','FINANCEIRO','CONTABILIDADE','ADMIN')") public PaginaResponse<FuncionarioResponse> listar(@RequestParam(required=false) String q,@RequestParam(required=false) String departamento,@PageableDefault(size=20) Pageable pagina){return servico.listar(q,departamento,pagina);}
 @GetMapping("/me") @PreAuthorize("hasRole('FUNCIONARIO')") public FuncionarioResponse meusDados(){return servico.meusDados();}
 @GetMapping("/{id}") @PreAuthorize("hasAnyRole('RH','ADMIN')") public FuncionarioResponse detalhe(@PathVariable Long id){return servico.detalhe(id);}
 @PostMapping @PreAuthorize("hasAnyRole('RH','ADMIN')") public FuncionarioService.CadastroResponse criar(@Valid @RequestBody FuncionarioRequest entrada){return servico.criar(entrada);}
 @PutMapping("/{id}") @PreAuthorize("hasAnyRole('RH','ADMIN')") public FuncionarioResponse editar(@PathVariable Long id,@Valid @RequestBody EditarFuncionarioRequest entrada){return servico.editar(id,entrada);}
}
