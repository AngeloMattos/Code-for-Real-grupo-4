package br.com.folhaconecta.config;
import org.springframework.context.annotation.Profile; import org.springframework.web.bind.annotation.*; import org.springframework.security.access.prepost.PreAuthorize;
import java.util.Map; import lombok.RequiredArgsConstructor;
@RestController @RequestMapping("/api/demo") @Profile("dev") @RequiredArgsConstructor
public class DemoController {
 private final DemoRepository repositorio;
 @PostMapping("/reset") @PreAuthorize("hasAnyRole('RH','ADMIN')") public Map<String,String> resetar(){repositorio.resetar();return Map.of("mensagem","Dados ficticios restaurados.");}
}
