package br.com.folhaconecta.empresa;
import br.com.folhaconecta.auth.UsuarioLogado; import br.com.folhaconecta.folha.*; import br.com.folhaconecta.pendencia.*; import br.com.folhaconecta.usuario.Papel;
import br.com.folhaconecta.shared.Relogio; import org.springframework.stereotype.Service; import org.springframework.transaction.annotation.Transactional;
import jakarta.validation.constraints.*; import java.util.*; import java.time.*; import lombok.RequiredArgsConstructor;
@Service @RequiredArgsConstructor
public class EmpresaService {
 private final UsuarioLogado logado; private final FolhaRepository folhas; private final PendenciaRepository pendencias; private final Relogio relogio;
 public record EmpresaResponse(Long id,String nome,String razaoSocial,String cnpj,int diaFechamento,StatusFolha statusFolha,long pendenciasAbertas,LocalDate prazoFechamento){}
 public record EmpresaRequest(@NotBlank String razaoSocial,@NotBlank String nomeFantasia,@NotBlank String cnpj,@Min(1) @Max(28) int diaFechamento){}
 private EmpresaResponse resumir(Empresa empresa,String competencia){var mes=YearMonth.parse(competencia);return new EmpresaResponse(empresa.getId(),empresa.getNomeFantasia(),empresa.getRazaoSocial(),empresa.getCnpj(),empresa.getDiaFechamento(),folhas.findByEmpresaIdAndCompetencia(empresa.getId(),competencia).map(Folha::getStatus).orElse(StatusFolha.ABERTA),pendencias.findByEmpresaId(empresa.getId()).stream().filter(p->competencia.equals(p.getCompetencia())&&p.getStatus()!=StatusPendencia.CONCLUIDA&&p.getStatus()!=StatusPendencia.CANCELADA).count(),mes.atDay(empresa.getDiaFechamento()));}
 @Transactional(readOnly=true) public List<EmpresaResponse> minhas(String competencia){logado.exigir(Papel.CONTABILIDADE);return logado.usuario().getEmpresas().stream().sorted(Comparator.comparing(Empresa::getId)).map(e->resumir(e,competencia)).toList();}
 @Transactional(readOnly=true) public EmpresaResponse minha(){return resumir(logado.empresa(),YearMonth.from(relogio.hoje()).toString());}
 @Transactional public EmpresaResponse editar(EmpresaRequest entrada){logado.exigir(Papel.ADMIN);var empresa=logado.empresa();empresa.setRazaoSocial(entrada.razaoSocial());empresa.setNomeFantasia(entrada.nomeFantasia());empresa.setCnpj(entrada.cnpj());empresa.setDiaFechamento(entrada.diaFechamento());return resumir(empresa,YearMonth.from(relogio.hoje()).toString());}
}
