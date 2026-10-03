package br.com.folhaconecta.auth;

import br.com.folhaconecta.auth.dto.LoginResponse;

/** Resultado interno de login/refresh: o corpo da resposta e o refresh token que vai no cookie. */
public record SessaoAutenticada(LoginResponse resposta, String refreshToken) {
}
