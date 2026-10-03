package br.com.folhaconecta.auth.dto;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;

import br.com.folhaconecta.usuario.TipoLogin;

/** login = CPF (tipo FUNCIONARIO) ou e-mail (tipo EMPRESA). */
public record LoginRequest(
    @NotNull TipoLogin tipo,
    @NotBlank String login,
    @NotBlank String senha) {
}
