package br.com.folhaconecta.folha;
import jakarta.persistence.*; import lombok.*; import java.time.*; import java.math.BigDecimal; import java.util.*;
import br.com.folhaconecta.shared.entity.EntidadeBase;
import br.com.folhaconecta.empresa.Empresa; import br.com.folhaconecta.usuario.*;
import br.com.folhaconecta.auth.TipoLogin; import br.com.folhaconecta.funcionario.Funcionario;
import br.com.folhaconecta.pendencia.*; import br.com.folhaconecta.folha.*;
@Entity @Table(name="folha") @Getter @Setter
public class Folha extends EntidadeBase {
 @ManyToOne(fetch=FetchType.LAZY) private Empresa empresa;
  private String competencia;
 @Enumerated(EnumType.STRING) private StatusFolha status;
  private LocalDateTime calculadaEm;
  private LocalDateTime fechadaEm;
 @ManyToOne(fetch=FetchType.LAZY) private Usuario fechadaPor;
}
