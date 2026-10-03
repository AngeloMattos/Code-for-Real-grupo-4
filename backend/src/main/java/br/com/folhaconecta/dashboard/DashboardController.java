package br.com.folhaconecta.dashboard;
import org.springframework.web.bind.annotation.*; import lombok.RequiredArgsConstructor;
@RestController @RequestMapping("/api/dashboard") @RequiredArgsConstructor
public class DashboardController {
 private final DashboardService servico;
 @GetMapping public DashboardService.DashboardResponse resumo(@RequestParam String competencia){return servico.resumo(competencia);}
}
