package br.com.folhaconecta.pendencia;
import org.springframework.data.jpa.domain.Specification; import br.com.folhaconecta.usuario.Papel; import java.time.*; import java.util.Set;
public final class PendenciaSpecs {
 private PendenciaSpecs(){}
 public static Specification<Pendencia> empresa(Long id){return (raiz,consulta,construtor)->construtor.equal(raiz.get("empresa").get("id"),id);}
 public static Specification<Pendencia> funcionario(Long id){return (raiz,consulta,construtor)->construtor.equal(raiz.get("funcionario").get("id"),id);}
 public static Specification<Pendencia> status(StatusPendencia status){return (raiz,consulta,construtor)->construtor.equal(raiz.get("status"),status);}
 public static Specification<Pendencia> tipo(TipoPendencia tipo){return (raiz,consulta,construtor)->construtor.equal(raiz.get("tipo"),tipo);}
 public static Specification<Pendencia> setor(Papel setor){return (raiz,consulta,construtor)->construtor.equal(raiz.get("setorResponsavel"),setor);}
 public static Specification<Pendencia> setores(Set<Papel> setores){return (raiz,consulta,construtor)->raiz.get("setorResponsavel").in(setores);}
 public static Specification<Pendencia> atrasadas(LocalDate hoje){return (raiz,consulta,construtor)->construtor.and(construtor.lessThan(raiz.get("prazo"),hoje),construtor.not(raiz.get("status").in(StatusPendencia.CONCLUIDA,StatusPendencia.CANCELADA)));}
 public static Specification<Pendencia> busca(String q){return (raiz,consulta,construtor)->construtor.or(construtor.like(construtor.lower(raiz.get("titulo")),"%"+q.toLowerCase()+"%"),construtor.like(construtor.lower(raiz.get("funcionario").get("nome")),"%"+q.toLowerCase()+"%"));}
}
