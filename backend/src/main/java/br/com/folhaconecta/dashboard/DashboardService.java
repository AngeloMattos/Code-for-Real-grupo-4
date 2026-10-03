package br.com.folhaconecta.dashboard;
import br.com.folhaconecta.pendencia.*; import br.com.folhaconecta.pendencia.dto.*; import br.com.folhaconecta.auth.UsuarioLogado;
import br.com.folhaconecta.shared.Relogio; import br.com.folhaconecta.usuario.Papel; import br.com.folhaconecta.folha.*; import br.com.folhaconecta.folha.dto.*;
import org.springframework.stereotype.Service; import org.springframework.transaction.annotation.Transactional;
import java.time.*; import java.util.*; import lombok.RequiredArgsConstructor;
@Service @RequiredArgsConstructor
public class DashboardService {
 private final PendenciaService pendencias; private final UsuarioLogado logado; private final Relogio relogio; private final FolhaService folhas;
 public record DashboardResponse(long abertas,long vencemEmTresDias,long atrasadas,long aguardandoValidacao,List<PendenciaResponse> precisaAcao,List<EventoResponse> atividades,FolhaResponse folha,LocalDate hoje){}
 @Transactional(readOnly=true) public DashboardResponse resumo(String competencia){
  var todas=pendencias.todasVisiveis();var abertas=todas.stream().filter(p->p.status()!=StatusPendencia.CONCLUIDA&&p.status()!=StatusPendencia.CANCELADA).toList();
  var comigo=abertas.stream().filter(p->logado.tem(Papel.FUNCIONARIO)||logado.papeis().contains(p.setorResponsavel())).sorted(Comparator.comparing(PendenciaResponse::prazo,Comparator.nullsLast(Comparator.naturalOrder()))).limit(5).toList();
  var atividades=todas.stream().flatMap(p->pendencias.historico(p.id()).stream()).sorted(Comparator.comparing(EventoResponse::criadoEm).reversed()).limit(6).toList();
  return new DashboardResponse(abertas.size(),abertas.stream().filter(p->p.prazo()!=null&&!p.prazo().isBefore(relogio.hoje())&&!p.prazo().isAfter(relogio.hoje().plusDays(3))).count(),abertas.stream().filter(PendenciaResponse::atrasada).count(),abertas.stream().filter(p->p.status()==StatusPendencia.EM_ANALISE).count(),comigo,atividades,logado.tem(Papel.FUNCIONARIO)?null:folhas.detalhe(competencia),relogio.hoje());
 }
}
