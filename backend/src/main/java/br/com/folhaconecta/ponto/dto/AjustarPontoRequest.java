package br.com.folhaconecta.ponto.dto;
import java.time.LocalTime; import jakarta.validation.constraints.*;
public record AjustarPontoRequest(@NotNull LocalTime entrada,@NotNull LocalTime saida,@NotBlank @Size(max=1000) String justificativa){}
