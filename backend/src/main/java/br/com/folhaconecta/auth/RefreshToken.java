package br.com.folhaconecta.auth;
import jakarta.persistence.*; import lombok.*; import java.time.*; import java.math.BigDecimal; import java.util.*;
import br.com.folhaconecta.shared.entity.EntidadeBase;
import br.com.folhaconecta.empresa.Empresa; import br.com.folhaconecta.usuario.*;
import br.com.folhaconecta.auth.TipoLogin; import br.com.folhaconecta.funcionario.Funcionario;
import br.com.folhaconecta.pendencia.*; import br.com.folhaconecta.folha.*;
@Entity @Table(name="refresh_token") @Getter @Setter
public class RefreshToken extends EntidadeBase {
 @ManyToOne(fetch=FetchType.LAZY) private Empresa empresa;
 @ManyToOne(fetch=FetchType.LAZY) private Usuario usuario;
  private String tokenHash;
  private LocalDateTime expiraEm;
  private boolean revogado;
}
