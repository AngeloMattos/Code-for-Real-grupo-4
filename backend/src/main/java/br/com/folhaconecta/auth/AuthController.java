package br.com.folhaconecta.auth;
import br.com.folhaconecta.auth.dto.*; import jakarta.validation.Valid; import jakarta.validation.constraints.*;
import org.springframework.web.bind.annotation.*; import org.springframework.http.*; import lombok.RequiredArgsConstructor;
import java.util.Map;
import org.springframework.security.access.prepost.PreAuthorize;
@RestController @RequestMapping("/api/auth") @RequiredArgsConstructor
public class AuthController {
 @org.springframework.beans.factory.annotation.Value("${app.cookie-seguro:true}") private boolean cookieSeguro;
 private final AuthService servico;
 public record TrocarEmpresaRequest(@NotNull Long empresaId){}
 public record RecuperarSenhaRequest(@NotBlank String login){}
 private ResponseCookie cookie(String token,int dias){return ResponseCookie.from("refresh_token",token).httpOnly(true).secure(cookieSeguro).sameSite("Strict").path("/api/auth").maxAge(dias*86400L).build();}
 private ResponseEntity<LoginResponse> sessao(AuthService.Sessao sessao){return ResponseEntity.ok().header(HttpHeaders.SET_COOKIE,cookie(sessao.refreshToken(),7).toString()).body(sessao.resposta());}
 @PostMapping("/login") public ResponseEntity<LoginResponse> entrar(@Valid @RequestBody LoginRequest entrada){return sessao(servico.entrar(entrada));}
 @PostMapping("/refresh") public ResponseEntity<LoginResponse> renovar(@CookieValue(name="refresh_token",required=false) String token){return sessao(servico.renovar(token));}
 @PostMapping("/logout") public ResponseEntity<Void> sair(@CookieValue(name="refresh_token",required=false) String token){servico.sair(token);return ResponseEntity.noContent().header(HttpHeaders.SET_COOKIE,cookie("",0).toString()).build();}
 @GetMapping("/me") public UsuarioResponse meusDados(){return servico.meusDados();}
 @PostMapping("/trocar-empresa") @PreAuthorize("hasRole('CONTABILIDADE')") public ResponseEntity<LoginResponse> trocar(@Valid @RequestBody TrocarEmpresaRequest entrada,@CookieValue(name="refresh_token",required=false) String token){return sessao(servico.trocarEmpresa(entrada.empresaId(),token));}
 @PostMapping("/primeiro-acesso") public Map<String,String> primeiro(@Valid @RequestBody PrimeiroAcessoRequest entrada){servico.primeiroAcesso(entrada);return Map.of("mensagem","Senha criada. Voce ja pode entrar.");}
 @PostMapping("/esqueci-senha") public Map<String,String> recuperar(@Valid @RequestBody RecuperarSenhaRequest entrada){servico.recuperar(entrada.login());return Map.of("mensagem","Se o cadastro existir, sua solicitacao sera encaminhada ao responsavel.");}
}
