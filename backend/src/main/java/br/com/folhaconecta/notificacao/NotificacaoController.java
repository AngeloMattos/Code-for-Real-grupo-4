package br.com.folhaconecta.notificacao;
import org.springframework.web.bind.annotation.*; import lombok.RequiredArgsConstructor; import java.util.List;
@RestController @RequestMapping("/api/notificacoes") @RequiredArgsConstructor
public class NotificacaoController {
 private final NotificacaoService servico;
 @GetMapping public List<NotificacaoService.NotificacaoResponse> listar(){return servico.listar();}
 @PatchMapping("/{id}/lida") public void ler(@PathVariable Long id){servico.marcarLida(id);}
}
