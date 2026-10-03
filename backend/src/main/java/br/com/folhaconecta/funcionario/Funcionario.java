package br.com.folhaconecta.funcionario;
import jakarta.persistence.*; import lombok.*; import java.time.*; import java.math.BigDecimal; import java.util.*;
import br.com.folhaconecta.shared.entity.EntidadeBase;
import br.com.folhaconecta.empresa.Empresa; import br.com.folhaconecta.usuario.*;
import br.com.folhaconecta.auth.TipoLogin; import br.com.folhaconecta.funcionario.Funcionario;
import br.com.folhaconecta.pendencia.*; import br.com.folhaconecta.folha.*;
@Entity @Table(name="funcionario") @Getter @Setter
public class Funcionario extends EntidadeBase {
 @ManyToOne(fetch=FetchType.LAZY) private Empresa empresa;
 @OneToOne(fetch=FetchType.LAZY) private Usuario usuario;
  private String nome;
  private String cpf;
  private String matricula;
  private String cargo;
  private String departamento;
 @Column(precision=12,scale=2) private BigDecimal salarioBase;
  private int cargaHorariaMensal;
  private LocalDate dataAdmissao;
  private boolean ativo;
}
