package br.com.folhaconecta.ponto;
import jakarta.persistence.*; import lombok.*; import java.time.*; import java.math.BigDecimal; import java.util.*;
import br.com.folhaconecta.shared.entity.EntidadeBase;
import br.com.folhaconecta.empresa.Empresa; import br.com.folhaconecta.usuario.*;
import br.com.folhaconecta.auth.TipoLogin; import br.com.folhaconecta.funcionario.Funcionario;
import br.com.folhaconecta.pendencia.*; import br.com.folhaconecta.folha.*;
@Entity @Table(name="registro_ponto") @Getter @Setter
public class RegistroPonto extends EntidadeBase {
 @ManyToOne(fetch=FetchType.LAZY) private Empresa empresa;
 @ManyToOne(fetch=FetchType.LAZY) private Funcionario funcionario;
  private LocalDate data;
  private LocalTime entrada;
  private LocalTime saida;
  private boolean ajustado;
 @Column(columnDefinition="text") private String justificativa;
 @ManyToOne(fetch=FetchType.LAZY) private Usuario ajustadoPor;
}
