package br.com.folhaconecta.pendencia.dto;
import br.com.folhaconecta.pendencia.TipoPendencia; import br.com.folhaconecta.usuario.Papel; import jakarta.validation.constraints.*; import java.time.LocalDate;
public record CriarPendenciaRequest(@NotNull Long funcionarioId,@NotBlank @Size(max=120) String titulo,String descricao,@NotNull TipoPendencia tipo,@NotNull Papel setorResponsavel,@FutureOrPresent LocalDate prazo,@Pattern(regexp="[0-9]{4}-(0[1-9]|1[0-2])") String competencia,LocalDate dataInicio,LocalDate dataFim,boolean bloqueiaFolha){}
