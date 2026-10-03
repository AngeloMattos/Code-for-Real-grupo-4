package br.com.folhaconecta.ponto;
import jakarta.persistence.*; import lombok.*; import java.time.*;
import br.com.folhaconecta.shared.entity.EntidadeBase; import br.com.folhaconecta.empresa.Empresa; import br.com.folhaconecta.usuario.Usuario;
@Entity @Table(name="registro_ponto_evento") @Getter @Setter
public class RegistroPontoEvento extends EntidadeBase {
 @ManyToOne(fetch=FetchType.LAZY) private Empresa empresa;
 @ManyToOne(fetch=FetchType.LAZY) private RegistroPonto registro;
 @ManyToOne(fetch=FetchType.LAZY) private Usuario autor;
 private LocalTime entradaAnterior; private LocalTime saidaAnterior; private LocalTime entradaNova; private LocalTime saidaNova;
 @Column(columnDefinition="text") private String justificativa;
}
