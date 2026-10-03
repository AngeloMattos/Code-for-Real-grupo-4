package br.com.folhaconecta.usuario;
import org.springframework.web.bind.annotation.*; import org.springframework.security.access.prepost.PreAuthorize; import jakarta.validation.Valid;
import java.util.List; import lombok.RequiredArgsConstructor;
@RestController @RequiredArgsConstructor
public class UsuarioController {
 private final UsuarioService servico;
 @GetMapping("/api/admin/usuarios") @PreAuthorize("hasRole('ADMIN')") public List<UsuarioService.UsuarioResponse> listar(){return servico.listar();}
 @PostMapping("/api/admin/usuarios") @PreAuthorize("hasRole('ADMIN')") public UsuarioService.UsuarioResponse criar(@Valid @RequestBody UsuarioService.UsuarioRequest entrada){return servico.criar(entrada);}
 @PutMapping("/api/admin/usuarios/{id}") @PreAuthorize("hasRole('ADMIN')") public UsuarioService.UsuarioResponse editar(@PathVariable Long id,@Valid @RequestBody UsuarioService.UsuarioRequest entrada){return servico.editar(id,entrada);}
 @PostMapping("/api/usuarios/{id}/redefinir-senha") @PreAuthorize("hasAnyRole('RH','ADMIN')") public UsuarioService.ConviteResponse redefinir(@PathVariable Long id){return servico.redefinir(id);}
}
