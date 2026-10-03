package br.com.folhaconecta.notificacao;
import br.com.folhaconecta.usuario.*; import br.com.folhaconecta.empresa.Empresa; import br.com.folhaconecta.pendencia.Pendencia;
import br.com.folhaconecta.auth.UsuarioLogado; import br.com.folhaconecta.shared.exception.*;
import org.springframework.stereotype.Service; import org.springframework.transaction.annotation.Transactional; import java.util.*; import java.time.*; import lombok.RequiredArgsConstructor;
@Service @RequiredArgsConstructor
public class NotificacaoService {
 private final UsuarioRepository usuarios; private final NotificacaoRepository notificacoes; private final UsuarioLogado logado;
 public record NotificacaoResponse(Long id,String titulo,String mensagem,String link,boolean lida,LocalDateTime criadoEm){}
 public void avisarSetor(Empresa empresa,Papel papel,Pendencia pendencia){
  for(var usuario:usuarios.daEmpresa(empresa.getId()))if(usuario.isAtivo()&&usuario.getPapeis().contains(papel)&&
   (papel!=Papel.FUNCIONARIO||pendencia.getFuncionario().getUsuario()!=null&&usuario.getId().equals(pendencia.getFuncionario().getUsuario().getId())))
    criar(empresa,usuario,"Pendencia com voce",pendencia.getTitulo(),"/pendencias?pendencia="+pendencia.getId());
 }
 public void avisarRecuperacao(Empresa empresa,Usuario solicitante){for(var usuario:usuarios.daEmpresa(empresa.getId()))if(usuario.getPapeis().contains(Papel.ADMIN))criar(empresa,usuario,"Redefinicao de senha",solicitante.getNome()+" solicitou recuperar o acesso.","/admin/usuarios");}
 private void criar(Empresa empresa,Usuario usuario,String titulo,String mensagem,String link){var notificacao=new Notificacao();notificacao.setEmpresa(empresa);notificacao.setUsuario(usuario);notificacao.setTitulo(titulo);notificacao.setMensagem(mensagem);notificacao.setLink(link);notificacoes.save(notificacao);}
 @Transactional(readOnly=true) public List<NotificacaoResponse> listar(){return notificacoes.findByUsuarioIdAndEmpresaIdOrderByCriadoEmDesc(logado.id(),logado.empresaId()).stream().map(n->new NotificacaoResponse(n.getId(),n.getTitulo(),n.getMensagem(),n.getLink(),n.isLida(),n.getCriadoEm())).toList();}
 @Transactional public void marcarLida(Long id){notificacoes.findByIdAndUsuarioIdAndEmpresaId(id,logado.id(),logado.empresaId()).orElseThrow(NaoEncontradoException::new).setLida(true);}
}
