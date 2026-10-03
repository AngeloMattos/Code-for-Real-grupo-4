from pathlib import Path
import re,json
raiz=Path(__file__).resolve().parents[1]
java=raiz/'backend/src/main/java/br/com/folhaconecta'
def gravar(p,t):
 p=raiz/p; p.parent.mkdir(parents=True,exist_ok=True); p.write_text(t.strip()+'\n',encoding='utf-8')
def classe(p,t): gravar(Path('backend/src/main/java/br/com/folhaconecta')/p,t)
gravar('backend/pom.xml','''<project xmlns="http://maven.apache.org/POM/4.0.0" xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance" xsi:schemaLocation="http://maven.apache.org/POM/4.0.0 https://maven.apache.org/xsd/maven-4.0.0.xsd">
<modelVersion>4.0.0</modelVersion><parent><groupId>org.springframework.boot</groupId><artifactId>spring-boot-starter-parent</artifactId><version>4.1.1</version><relativePath/></parent>
<groupId>br.com.folhaconecta</groupId><artifactId>folha-conecta-api</artifactId><version>2.0.0</version><properties><java.version>17</java.version></properties><dependencies>
'''+''.join(f'<dependency><groupId>org.springframework.boot</groupId><artifactId>spring-boot-starter-{d}</artifactId></dependency>\n' for d in ['webmvc','data-jpa','security','security-oauth2-resource-server','validation','flyway'])+'''
<dependency><groupId>org.flywaydb</groupId><artifactId>flyway-database-postgresql</artifactId></dependency>
<dependency><groupId>org.postgresql</groupId><artifactId>postgresql</artifactId><scope>runtime</scope></dependency>
<dependency><groupId>org.projectlombok</groupId><artifactId>lombok</artifactId><optional>true</optional></dependency>
<dependency><groupId>org.springdoc</groupId><artifactId>springdoc-openapi-starter-webmvc-ui</artifactId><version>3.0.3</version></dependency>
<dependency><groupId>org.apache.pdfbox</groupId><artifactId>pdfbox</artifactId><version>3.0.7</version></dependency>
<dependency><groupId>org.springframework.boot</groupId><artifactId>spring-boot-starter-webmvc-test</artifactId><scope>test</scope></dependency>
<dependency><groupId>org.springframework.security</groupId><artifactId>spring-security-test</artifactId><scope>test</scope></dependency>
</dependencies><build><plugins><plugin><groupId>org.springframework.boot</groupId><artifactId>spring-boot-maven-plugin</artifactId></plugin></plugins></build></project>''')
gravar('backend/docker-compose.yml','''services:
  postgres:
    image: postgres:17
    environment:
      POSTGRES_DB: folhaconecta
      POSTGRES_USER: folha
      POSTGRES_PASSWORD: ${DB_PASSWORD:-folha}
    ports:
      - "127.0.0.1:5432:5432"
    volumes:
      - pgdata:/var/lib/postgresql/data
    healthcheck:
      test: ["CMD-SHELL", "pg_isready -U folha -d folhaconecta"]
      interval: 5s
      timeout: 5s
      retries: 10
volumes:
  pgdata:''')
gravar('backend/src/main/resources/application.yml','''server:
  port: 8080
spring:
  datasource:
    url: ${DB_URL:jdbc:postgresql://localhost:5432/folhaconecta}
    username: ${DB_USER:folha}
    password: ${DB_PASSWORD:folha}
  jpa:
    hibernate:
      ddl-auto: validate
    open-in-view: false
  servlet:
    multipart:
      max-file-size: 5MB
      max-request-size: 6MB
app:
  jwt:
    secret: ${JWT_SECRET}
    access-ttl: 15m
    refresh-ttl: 7d
  cors:
    origens: http://localhost:4200,http://localhost:5173,http://127.0.0.1:5173
  uploads:
    pasta: ./uploads
  fiscal:
    ano: 2026
    inss:
      - { limite: 1621.00, aliquota: 0.075 }
      - { limite: 2902.84, aliquota: 0.09 }
      - { limite: 4354.27, aliquota: 0.12 }
      - { limite: 8475.55, aliquota: 0.14 }
    irrf:
      - { limite: 2428.80, aliquota: 0, deducao: 0 }
      - { limite: 2826.65, aliquota: 0.075, deducao: 182.16 }
      - { limite: 3751.05, aliquota: 0.15, deducao: 394.16 }
      - { limite: 4664.68, aliquota: 0.225, deducao: 675.49 }
      - { limite: 999999999, aliquota: 0.275, deducao: 908.73 }
    isencao: 5000
    limite-reducao: 7350
    reducao-constante: 978.62
    reducao-coeficiente: 0.133145''')
gravar('backend/src/main/resources/application-dev.yml','''app:
  demo: true
  data-referencia: 2026-10-20
springdoc:
  swagger-ui:
    path: /swagger-ui.html''')
classe('FolhaConectaApplication.java','''package br.com.folhaconecta;
import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;
import org.springframework.boot.context.properties.ConfigurationPropertiesScan;
@SpringBootApplication @ConfigurationPropertiesScan
public class FolhaConectaApplication {
 public static void main(String[] argumentos) { SpringApplication.run(FolhaConectaApplication.class, argumentos); }
}''')
classe('shared/entity/EntidadeBase.java','''package br.com.folhaconecta.shared.entity;
import jakarta.persistence.*; import lombok.*; import java.time.LocalDateTime;
@MappedSuperclass @Getter @Setter
public abstract class EntidadeBase {
 @Id @GeneratedValue(strategy=GenerationType.IDENTITY) private Long id;
 @Column(nullable=false) private LocalDateTime criadoEm;
 @Column(nullable=false) private LocalDateTime atualizadoEm;
 @PrePersist protected void iniciar() { if(criadoEm==null) criadoEm=LocalDateTime.now(); if(atualizadoEm==null) atualizadoEm=criadoEm; }
 @PreUpdate protected void atualizar() { atualizadoEm=LocalDateTime.now(); }
}''')
enums={'usuario/Papel':'FUNCIONARIO,RH,FINANCEIRO,CONTABILIDADE,ADMIN','auth/TipoLogin':'FUNCIONARIO,EMPRESA','pendencia/StatusPendencia':'ABERTA,EM_ANALISE,CORRECAO_SOLICITADA,CONCLUIDA,CANCELADA','pendencia/TipoPendencia':'ATESTADO,FERIAS,ALTERACAO_CADASTRAL,DUVIDA,AJUSTE_PONTO,DOCUMENTO_SOLICITADO,CORRECAO_FOLHA','pendencia/TipoEvento':'CRIADA,STATUS_ALTERADO,ATRIBUIDA,DOCUMENTO_ENVIADO,COMENTARIO,PRAZO_ALTERADO','folha/StatusFolha':'ABERTA,PREVIA_CALCULADA,EM_CONFERENCIA,FECHADA'}
for p,v in enums.items():
 pacote,nome=p.split('/'); classe(p+'.java',f'package br.com.folhaconecta.{pacote};\npublic enum {nome} {{ {v} }}')
imports='''import jakarta.persistence.*; import lombok.*; import java.time.*; import java.math.BigDecimal; import java.util.*;
import br.com.folhaconecta.shared.entity.EntidadeBase;
import br.com.folhaconecta.empresa.Empresa; import br.com.folhaconecta.usuario.*;
import br.com.folhaconecta.auth.TipoLogin; import br.com.folhaconecta.funcionario.Funcionario;
import br.com.folhaconecta.pendencia.*; import br.com.folhaconecta.folha.*;'''
# Fields with entity types are lazy relationships. Monetary columns have an explicit scale.
modelos={
 'empresa/Empresa':[('String','razaoSocial'),('String','nomeFantasia'),('String','cnpj'),('int','diaFechamento')],
 'usuario/Usuario':[('String','nome'),('String','email'),('String','cpf'),('String','senhaHash'),('TipoLogin','tipoLogin'),('boolean','ativo'),('String','conviteHash'),('LocalDateTime','conviteExpiraEm')],
 'funcionario/Funcionario':[('Empresa','empresa'),('Usuario','usuario'),('String','nome'),('String','cpf'),('String','matricula'),('String','cargo'),('String','departamento'),('BigDecimal','salarioBase'),('int','cargaHorariaMensal'),('LocalDate','dataAdmissao'),('boolean','ativo')],
 'pendencia/Pendencia':[('Empresa','empresa'),('Funcionario','funcionario'),('Usuario','criadoPor'),('Usuario','responsavel'),('String','titulo'),('String','descricao'),('TipoPendencia','tipo'),('StatusPendencia','status'),('Papel','setorResponsavel'),('Papel','setorSolicitante'),('LocalDate','prazo'),('String','competencia'),('LocalDate','dataInicio'),('LocalDate','dataFim'),('boolean','bloqueiaFolha'),('boolean','abonado')],
 'pendencia/PendenciaEvento':[('Empresa','empresa'),('Pendencia','pendencia'),('Usuario','autor'),('TipoEvento','tipo'),('StatusPendencia','statusAnterior'),('StatusPendencia','statusNovo'),('String','comentario')],
 'documento/Documento':[('Empresa','empresa'),('Pendencia','pendencia'),('Funcionario','funcionario'),('Usuario','enviadoPor'),('String','nomeOriginal'),('String','caminhoArquivo'),('String','contentType'),('long','tamanhoBytes'),('boolean','sensivel')],
 'ponto/RegistroPonto':[('Empresa','empresa'),('Funcionario','funcionario'),('LocalDate','data'),('LocalTime','entrada'),('LocalTime','saida'),('boolean','ajustado'),('String','justificativa'),('Usuario','ajustadoPor')],
 'folha/Folha':[('Empresa','empresa'),('String','competencia'),('StatusFolha','status'),('LocalDateTime','calculadaEm'),('LocalDateTime','fechadaEm'),('Usuario','fechadaPor')],
 'folha/ItemFolha':[('Empresa','empresa'),('Folha','folha'),('Funcionario','funcionario'),('BigDecimal','salarioBase'),('BigDecimal','horasExtras'),('BigDecimal','valorHorasExtras'),('int','diasFalta'),('BigDecimal','valorFaltas'),('BigDecimal','inss'),('BigDecimal','irrf'),('BigDecimal','valeTransporte'),('BigDecimal','liquido'),('String','memoriaCalculo'),('boolean','publicado')],
 'notificacao/Notificacao':[('Empresa','empresa'),('Usuario','usuario'),('String','titulo'),('String','mensagem'),('String','link'),('boolean','lida')],
 'auth/RefreshToken':[('Empresa','empresa'),('Usuario','usuario'),('String','tokenHash'),('LocalDateTime','expiraEm'),('boolean','revogado')],
}
def snake(s): return re.sub(r'(?<!^)(?=[A-Z])','_',s).lower()
entidades={p.split('/')[1] for p in modelos}
sql=[]
for p,campos in modelos.items():
 pacote,nome=p.split('/'); tabela=snake(nome); linhas=['id bigint generated by default as identity primary key','criado_em timestamp not null default current_timestamp','atualizado_em timestamp not null default current_timestamp']; conteudo=[]
 for tipo,campo in campos:
  col=snake(campo); anotacao=''; bd=''
  if tipo in entidades:
   anotacao='@ManyToOne(fetch=FetchType.LAZY)'; col+='_id'; bd='bigint';
   if campo=='usuario' and nome=='Funcionario': anotacao='@OneToOne(fetch=FetchType.LAZY)'
  elif tipo in [x.split('/')[1] for x in enums]: anotacao='@Enumerated(EnumType.STRING)'; bd='varchar(255)'
  elif tipo=='BigDecimal': anotacao='@Column(precision=12,scale=2)'; bd='numeric(12,2)'
  elif tipo=='LocalDate': bd='date'
  elif tipo=='LocalTime': bd='time'
  elif tipo=='LocalDateTime': bd='timestamp'
  elif tipo=='boolean': bd='boolean'
  elif tipo in ('int','long'): bd='integer' if tipo=='int' else 'bigint'
  else:
   bd='text' if campo in ('descricao','comentario','memoriaCalculo','justificativa','mensagem') else 'varchar(255)'
   if bd=='text': anotacao='@Column(columnDefinition="text")'
  conteudo.append(f' {anotacao} private {tipo} {campo};')
  linhas.append(col+' '+bd+(' references '+snake(tipo)+'(id)' if tipo in entidades else '')+(' not null' if campo=='empresa' else ''))
 if nome=='Usuario':
  conteudo+=[' @ElementCollection(fetch=FetchType.EAGER) @CollectionTable(name="usuario_papel",joinColumns=@JoinColumn(name="usuario_id")) @Enumerated(EnumType.STRING) @Column(name="papel") private Set<Papel> papeis=new HashSet<>();',' @ManyToMany(fetch=FetchType.EAGER) @JoinTable(name="usuario_empresa",joinColumns=@JoinColumn(name="usuario_id"),inverseJoinColumns=@JoinColumn(name="empresa_id")) private Set<Empresa> empresas=new HashSet<>();']
  linhas+=['unique(email)','unique(cpf)']
 if nome=='Empresa': linhas+=['unique(cnpj)']
 if nome=='Folha': linhas+=['unique(empresa_id,competencia)']
 if nome=='RegistroPonto': linhas+=['unique(empresa_id,funcionario_id,data)']
 if nome=='ItemFolha': linhas+=['unique(folha_id,funcionario_id)']
 if nome=='Funcionario': linhas+=['unique(empresa_id,cpf)','unique(usuario_id)']
 if nome=='Pendencia': conteudo+=[' public boolean isAtrasada() { return status!=StatusPendencia.CONCLUIDA && status!=StatusPendencia.CANCELADA && prazo!=null && prazo.isBefore(LocalDate.now()); }']
 classe(p+'.java',f'package br.com.folhaconecta.{pacote};\n{imports}\n@Entity @Table(name="{tabela}") @Getter @Setter\npublic class {nome} extends EntidadeBase {{\n'+ '\n'.join(conteudo)+'\n}')
 sql.append(f'create table {tabela} (\n '+',\n '.join(linhas)+'\n);')
 if any(c=='empresa' for t,c in campos): sql.append(f'create index idx_{tabela}_empresa on {tabela}(empresa_id);')
sql+=['create table usuario_papel (usuario_id bigint not null references usuario(id), papel varchar(255) not null, primary key(usuario_id,papel));','create table usuario_empresa (usuario_id bigint not null references usuario(id), empresa_id bigint not null references empresa(id), primary key(usuario_id,empresa_id));','create index idx_pendencia_filtros on pendencia(empresa_id,status,prazo,competencia);','create index idx_evento_pendencia on pendencia_evento(empresa_id,pendencia_id);','create unique index idx_refresh_hash on refresh_token(token_hash);','create unique index idx_convite_hash on usuario(convite_hash) where convite_hash is not null;']
gravar('backend/src/main/resources/db/migration/V1__esquema_inicial.sql','\n'.join(sql))
