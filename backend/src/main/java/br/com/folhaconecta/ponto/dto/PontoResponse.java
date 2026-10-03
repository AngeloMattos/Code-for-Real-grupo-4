package br.com.folhaconecta.ponto.dto;
import java.time.*; import java.math.BigDecimal;
public record PontoResponse(Long id,Long funcionarioId,String funcionarioNome,LocalDate data,LocalTime entrada,LocalTime saida,BigDecimal totalHoras,BigDecimal horasExtras,boolean inconsistente,boolean ajustado,String justificativa){}
