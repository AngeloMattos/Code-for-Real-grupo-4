package br.com.folhaconecta.folha;
import jakarta.persistence.*; import lombok.*; import java.time.*; import java.math.BigDecimal; import java.util.*;
import br.com.folhaconecta.shared.entity.EntidadeBase;
import br.com.folhaconecta.empresa.Empresa; import br.com.folhaconecta.usuario.*;
import br.com.folhaconecta.auth.TipoLogin; import br.com.folhaconecta.funcionario.Funcionario;
import br.com.folhaconecta.pendencia.*; import br.com.folhaconecta.folha.*;
@Entity @Table(name="item_folha") @Getter @Setter
public class ItemFolha extends EntidadeBase {
 @ManyToOne(fetch=FetchType.LAZY) private Empresa empresa;
 @ManyToOne(fetch=FetchType.LAZY) private Folha folha;
 @ManyToOne(fetch=FetchType.LAZY) private Funcionario funcionario;
 @Column(precision=12,scale=2) private BigDecimal salarioBase;
 @Column(precision=12,scale=2) private BigDecimal horasExtras;
 @Column(precision=12,scale=2) private BigDecimal valorHorasExtras;
  private int diasFalta;
 @Column(precision=12,scale=2) private BigDecimal valorFaltas;
 @Column(precision=12,scale=2) private BigDecimal inss;
 @Column(precision=12,scale=2) private BigDecimal irrf;
 @Column(precision=12,scale=2) private BigDecimal valeTransporte;
 @Column(precision=12,scale=2) private BigDecimal liquido;
 @Column(columnDefinition="text") private String memoriaCalculo;
  private boolean publicado;
}
