package br.com.folhaconecta.pendencia.dto;
import br.com.folhaconecta.pendencia.StatusPendencia; import br.com.folhaconecta.usuario.Papel; import jakarta.validation.constraints.*;
public record MudarStatusRequest(@NotNull StatusPendencia novoStatus,@NotNull Papel proximoSetor,@Size(max=4000) String comentario){}
