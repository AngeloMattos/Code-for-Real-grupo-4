package br.com.folhaconecta.auth.dto;
import jakarta.validation.constraints.*;
public record PrimeiroAcessoRequest(@NotBlank String token,@NotBlank @Size(min=8,max=72) String senha){}
