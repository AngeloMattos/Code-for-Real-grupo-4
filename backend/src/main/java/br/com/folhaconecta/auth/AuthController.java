package br.com.folhaconecta.auth;

import java.time.Duration;

import org.springframework.http.HttpHeaders;
import org.springframework.http.ResponseCookie;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.CookieValue;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import br.com.folhaconecta.auth.dto.LoginRequest;
import br.com.folhaconecta.auth.dto.LoginResponse;
import br.com.folhaconecta.auth.dto.UsuarioLogadoResponse;
import br.com.folhaconecta.config.JwtProperties;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;

@RestController
@RequestMapping("/api/auth")
@RequiredArgsConstructor
public class AuthController {

    static final String COOKIE_REFRESH = "refresh_token";

    private final AuthService service;
    private final JwtProperties props;

    @PostMapping("/login")
    public ResponseEntity<LoginResponse> login(@Valid @RequestBody LoginRequest req) {
        return comCookie(service.login(req));
    }

    @PostMapping("/refresh")
    public ResponseEntity<LoginResponse> refresh(
            @CookieValue(name = COOKIE_REFRESH, required = false) String refreshToken) {
        return comCookie(service.refresh(refreshToken));
    }

    @PostMapping("/logout")
    public ResponseEntity<Void> logout(
            @CookieValue(name = COOKIE_REFRESH, required = false) String refreshToken) {
        service.logout(refreshToken);
        return ResponseEntity.noContent()
            .header(HttpHeaders.SET_COOKIE, cookie("", Duration.ZERO).toString())
            .build();
    }

    @GetMapping("/me")
    public UsuarioLogadoResponse me() {
        return service.me();
    }

    private ResponseEntity<LoginResponse> comCookie(SessaoAutenticada sessao) {
        return ResponseEntity.ok()
            .header(HttpHeaders.SET_COOKIE, cookie(sessao.refreshToken(), props.refreshTtl()).toString())
            .body(sessao.resposta());
    }

    private ResponseCookie cookie(String valor, Duration maxAge) {
        return ResponseCookie.from(COOKIE_REFRESH, valor)
            .httpOnly(true)
            .secure(props.cookieSeguro())
            .sameSite("Strict")
            .path("/api/auth")
            .maxAge(maxAge)
            .build();
    }
}
