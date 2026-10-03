package br.com.folhaconecta.auth.dto;
import java.time.Instant;
public record LoginResponse(String accessToken,Instant expiraEm,UsuarioResponse usuario){}
