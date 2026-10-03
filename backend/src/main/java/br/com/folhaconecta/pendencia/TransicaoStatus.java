package br.com.folhaconecta.pendencia;
import br.com.folhaconecta.pendencia.dto.MudarStatusRequest; import br.com.folhaconecta.usuario.Papel; import br.com.folhaconecta.shared.exception.RegraNegocioException; import java.util.*;
public final class TransicaoStatus {
 private TransicaoStatus(){}
 public static void validar(Pendencia pendencia,MudarStatusRequest entrada,Set<Papel> papeis,Long autor){
  var anterior=pendencia.getStatus();var novo=entrada.novoStatus();var destino=entrada.proximoSetor();boolean dono=papeis.contains(pendencia.getSetorResponsavel());boolean comentario=entrada.comentario()!=null&&!entrada.comentario().isBlank();boolean valido=false;
  if(novo==StatusPendencia.CANCELADA&&anterior!=StatusPendencia.CONCLUIDA&&anterior!=StatusPendencia.CANCELADA)valido=comentario&&(papeis.contains(Papel.RH)||Objects.equals(pendencia.getCriadoPor().getId(),autor));
  if(anterior==StatusPendencia.ABERTA&&novo==StatusPendencia.EM_ANALISE)valido=dono&&destino==pendencia.getSetorResponsavel()&&!papeis.contains(Papel.FUNCIONARIO);
  if(anterior==StatusPendencia.EM_ANALISE&&novo==StatusPendencia.EM_ANALISE)valido=dono&&pendencia.getSetorResponsavel()==Papel.RH&&papeis.contains(Papel.RH)&&(destino==Papel.CONTABILIDADE||destino==Papel.FINANCEIRO);
  if(anterior==StatusPendencia.EM_ANALISE&&novo==StatusPendencia.CORRECAO_SOLICITADA)valido=dono&&comentario&&(pendencia.getSetorResponsavel()==Papel.CONTABILIDADE?destino==Papel.RH:destino==Papel.FUNCIONARIO);
  if(anterior==StatusPendencia.EM_ANALISE&&novo==StatusPendencia.CONCLUIDA)valido=dono&&destino==pendencia.getSetorResponsavel()&&!papeis.contains(Papel.FUNCIONARIO);
  if(!valido)throw new RegraNegocioException("Transicao nao permitida para seu setor. Confira o status, destino e comentario.");
 }
 public static void validarReenvio(Pendencia pendencia,Set<Papel> papeis){if(pendencia.getStatus()!=StatusPendencia.CORRECAO_SOLICITADA||!papeis.contains(pendencia.getSetorResponsavel())||pendencia.getSetorSolicitante()==null)throw new RegraNegocioException("Nao ha uma correcao aguardando seu reenvio.");}
}
