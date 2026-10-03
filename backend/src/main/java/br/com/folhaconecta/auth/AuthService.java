package br.com.folhaconecta.auth;

import java.time.LocalDateTime;
import java.util.Comparator;
import java.util.Optional;

import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import br.com.folhaconecta.auth.dto.LoginRequest;
import br.com.folhaconecta.auth.dto.LoginResponse;
import br.com.folhaconecta.auth.dto.UsuarioLogadoResponse;
import br.com.folhaconecta.config.JwtProperties;
import br.com.folhaconecta.empresa.Empresa;
import br.com.folhaconecta.empresa.EmpresaRepository;
import br.com.folhaconecta.funcionario.Funcionario;
import br.com.folhaconecta.shared.exception.NaoAutenticadoException;
import br.com.folhaconecta.shared.exception.NaoEncontradoException;
import br.com.folhaconecta.usuario.TipoLogin;
import br.com.folhaconecta.usuario.Usuario;
import br.com.folhaconecta.usuario.UsuarioRepository;

@Service
public class AuthService {

    static final String LOGIN_INVALIDO = "Login ou senha inválidos";
    static final String SESSAO_INVALIDA = "Sessão expirada. Entre novamente.";

    private final UsuarioRepository usuarios;
    private final EmpresaRepository empresas;
    private final RefreshTokenRepository refreshTokens;
    private final TokenService tokenService;
    private final PasswordEncoder passwordEncoder;
    private final JwtProperties props;
    private final UsuarioLogado usuarioLogado;

    // Usado quando o login nao existe, para a resposta levar o mesmo tempo de uma senha errada
    private final String hashFicticio;

    public AuthService(UsuarioRepository usuarios, EmpresaRepository empresas,
                       RefreshTokenRepository refreshTokens, TokenService tokenService,
                       PasswordEncoder passwordEncoder, JwtProperties props, UsuarioLogado usuarioLogado) {
        this.usuarios = usuarios;
        this.empresas = empresas;
        this.refreshTokens = refreshTokens;
        this.tokenService = tokenService;
        this.passwordEncoder = passwordEncoder;
        this.props = props;
        this.usuarioLogado = usuarioLogado;
        this.hashFicticio = passwordEncoder.encode("senha-ficticia-para-tempo-constante");
    }

    @Transactional
    public SessaoAutenticada login(LoginRequest req) {
        Usuario usuario = buscarPorLogin(req.tipo(), req.login()).filter(Usuario::isAtivo).orElse(null);
        String hash = usuario != null && usuario.getSenhaHash() != null ? usuario.getSenhaHash() : hashFicticio;
        boolean senhaConfere = passwordEncoder.matches(req.senha(), hash);

        if (usuario == null || usuario.getSenhaHash() == null || !senhaConfere) {
            throw new NaoAutenticadoException(LOGIN_INVALIDO);
        }
        Empresa empresa = empresaPadrao(usuario).orElseThrow(() -> new NaoAutenticadoException(LOGIN_INVALIDO));
        return emitirSessao(usuario, empresa);
    }

    /** Troca o refresh por um novo par (rotacao). Reuso de token revogado derruba todas as sessoes do usuario. */
    @Transactional(noRollbackFor = NaoAutenticadoException.class)
    public SessaoAutenticada refresh(String refreshToken) {
        RefreshToken atual = buscarRefresh(refreshToken)
            .orElseThrow(() -> new NaoAutenticadoException(SESSAO_INVALIDA));
        Usuario usuario = atual.getUsuario();

        if (atual.isRevogado()) {
            refreshTokens.revogarTodosDoUsuario(usuario.getId());
            throw new NaoAutenticadoException(SESSAO_INVALIDA);
        }
        atual.setRevogado(true);
        if (!atual.isValido() || !usuario.isAtivo() || !temAcesso(usuario, atual.getEmpresa())) {
            throw new NaoAutenticadoException(SESSAO_INVALIDA);
        }
        return emitirSessao(usuario, atual.getEmpresa());
    }

    @Transactional
    public void logout(String refreshToken) {
        buscarRefresh(refreshToken).ifPresent(r -> r.setRevogado(true));
    }

    @Transactional(readOnly = true)
    public UsuarioLogadoResponse me() {
        Usuario usuario = usuarios.findById(usuarioLogado.id())
            .orElseThrow(() -> new NaoEncontradoException("Usuário não encontrado."));
        Empresa empresa = empresas.findById(usuarioLogado.empresaId())
            .orElseThrow(() -> new NaoEncontradoException("Empresa não encontrada."));
        return UsuarioLogadoResponse.de(usuario, empresa);
    }

    private SessaoAutenticada emitirSessao(Usuario usuario, Empresa empresa) {
        TokenService.TokenAcesso acesso = tokenService.gerarAccessToken(usuario, empresa.getId());

        String refresh = tokenService.gerarRefreshToken();
        RefreshToken novo = new RefreshToken();
        novo.setUsuario(usuario);
        novo.setEmpresa(empresa);
        novo.setTokenHash(tokenService.hash(refresh));
        novo.setExpiraEm(LocalDateTime.now().plus(props.refreshTtl()));
        refreshTokens.save(novo);

        LoginResponse resposta = new LoginResponse(acesso.valor(), acesso.expiraEm(),
            UsuarioLogadoResponse.de(usuario, empresa));
        return new SessaoAutenticada(resposta, refresh);
    }

    private Optional<Usuario> buscarPorLogin(TipoLogin tipo, String login) {
        String valor = login.trim();
        return switch (tipo) {
            case FUNCIONARIO -> usuarios.findByCpfAndTipoLogin(valor.replaceAll("\\D", ""), TipoLogin.FUNCIONARIO);
            case EMPRESA -> usuarios.findByEmailIgnoreCaseAndTipoLogin(valor, TipoLogin.EMPRESA);
        };
    }

    private Optional<RefreshToken> buscarRefresh(String refreshToken) {
        if (refreshToken == null || refreshToken.isBlank()) {
            return Optional.empty();
        }
        return refreshTokens.findByTokenHash(tokenService.hash(refreshToken));
    }

    /** Funcionario entra na empresa do seu cadastro; usuario de empresa entra na primeira que atende. */
    private Optional<Empresa> empresaPadrao(Usuario usuario) {
        Funcionario funcionario = usuario.getFuncionario();
        if (funcionario != null) {
            return Optional.of(funcionario.getEmpresa());
        }
        return usuario.getEmpresas().stream().min(Comparator.comparing(Empresa::getId));
    }

    private boolean temAcesso(Usuario usuario, Empresa empresa) {
        Funcionario funcionario = usuario.getFuncionario();
        if (funcionario != null) {
            return funcionario.getEmpresa().getId().equals(empresa.getId());
        }
        return usuario.getEmpresas().stream().anyMatch(e -> e.getId().equals(empresa.getId()));
    }
}
