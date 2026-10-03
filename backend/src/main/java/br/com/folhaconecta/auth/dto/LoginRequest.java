package br.com.folhaconecta.auth.dto;
import br.com.folhaconecta.auth.TipoLogin; import jakarta.validation.constraints.*;
public record LoginRequest(@NotNull TipoLogin tipo,@NotBlank String login,@NotBlank String senha){}
