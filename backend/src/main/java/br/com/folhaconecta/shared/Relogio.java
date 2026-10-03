package br.com.folhaconecta.shared;
import org.springframework.stereotype.Component; import org.springframework.beans.factory.annotation.Value; import java.time.*;
@Component
public class Relogio {
 private final String referencia;
 public Relogio(@Value("${app.data-referencia:}") String referencia){this.referencia=referencia;}
 public LocalDate hoje(){return referencia.isBlank()?LocalDate.now():LocalDate.parse(referencia);}
 public LocalDateTime agora(){return hoje().atTime(LocalTime.now());}
}
