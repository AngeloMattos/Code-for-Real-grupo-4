package br.com.folhaconecta.config;

import java.time.Duration;

import org.springframework.boot.context.properties.ConfigurationProperties;

@ConfigurationProperties("app.jwt")
public record JwtProperties(String secret, Duration accessTtl, Duration refreshTtl, boolean cookieSeguro) {

    public JwtProperties {
        if (secret == null || secret.length() < 32) {
            throw new IllegalStateException("A variavel JWT_SECRET precisa ter no minimo 32 caracteres.");
        }
    }
}
