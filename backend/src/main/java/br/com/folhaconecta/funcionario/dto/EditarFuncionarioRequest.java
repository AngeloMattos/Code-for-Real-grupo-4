package br.com.folhaconecta.funcionario.dto;
import jakarta.validation.constraints.*; import java.math.BigDecimal; import java.time.LocalDate;
public record EditarFuncionarioRequest(@NotBlank String nome,@NotBlank @Pattern(regexp="[0-9]{11}") String cpf,@NotBlank String matricula,@NotBlank String cargo,@NotBlank String departamento,@DecimalMin("0.01") BigDecimal salarioBase,@Min(1) int cargaHorariaMensal,@NotNull LocalDate dataAdmissao,boolean ativo){}
