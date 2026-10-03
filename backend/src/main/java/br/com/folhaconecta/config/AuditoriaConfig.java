package br.com.folhaconecta.config;
import br.com.folhaconecta.shared.Relogio; import org.springframework.context.annotation.*;
import org.springframework.data.jpa.repository.config.EnableJpaAuditing; import org.springframework.data.auditing.DateTimeProvider; import java.util.Optional;
@Configuration @EnableJpaAuditing(dateTimeProviderRef="horarioAuditoria")
public class AuditoriaConfig {
 @Bean DateTimeProvider horarioAuditoria(Relogio relogio){return ()->Optional.of(relogio.agora());}
}
