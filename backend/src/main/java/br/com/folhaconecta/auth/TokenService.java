package br.com.folhaconecta.auth;
import br.com.folhaconecta.config.JwtProperties; import br.com.folhaconecta.usuario.Usuario;
import br.com.folhaconecta.funcionario.FuncionarioRepository;
import org.springframework.stereotype.Service; import org.springframework.security.oauth2.jwt.*; import org.springframework.security.oauth2.jose.jws.MacAlgorithm;
import java.time.*; import java.security.*; import java.nio.charset.StandardCharsets; import java.util.*; import lombok.RequiredArgsConstructor;
@Service @RequiredArgsConstructor
public class TokenService {
 private final JwtEncoder codificador; private final JwtProperties propriedades; private final FuncionarioRepository funcionarios;
 public String gerarAccessToken(Usuario usuario,Long empresaId){
  var agora=Instant.now(); var funcionario=funcionarios.findByUsuarioIdAndEmpresaId(usuario.getId(),empresaId);
  var claims=JwtClaimsSet.builder().subject(usuario.getId().toString()).issuedAt(agora).expiresAt(agora.plus(propriedades.accessTtl()))
   .claim("nome",usuario.getNome()).claim("tipoLogin",usuario.getTipoLogin().name()).claim("empresaId",empresaId)
   .claim("papeis",usuario.getPapeis().stream().map(Enum::name).toList());
  funcionario.ifPresent(f->claims.claim("funcionarioId",f.getId()));
  return codificador.encode(JwtEncoderParameters.from(JwsHeader.with(MacAlgorithm.HS256).build(),claims.build())).getTokenValue();
 }
 public String gerarAleatorio(){byte[] bytes=new byte[48];new SecureRandom().nextBytes(bytes);return Base64.getUrlEncoder().withoutPadding().encodeToString(bytes);}
 public String hash(String token){try{return HexFormat.of().formatHex(MessageDigest.getInstance("SHA-256").digest(token.getBytes(StandardCharsets.UTF_8)));}catch(NoSuchAlgorithmException erro){throw new IllegalStateException(erro);}}
}
