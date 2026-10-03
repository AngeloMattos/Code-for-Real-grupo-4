package br.com.folhaconecta.config;
import java.time.Duration;
import org.springframework.boot.context.properties.ConfigurationProperties;
import org.springframework.validation.annotation.Validated;
import jakarta.validation.constraints.*;
@Validated @ConfigurationProperties("app.jwt")
public record JwtProperties(@NotBlank @Size(min=32) String secret, @NotNull Duration accessTtl, @NotNull Duration refreshTtl) {}
