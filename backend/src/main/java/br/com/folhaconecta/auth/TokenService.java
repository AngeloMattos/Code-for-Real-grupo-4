package br.com.folhaconecta.auth;

import java.nio.charset.StandardCharsets;
import java.security.MessageDigest;
import java.security.NoSuchAlgorithmException;
import java.security.SecureRandom;
import java.time.Instant;
import java.util.Base64;
import java.util.HexFormat;

import org.springframework.security.oauth2.jose.jws.MacAlgorithm;
import org.springframework.security.oauth2.jwt.JwsHeader;
import org.springframework.security.oauth2.jwt.JwtClaimsSet;
import org.springframework.security.oauth2.jwt.JwtEncoder;
import org.springframework.security.oauth2.jwt.JwtEncoderParameters;
import org.springframework.stereotype.Service;

import br.com.folhaconecta.config.JwtProperties;
import br.com.folhaconecta.usuario.Usuario;
import lombok.RequiredArgsConstructor;

@Service
@RequiredArgsConstructor
public class TokenService {

    private static final SecureRandom RANDOM = new SecureRandom();

    private final JwtEncoder encoder;
    private final JwtProperties props;

    public record TokenAcesso(String valor, Instant expiraEm) {}

    public TokenAcesso gerarAccessToken(Usuario u, Long empresaId) {
        Instant agora = Instant.now();
        Instant expiraEm = agora.plus(props.accessTtl());
        JwtClaimsSet.Builder claims = JwtClaimsSet.builder()
            .subject(u.getId().toString())
            .issuedAt(agora)
            .expiresAt(expiraEm)
            .claim("nome", u.getNome())
            .claim("tipoLogin", u.getTipoLogin().name())
            .claim("empresaId", empresaId)
            .claim("papeis", u.getPapeis().stream().map(Enum::name).sorted().toList());
        if (u.getFuncionarioId() != null) {
            claims.claim("funcionarioId", u.getFuncionarioId());
        }
        JwsHeader header = JwsHeader.with(MacAlgorithm.HS256).build();
        String valor = encoder.encode(JwtEncoderParameters.from(header, claims.build())).getTokenValue();
        return new TokenAcesso(valor, expiraEm);
    }

    /** Token opaco e aleatorio; so o hash vai para o banco. */
    public String gerarRefreshToken() {
        byte[] bytes = new byte[32];
        RANDOM.nextBytes(bytes);
        return Base64.getUrlEncoder().withoutPadding().encodeToString(bytes);
    }

    public String hash(String token) {
        try {
            byte[] digest = MessageDigest.getInstance("SHA-256").digest(token.getBytes(StandardCharsets.UTF_8));
            return HexFormat.of().formatHex(digest);
        } catch (NoSuchAlgorithmException e) {
            throw new IllegalStateException(e);
        }
    }
}
