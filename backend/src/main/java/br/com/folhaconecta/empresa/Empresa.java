package br.com.folhaconecta.empresa;
import jakarta.persistence.*; import lombok.*; import java.time.*; import java.math.BigDecimal; import java.util.*;
import br.com.folhaconecta.shared.entity.EntidadeBase;
import br.com.folhaconecta.empresa.Empresa; import br.com.folhaconecta.usuario.*;
import br.com.folhaconecta.auth.TipoLogin; import br.com.folhaconecta.funcionario.Funcionario;
import br.com.folhaconecta.pendencia.*; import br.com.folhaconecta.folha.*;
@Entity @Table(name="empresa") @Getter @Setter
public class Empresa extends EntidadeBase {
  private String razaoSocial;
  private String nomeFantasia;
  private String cnpj;
  private int diaFechamento;
}
