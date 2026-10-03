package br.com.folhaconecta.pendencia.dto;
import br.com.folhaconecta.pendencia.TipoPendencia; import jakarta.validation.constraints.*; import java.time.LocalDate;
public record SolicitacaoRequest(@NotNull TipoPendencia tipo,@NotBlank @Size(max=120) String titulo,LocalDate dataInicio,LocalDate dataFim,@Size(max=4000) String observacao){}
