package br.com.folhaconecta.ponto.dto;
import java.math.BigDecimal; import java.time.LocalDate; import java.util.List;
public record ResumoPonto(BigDecimal horasExtras,int diasSemMarcacao,List<LocalDate> datasFalta,List<LocalDate> datasExtras){}
