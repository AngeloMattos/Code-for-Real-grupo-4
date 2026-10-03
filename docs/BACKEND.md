# Folha Conecta — Contexto do Backend (Spring Boot)

> **Como usar este arquivo:** ele serve como prompt/contexto para qualquer pessoa do time ou assistente de IA que for gerar ou alterar código do backend. Antes de escrever código, leia tudo e siga as regras à risca. Em caso de dúvida, a regra deste documento vale mais que a preferência pessoal.

## Papel do assistente

Você é um desenvolvedor backend sênior trabalhando na **Folha Conecta**, uma API REST em Spring Boot que conecta Funcionário, RH, Financeiro e Contabilidade em torno das pendências e do fechamento da folha de pagamento. O front é um app Angular que consome esta API.

Ao gerar código:

- Siga a estrutura de pacotes, os nomes de classes e os padrões descritos aqui.
- Use o módulo `pendencia` como modelo para os demais módulos.
- Escreva nomes de classes, métodos, campos e mensagens em **português**, sem acentos no código.
- Nunca coloque regra de negócio no controller nem confie no front para filtrar dados.
- Toda consulta de negócio deve filtrar pela empresa do usuário logado.

## 1. Stack

- **Linguagem:** Java 17 (mínimo exigido pelo Spring Boot 4).
- **Framework:** Spring Boot 4.1.x.
- **Build:** Maven.
- **Banco:** PostgreSQL 17, rodando via Docker Compose.
- **Migrations:** Flyway (o Hibernate só valida o esquema).
- **Persistência:** Spring Data JPA (Hibernate).
- **Segurança:** Spring Security + OAuth2 Resource Server (JWT HS256), sem filtro manual.
- **Validação:** Bean Validation (`@Valid`, `@NotBlank` etc.).
- **Documentação:** springdoc-openapi (Swagger UI em `http://localhost:8080/swagger-ui.html`), que é o contrato entre front e back.
- **Arquivos:** disco local em `uploads/{empresaId}/` (trocar por S3 no futuro).
- **Dependências do start.spring.io:** Spring Web, Spring Data JPA, PostgreSQL Driver, Flyway, Validation, Spring Security, OAuth2 Resource Server e Lombok.

## 2. Decisões obrigatórias

- **Multiempresa desde o início:** toda tabela de negócio tem `empresa_id`, e toda consulta filtra por `usuarioLogado.empresaId()`.
- **Histórico obrigatório:** toda alteração em uma pendência grava um `PendenciaEvento` na mesma transação.
- **DTOs como `record`:** a API nunca devolve entidade JPA diretamente.
- **Dinheiro em `BigDecimal`** (coluna `numeric(12,2)`), nunca `double`. Arredondamento `RoundingMode.HALF_EVEN`, 2 casas.
- **Datas** como `LocalDate` e `LocalDateTime`; `prazo` é só data.
- **Enums gravados como texto:** sempre `@Enumerated(EnumType.STRING)`.
- **"Atrasada" não é status:** é calculada (`prazo < hoje` e status diferente de `CONCLUIDA`). O DTO devolve `atrasada: true`.
- **"Bloqueada" não é status da folha:** é calculada pelas pendências bloqueantes da competência.

## 3. Arquitetura

Camadas clássicas do Spring, com a segurança na frente de tudo: uma requisição sem token válido não chega ao controller.

- **Controller:** recebe a requisição, valida o DTO com `@Valid`, chama o service e devolve o DTO.
- **Service:** contém as regras de negócio e as transações (`@Transactional`).
- **Repository:** único ponto que acessa o banco.
- **Componentes de apoio:** `UsuarioLogado`, `NotificacaoService`, `ArmazenamentoService`, `GlobalExceptionHandler`.

## 4. Estrutura de pastas

Pacotes por funcionalidade, não por camada. Cada pessoa trabalha em um módulo sem conflitar com as outras.

```
folha-conecta-api/
├─ docker-compose.yml                  PostgreSQL local
├─ pom.xml
└─ src/main/
   ├─ java/br/com/folhaconecta/
   │  ├─ FolhaConectaApplication.java
   │  ├─ config/          SecurityConfig, CorsConfig, OpenApiConfig, JwtProperties
   │  ├─ auth/            AuthController, AuthService, TokenService, UsuarioLogado,
   │  │                   RefreshToken, RefreshTokenRepository, dto/
   │  ├─ usuario/         Usuario, Papel, UsuarioRepository, UsuarioService, UsuarioController
   │  ├─ empresa/         Empresa, EmpresaRepository, EmpresaService, EmpresaController
   │  ├─ funcionario/     Funcionario, FuncionarioRepository, FuncionarioService,
   │  │                   FuncionarioController, dto/
   │  ├─ pendencia/       Pendencia, PendenciaEvento, StatusPendencia, TipoPendencia,
   │  │                   PendenciaRepository, PendenciaEventoRepository,
   │  │                   PendenciaSpecs, PendenciaService, PendenciaController, dto/
   │  ├─ documento/       Documento, DocumentoRepository, ArmazenamentoService,
   │  │                   DocumentoController
   │  ├─ ponto/           RegistroPonto, RegistroPontoRepository, PontoService,
   │  │                   PontoController, dto/
   │  ├─ folha/           Folha, ItemFolha, StatusFolha, FolhaRepository,
   │  │                   ItemFolhaRepository, FolhaService, CalculoFolhaService,
   │  │                   TabelasFiscais, FolhaController, HoleriteController, dto/
   │  ├─ notificacao/     Notificacao, NotificacaoRepository, NotificacaoService,
   │  │                   NotificacaoController
   │  ├─ dashboard/       DashboardService, DashboardController (só leitura)
   │  └─ shared/
   │     ├─ entity/       EntidadeBase (id, criadoEm, atualizadoEm)
   │     ├─ exception/    GlobalExceptionHandler, RegraNegocioException,
   │     │                NaoEncontradoException, AcessoNegadoException
   │     └─ web/          PaginaResponse, ErroResponse
   └─ resources/
      ├─ application.yml
      ├─ application-dev.yml
      └─ db/migration/
         ├─ V1__esquema_inicial.sql
         └─ V2__dados_demo.sql
```

Regra dentro de cada módulo:

- Entidade e enums na raiz do pacote.
- `dto/` com os `record` de entrada (`...Request`) e de saída (`...Response`).
- Repository só acessa o banco.
- Service tem regras e transações.
- Controller só recebe, delega e devolve.

## 5. Modelo de dados

São 11 entidades. A **Pendência** é o centro: liga funcionário, documento, histórico e folha. Todas estendem `EntidadeBase` (`id`, `criadoEm`, `atualizadoEm` com `@PrePersist` e `@PreUpdate`).

- **Empresa:** razaoSocial, nomeFantasia, cnpj, diaFechamento. Tem funcionários, pendências e folhas.
- **Usuario:** nome, email (login empresa), cpf (login funcionário), senhaHash, tipoLogin, papeis, ativo. N:N com Empresa (`usuario_empresa`), pois a Contabilidade atende várias.
- **Funcionario:** nome, cpf, matricula, cargo, departamento, salarioBase, cargaHorariaMensal (padrão 220), dataAdmissao, ativo. N:1 Empresa; 1:1 Usuario (vazio até o primeiro acesso).
- **Pendencia:** titulo, descricao, tipo, status, setorResponsavel, prazo, competencia (`"2026-10"`), dataInicio e dataFim (atestado e férias), bloqueiaFolha. N:1 Empresa, Funcionario, criadoPor e responsavel (Usuario, opcional).
- **PendenciaEvento:** tipo, statusAnterior, statusNovo, comentario. N:1 Pendencia e autor (Usuario).
- **Documento:** nomeOriginal, caminhoArquivo, contentType, tamanhoBytes, sensivel. N:1 Pendencia, Funcionario e enviadoPor.
- **RegistroPonto:** data, entrada, saida, ajustado, justificativa. N:1 Funcionario.
- **Folha:** competencia, status, calculadaEm, fechadaEm. N:1 Empresa e fechadaPor; uma por empresa e mês.
- **ItemFolha:** salarioBase, horasExtras, valorHorasExtras, diasFalta, valorFaltas, inss, irrf, valeTransporte, liquido, memoriaCalculo (texto JSON), publicado. N:1 Folha e Funcionario (vira o holerite).
- **Notificacao:** titulo, mensagem, link, lida. N:1 Usuario.
- **RefreshToken:** tokenHash, expiraEm, revogado. N:1 Usuario.

### Enums

- **Papel:** FUNCIONARIO, RH, FINANCEIRO, CONTABILIDADE, ADMIN.
- **StatusPendencia:** ABERTA, EM_ANALISE, CORRECAO_SOLICITADA, CONCLUIDA, CANCELADA.
- **TipoPendencia:** ATESTADO, FERIAS, ALTERACAO_CADASTRAL, DUVIDA, AJUSTE_PONTO, DOCUMENTO_SOLICITADO, CORRECAO_FOLHA.
- **TipoEvento:** CRIADA, STATUS_ALTERADO, ATRIBUIDA, DOCUMENTO_ENVIADO, COMENTARIO, PRAZO_ALTERADO.
- **StatusFolha:** ABERTA, PREVIA_CALCULADA, EM_CONFERENCIA, FECHADA.
- **TipoLogin:** FUNCIONARIO, EMPRESA.

## 6. Classes principais (módulo modelo: `pendencia`)

- **Pendencia** (entidade): dados e método `isAtrasada()`.
- **PendenciaRepository:** `JpaRepository` + `JpaSpecificationExecutor`.
- **PendenciaSpecs:** filtros combináveis (status, tipo, setor, funcionário, atrasadas).
- **PendenciaService:** criar, atribuir, mudar status e gravar evento no histórico.
- **PendenciaController:** endpoints `/api/pendencias`.
- **PendenciaResponse:** o que o front recebe, já com `atrasada` e `ultimaAtualizacao`.
- **TransicaoStatus:** valida transições; lança `RegraNegocioException` (409).
- **ArmazenamentoService:** salva e lê arquivos em `uploads/{empresaId}/`.
- **CalculoFolhaService:** calcula um `ItemFolha` a partir de salário, ponto e pendências.
- **NotificacaoService:** cria notificações quando uma pendência muda de mãos.
- **UsuarioLogado:** lê do JWT o usuário, a empresa e os papéis.
- **GlobalExceptionHandler:** converte exceções em JSON padronizado (400, 403, 404, 409).

### Entidade

```java
@Entity
@Table(name = "pendencia")
@Getter @Setter
public class Pendencia extends EntidadeBase {

    @ManyToOne(fetch = FetchType.LAZY, optional = false)
    private Empresa empresa;

    @ManyToOne(fetch = FetchType.LAZY, optional = false)
    private Funcionario funcionario;

    @Column(nullable = false, length = 120)
    private String titulo;

    private String descricao;

    @Enumerated(EnumType.STRING)
    private TipoPendencia tipo;

    @Enumerated(EnumType.STRING)
    private StatusPendencia status = StatusPendencia.ABERTA;

    @Enumerated(EnumType.STRING)
    private Papel setorResponsavel;      // "com quem está"

    @ManyToOne(fetch = FetchType.LAZY)
    private Usuario responsavel;          // pessoa, opcional

    private LocalDate prazo;
    private String competencia;           // "2026-10"
    private boolean bloqueiaFolha;

    public boolean isAtrasada() {
        return status != StatusPendencia.CONCLUIDA
            && prazo != null && prazo.isBefore(LocalDate.now());
    }
}
```

### DTOs

```java
public record CriarPendenciaRequest(
    @NotNull Long funcionarioId,
    @NotBlank @Size(max = 120) String titulo,
    String descricao,
    @NotNull TipoPendencia tipo,
    @NotNull Papel setorResponsavel,
    @FutureOrPresent LocalDate prazo,
    boolean bloqueiaFolha) {}

public record MudarStatusRequest(
    @NotNull StatusPendencia novoStatus,
    @NotNull Papel proximoSetor,
    String comentario) {}

public record PendenciaResponse(
    Long id, String titulo, String descricao, TipoPendencia tipo, StatusPendencia status,
    Papel setorResponsavel, String responsavelNome,
    Long funcionarioId, String funcionarioNome,
    LocalDate prazo, boolean atrasada,
    LocalDateTime criadoEm, LocalDateTime ultimaAtualizacao) {

    public static PendenciaResponse de(Pendencia p) { /* monta a partir da entidade */ }
}

// GET /pendencias/{id}/eventos, em ordem cronológica. O front mostra como chat:
// comentários viram balões e mudanças de status viram linhas do sistema.
public record PendenciaEventoResponse(
    Long id, TipoEvento tipo, // CRIACAO, COMENTARIO, MUDANCA_STATUS
    String autorNome, Papel autorSetor, String comentario,
    StatusPendencia statusAnterior, StatusPendencia statusNovo,
    LocalDateTime quando) {}
```

### Service

```java
@Service
@RequiredArgsConstructor
public class PendenciaService {

    private final PendenciaRepository pendencias;
    private final PendenciaEventoRepository eventos;
    private final NotificacaoService notificacoes;
    private final UsuarioLogado usuarioLogado;

    @Transactional
    public PendenciaResponse mudarStatus(Long id, MudarStatusRequest req) {
        Pendencia p = buscarDaEmpresa(id);           // 404 se for de outra empresa
        TransicaoStatus.validar(p, req, usuarioLogado.papeis()); // 409 se não puder

        StatusPendencia anterior = p.getStatus();
        p.setStatus(req.novoStatus());
        p.setSetorResponsavel(req.proximoSetor());

        eventos.save(PendenciaEvento.statusAlterado(p, usuarioLogado.usuario(),
                anterior, req.novoStatus(), req.comentario()));
        notificacoes.avisarSetor(p.getEmpresa(), req.proximoSetor(), p);
        return PendenciaResponse.de(p);
    }
}
```

### Controller

```java
@RestController
@RequestMapping("/api/pendencias")
@RequiredArgsConstructor
public class PendenciaController {

    private final PendenciaService service;

    @GetMapping
    public Page<PendenciaResponse> listar(PendenciaFiltro filtro, Pageable pageable) {
        return service.listar(filtro, pageable);
    }

    @PostMapping
    @PreAuthorize("hasAnyRole('RH','FINANCEIRO','CONTABILIDADE')")
    public ResponseEntity<PendenciaResponse> criar(@Valid @RequestBody CriarPendenciaRequest req) {
        PendenciaResponse criada = service.criar(req);
        return ResponseEntity.created(URI.create("/api/pendencias/" + criada.id())).body(criada);
    }

    @PatchMapping("/{id}/status")
    public PendenciaResponse mudarStatus(@PathVariable Long id,
                                         @Valid @RequestBody MudarStatusRequest req) {
        return service.mudarStatus(id, req);
    }
}
```

### Erros padronizados

O `GlobalExceptionHandler` (`@RestControllerAdvice`) devolve sempre o mesmo formato, que o front mostra no toast:

```json
{ "status": 409, "erro": "REGRA_NEGOCIO", "mensagem": "Somente o RH pode aprovar um atestado.", "campos": {} }
```

## 7. Login e segurança

Access token JWT de **15 minutos** (usuário, empresa e papéis) e refresh token de **7 dias** em cookie HttpOnly. O Spring Security valida o JWT em toda requisição, e cada service filtra pela empresa do token.

### Fluxo do login

1. O front envia `POST /api/auth/login` com `{ "tipo": "FUNCIONARIO", "login": "123.456.789-00", "senha": "..." }` ou `{ "tipo": "EMPRESA", "login": "rh@empresa.com", ... }`.
2. O `AuthService` busca por CPF (funcionário) ou e-mail (empresa) e compara a senha com BCrypt. Em qualquer erro, a mensagem é sempre "Login ou senha inválidos".
3. O `TokenService` gera o JWT e um refresh token aleatório, salvo no banco só como hash.
4. A resposta traz `{ accessToken, expiraEm, usuario: { nome, papeis, empresa } }`; o refresh vai no cookie `refresh_token` (HttpOnly, SameSite=Strict, path `/api/auth`).
5. O front manda `Authorization: Bearer <token>`. Ao receber 401, chama `POST /api/auth/refresh`, que troca o refresh por um novo par (rotação) e invalida o antigo.
6. `POST /api/auth/logout` revoga o refresh e apaga o cookie.

### Conteúdo do JWT

```json
{
  "sub": "42",
  "nome": "Ana Souza",
  "tipoLogin": "EMPRESA",
  "empresaId": 1,
  "funcionarioId": null,
  "papeis": ["RH"],
  "iat": 1791036000,
  "exp": 1791036900
}
```

O token **não** leva CPF, salário nem outro dado sensível: ele é só codificado, não criptografado.

### Endpoints de autenticação

- `POST /api/auth/login` — entrar (funcionário ou empresa). Público.
- `POST /api/auth/refresh` — renovar o access token pelo cookie. Público (usa o cookie).
- `POST /api/auth/logout` — sair e revogar o refresh. Público (usa o cookie).
- `GET /api/auth/me` — dados do usuário logado para o front montar o menu. Autenticado.
- `POST /api/auth/trocar-empresa` — Contabilidade troca a empresa ativa (gera novo token). Autenticado.
- `POST /api/auth/primeiro-acesso` — funcionário cria a senha com o token de convite. Público.
- `POST /api/auth/esqueci-senha` — abre uma pendência para o RH ou o Admin redefinir. Público.

### SecurityConfig

```java
@Configuration
@EnableMethodSecurity
@RequiredArgsConstructor
public class SecurityConfig {

    private final JwtProperties jwt;

    @Bean
    SecurityFilterChain filterChain(HttpSecurity http) throws Exception {
        return http
            .csrf(csrf -> csrf.disable())
            .cors(Customizer.withDefaults())
            .sessionManagement(s -> s.sessionCreationPolicy(SessionCreationPolicy.STATELESS))
            .authorizeHttpRequests(auth -> auth
                .requestMatchers("/api/auth/login", "/api/auth/refresh", "/api/auth/logout",
                                 "/api/auth/primeiro-acesso", "/api/auth/esqueci-senha").permitAll()
                .requestMatchers("/swagger-ui/**", "/v3/api-docs/**").permitAll()
                .requestMatchers("/api/admin/**").hasRole("ADMIN")
                .anyRequest().authenticated())
            .oauth2ResourceServer(o -> o.jwt(j -> j.jwtAuthenticationConverter(converter())))
            .build();
    }

    @Bean
    JwtDecoder jwtDecoder() {
        return NimbusJwtDecoder.withSecretKey(chave()).macAlgorithm(MacAlgorithm.HS256).build();
    }

    @Bean
    JwtEncoder jwtEncoder() {
        return new NimbusJwtEncoder(new ImmutableSecret<>(chave()));
    }

    @Bean
    PasswordEncoder passwordEncoder() {
        return new BCryptPasswordEncoder();
    }

    private JwtAuthenticationConverter converter() {
        var papeis = new JwtGrantedAuthoritiesConverter();
        papeis.setAuthoritiesClaimName("papeis");
        papeis.setAuthorityPrefix("ROLE_");
        var conv = new JwtAuthenticationConverter();
        conv.setJwtGrantedAuthoritiesConverter(papeis);
        return conv;
    }

    private SecretKey chave() {
        return new SecretKeySpec(jwt.secret().getBytes(StandardCharsets.UTF_8), "HmacSHA256");
    }
}
```

### TokenService

```java
@Service
@RequiredArgsConstructor
public class TokenService {

    private final JwtEncoder encoder;
    private final JwtProperties props;

    public String gerarAccessToken(Usuario u, Long empresaId) {
        Instant agora = Instant.now();
        JwtClaimsSet claims = JwtClaimsSet.builder()
            .subject(u.getId().toString())
            .issuedAt(agora)
            .expiresAt(agora.plus(props.accessTtl()))
            .claim("nome", u.getNome())
            .claim("tipoLogin", u.getTipoLogin().name())
            .claim("empresaId", empresaId)
            .claim("funcionarioId", u.getFuncionarioId())
            .claim("papeis", u.getPapeis().stream().map(Enum::name).toList())
            .build();
        JwsHeader header = JwsHeader.with(MacAlgorithm.HS256).build();
        return encoder.encode(JwtEncoderParameters.from(header, claims)).getTokenValue();
    }
}
```

### UsuarioLogado

Componente que todo service usa para saber quem está chamando:

```java
@Component
public class UsuarioLogado {
    private Jwt jwt() {
        return (Jwt) SecurityContextHolder.getContext().getAuthentication().getPrincipal();
    }
    public Long id()            { return Long.valueOf(jwt().getSubject()); }
    public Long empresaId()     { return ((Number) jwt().getClaim("empresaId")).longValue(); }
    public Long funcionarioId() { Number n = jwt().getClaim("funcionarioId"); return n == null ? null : n.longValue(); }
    public Set<Papel> papeis()  { /* converte a claim "papeis" */ }
    public boolean tem(Papel p) { return papeis().contains(p); }
}
```

### Regras de acesso a dados

- **Empresa:** toda consulta usa `usuarioLogado.empresaId()`. Buscar um id de outra empresa devolve **404**, não 403, para não revelar que o registro existe.
- **Funcionário:** só enxerga registros com o próprio `funcionarioId`. O filtro fica no service, nunca no front.
- **Papéis:** `@PreAuthorize("hasRole('...')")` nos endpoints, seguindo a matriz de permissões do guia de frontend.
- **Documentos sensíveis:** baixar um atestado exige o papel RH ou ser o funcionário dono do arquivo.

### Primeiro acesso e senhas

- Ao cadastrar um funcionário, o RH gera um `Usuario` sem senha e um token de convite aleatório, válido por 48 h e salvo como hash. O link `/primeiro-acesso?token=...` aparece para o RH copiar.
- Senha com no mínimo 8 caracteres, sempre em BCrypt.
- O segredo do JWT vem da variável de ambiente `JWT_SECRET` (mínimo 32 caracteres) e **nunca** vai para o Git.
- Opcional: bloquear o login por 5 minutos após 5 tentativas erradas.

## 8. Endpoints REST

Todos sob `/api`, em JSON. Listas paginadas (`?page=0&size=20&sort=prazo,asc`).

### Pendências e documentos

- `GET /pendencias` — lista com filtros `status`, `tipo`, `setor`, `funcionarioId`, `atrasadas`, `comigo`, `q`. Todos (o funcionário só vê as suas).
- `GET /pendencias/{id}` — detalhe. Todos com acesso.
- `GET /pendencias/{id}/eventos` — histórico para a linha do tempo. Todos com acesso.
- `POST /pendencias` — criar e atribuir. RH, Financeiro, Contabilidade.
- `POST /solicitacoes` — funcionário envia atestado ou pedido (multipart: dados + arquivo); cria a pendência com o RH. Funcionário.
- `PATCH /pendencias/{id}/status` — aprovar, pedir correção, concluir (informa o próximo setor). Conforme `TransicaoStatus`.
- `PATCH /pendencias/{id}` — mudar responsável ou prazo. RH.
- `POST /pendencias/{id}/comentarios` — comentar no histórico. Todos com acesso.
- `POST /pendencias/{id}/documentos` — reenviar ou anexar arquivo. Funcionário dono, RH.
- `GET /documentos/{id}/arquivo` — baixar o arquivo. RH ou funcionário dono.

### Funcionários

- `GET /funcionarios` — lista com filtro por departamento e `q`. RH, Financeiro, Contabilidade, Admin.
- `POST /funcionarios` — cadastrar e gerar convite. RH, Admin.
- `GET` e `PUT /funcionarios/{id}` — ver e editar. RH, Admin.
- `GET /funcionarios/me` — meus dados. Funcionário.

### Ponto

- `POST /ponto/registrar` — registra entrada ou saída (o servidor decide qual). Funcionário.
- `GET /ponto/me?competencia=2026-10` — meu espelho do mês. Funcionário.
- `GET /ponto?competencia=2026-10&inconsistentes=true` — ponto da equipe. RH; Financeiro só vê totais.
- `PATCH /ponto/{id}` — ajuste manual com justificativa. RH.

### Folha e holerites

- `GET /folhas/{competencia}` — status, etapas e bloqueios. RH, Financeiro, Contabilidade, Admin.
- `POST /folhas/{competencia}/calcular` — gera a prévia (um `ItemFolha` por funcionário). Financeiro.
- `GET /folhas/{competencia}/itens` — linhas da folha com valores. Financeiro, Contabilidade.
- `GET /folhas/{competencia}/itens/{id}/memoria` — memória de cálculo de um funcionário. Financeiro, Contabilidade.
- `POST /folhas/{competencia}/enviar-contabilidade` — muda para `EM_CONFERENCIA` (exige zero bloqueios). Financeiro.
- `POST /folhas/{competencia}/fechar` — fecha a folha. Contabilidade.
- `POST /folhas/{competencia}/publicar-holerites` — libera os holerites. Financeiro.
- `GET /holerites/me` e `GET /holerites/me/{competencia}` — meus holerites. Funcionário.

### Outros

- `GET /empresas/minhas` — carteira de empresas com status da folha e pendências. Contabilidade.
- `GET /dashboard` — KPIs, "precisa da sua ação" e últimas atividades, conforme o papel. Todos. Para o funcionário: `solicitacoes` em andamento e `respondidas` (até 5 concluídas, da mais recente).
- `GET /notificacoes` e `PATCH /notificacoes/{id}/lida` — sino de notificações. Todos.
- `GET`, `POST` e `PUT /admin/usuarios` — usuários e setores. Admin.

## 9. Regras de negócio

Todas ficam nos services. As três mais importantes para a demo: **quem pode mudar cada status**, **gravar o histórico sempre** e **bloquear a folha enquanto houver pendência aberta**.

### Transições de status (`TransicaoStatus`)

Transição não permitida lança `RegraNegocioException` (409).

- **ABERTA → EM_ANALISE:** quem pode é o setor responsável atual; continua no mesmo setor.
- **EM_ANALISE → EM_ANALISE (aprovar e encaminhar):** só o RH; vai para CONTABILIDADE ou FINANCEIRO.
- **EM_ANALISE → CORRECAO_SOLICITADA:** setor responsável atual, com comentário obrigatório; vai para FUNCIONARIO, ou para o RH quando quem pede é a Contabilidade.
- **CORRECAO_SOLICITADA → EM_ANALISE:** automático ao reenviar o documento, por quem recebeu o pedido; volta ao setor que pediu.
- **EM_ANALISE → CONCLUIDA:** setor responsável atual.
- **Qualquer (exceto CONCLUIDA) → CANCELADA:** quem criou ou o RH, com comentário obrigatório.

Fluxo do atestado: o funcionário envia (ABERTA, com o RH) → o RH abre (EM_ANALISE) → o RH aprova e encaminha para a Contabilidade → a Contabilidade conclui (CONCLUIDA). Uma dúvida simples pode ser concluída direto pelo RH.

### Histórico e notificações

- Todo método do `PendenciaService` que altera algo grava um `PendenciaEvento` na mesma transação. Se o evento falhar, a alteração é desfeita.
- Quando o `setorResponsavel` muda, o `NotificacaoService` notifica os usuários daquele papel na empresa. Se a pendência vai para o funcionário, só ele é notificado.
- `ultimaAtualizacao` no DTO é o `atualizadoEm` da pendência, que muda a cada evento.

### Bloqueio e fechamento da folha

- **Bloqueios** = pendências da empresa na competência com `bloqueiaFolha = true` e status diferente de `CONCLUIDA` e `CANCELADA`.
- Atestados, férias e ajustes de ponto nascem com `bloqueiaFolha = true`; dúvidas, com `false`.
- `enviar-contabilidade` e `fechar` devolvem 409 com a lista das pendências bloqueantes quando houver alguma (momento mais forte da demo).
- Folha `FECHADA` não pode ser recalculada.

### Cálculo simplificado da folha

- **Horas extras:** soma, no mês, do que passar de 8 h/dia no ponto. Valor = (salário ÷ carga mensal) × 1,5 × horas.
- **Faltas:** dias úteis sem marcação não cobertos por atestado aprovado ou férias. Valor = (salário ÷ 30) × dias.
- **INSS e IRRF:** tabelas progressivas em `TabelasFiscais`, lidas do `application.yml` com as tabelas oficiais do ano.
- **Vale-transporte:** 6% do salário base.
- **Líquido:** salário + horas extras − faltas − INSS − IRRF − VT.
- Tudo em `BigDecimal`, `HALF_EVEN`, 2 casas. Cada parcela vai para `memoriaCalculo`, exibida no drawer do front.

```java
@Service
@RequiredArgsConstructor
public class CalculoFolhaService {

    private final TabelasFiscais tabelas;

    public ItemFolha calcular(Funcionario f, ResumoPonto ponto, int diasAbonados) {
        BigDecimal salario = f.getSalarioBase();
        BigDecimal valorHora = salario.divide(BigDecimal.valueOf(f.getCargaHorariaMensal()), 6, RoundingMode.HALF_EVEN);
        BigDecimal he = valorHora.multiply(new BigDecimal("1.5")).multiply(ponto.horasExtras());

        int diasFalta = Math.max(0, ponto.diasSemMarcacao() - diasAbonados);
        BigDecimal faltas = salario.divide(BigDecimal.valueOf(30), 6, RoundingMode.HALF_EVEN)
                                   .multiply(BigDecimal.valueOf(diasFalta));

        BigDecimal bruto = salario.add(he).subtract(faltas);
        BigDecimal inss = tabelas.inss(bruto);
        BigDecimal irrf = tabelas.irrf(bruto.subtract(inss));
        BigDecimal vt = salario.multiply(new BigDecimal("0.06"));

        BigDecimal liquido = bruto.subtract(inss).subtract(irrf).subtract(vt)
                                  .setScale(2, RoundingMode.HALF_EVEN);
        return ItemFolha.de(f, he, diasFalta, faltas, inss, irrf, vt, liquido);
    }
}
```

## 10. Configuração e banco

Subir o back com dois comandos: `docker compose up -d` e `./mvnw spring-boot:run`.

### docker-compose.yml

```yaml
services:
  postgres:
    image: postgres:17
    environment:
      POSTGRES_DB: folhaconecta
      POSTGRES_USER: folha
      POSTGRES_PASSWORD: folha
    ports:
      - "5432:5432"
    volumes:
      - pgdata:/var/lib/postgresql/data
volumes:
  pgdata:
```

### application.yml

```yaml
spring:
  datasource:
    url: jdbc:postgresql://localhost:5432/folhaconecta
    username: folha
    password: folha
  jpa:
    hibernate:
      ddl-auto: validate        # quem cria tabela é o Flyway
    open-in-view: false
  servlet:
    multipart:
      max-file-size: 5MB

app:
  jwt:
    secret: ${JWT_SECRET}
    access-ttl: 15m
    refresh-ttl: 7d
  cors:
    origens: http://localhost:4200
  uploads:
    pasta: ./uploads
```

- `JwtProperties` é um `record` com `@ConfigurationProperties("app.jwt")`.
- `CorsConfig` libera a origem do Angular, os métodos GET, POST, PUT, PATCH e DELETE e `allowCredentials(true)` (necessário para o cookie do refresh).

### Migrations (Flyway)

- `V1__esquema_inicial.sql`: todas as tabelas, chaves estrangeiras e índices em `empresa_id`, `status`, `prazo` e `competencia` da pendência.
- `V2__dados_demo.sql`: uma empresa principal e duas extras (carteira da Contabilidade), cerca de 8 funcionários, 10 pendências em status variados e os usuários demo (`rh@demo.com`, `financeiro@demo.com`, `contabil@demo.com`, `admin@demo.com` e um funcionário por CPF), com senhas em hash BCrypt.
- **Nunca editar uma migration que já rodou:** criar uma nova (`V3__...`).

## 11. Ordem de construção

1. Gerar o projeto, subir o PostgreSQL e criar `V1` e `EntidadeBase`.
2. Módulo `auth` completo: login, JWT, `SecurityConfig`, `UsuarioLogado` e usuários demo. Testar no Swagger.
3. `funcionario`: CRUD e convite de primeiro acesso.
4. `pendencia` + `documento`: criar, listar com filtros, mudar status, histórico e upload. Aqui o fluxo do atestado já funciona de ponta a ponta.
5. `notificacao` e `dashboard`.
6. `ponto`: registrar, espelho e ajustes.
7. `folha`: cálculo, bloqueios, envio, fechamento e holerites.
8. `empresa`: carteira da Contabilidade e troca de empresa ativa.
9. Seeds caprichados para a demo e `POST /api/demo/reset`, ativo só no perfil `dev`.

## 12. Testes que valem o tempo

- **CalculoFolhaServiceTest:** 3 ou 4 funcionários com valores conhecidos de entrada e saída.
- **TransicaoStatusTest:** cada transição permitida e cada uma proibida.
- **Integração (`@SpringBootTest` + MockMvc):** login e garantia de que um usuário da empresa A recebe 404 ao buscar uma pendência da empresa B.

## 13. Checklist antes de entregar código

- [ ] A consulta filtra por `empresaId` do usuário logado?
- [ ] O funcionário só acessa os próprios dados?
- [ ] O endpoint tem `@PreAuthorize` com os papéis corretos?
- [ ] A alteração de pendência grava `PendenciaEvento` na mesma transação?
- [ ] O controller devolve um `record` DTO, e não a entidade?
- [ ] Valores monetários usam `BigDecimal`?
- [ ] Mudanças no banco estão em uma nova migration Flyway?
- [ ] Erros passam pelo `GlobalExceptionHandler` no formato padrão?

## Fontes

- Spring Boot — System Requirements (Spring Boot 4.1.1, Java 17 a 26)
- Spring Boot — página do projeto
