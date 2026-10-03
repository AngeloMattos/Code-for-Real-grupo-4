package br.com.folhaconecta.pendencia;
import jakarta.persistence.*; import lombok.*; import java.time.*; import java.math.BigDecimal; import java.util.*;
import br.com.folhaconecta.shared.entity.EntidadeBase;
import br.com.folhaconecta.empresa.Empresa; import br.com.folhaconecta.usuario.*;
import br.com.folhaconecta.auth.TipoLogin; import br.com.folhaconecta.funcionario.Funcionario;
import br.com.folhaconecta.pendencia.*; import br.com.folhaconecta.folha.*;
@Entity @Table(name="pendencia") @Getter @Setter
public class Pendencia extends EntidadeBase {
 @ManyToOne(fetch=FetchType.LAZY) private Empresa empresa;
 @ManyToOne(fetch=FetchType.LAZY) private Funcionario funcionario;
 @ManyToOne(fetch=FetchType.LAZY) private Usuario criadoPor;
 @ManyToOne(fetch=FetchType.LAZY) private Usuario responsavel;
  private String titulo;
 @Column(columnDefinition="text") private String descricao;
 @Enumerated(EnumType.STRING) private TipoPendencia tipo;
 @Enumerated(EnumType.STRING) private StatusPendencia status;
 @Enumerated(EnumType.STRING) private Papel setorResponsavel;
 @Enumerated(EnumType.STRING) private Papel setorSolicitante;
  private LocalDate prazo;
  private String competencia;
  private LocalDate dataInicio;
  private LocalDate dataFim;
  private boolean bloqueiaFolha;
  private boolean abonado;
 public boolean isAtrasada() { return status!=StatusPendencia.CONCLUIDA && status!=StatusPendencia.CANCELADA && prazo!=null && prazo.isBefore(LocalDate.now()); }
}
