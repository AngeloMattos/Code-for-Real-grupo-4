package br.com.folhaconecta.documento;
import br.com.folhaconecta.pendencia.*; import br.com.folhaconecta.auth.*; import br.com.folhaconecta.usuario.Papel; import br.com.folhaconecta.shared.exception.*;
import org.springframework.stereotype.Service; import org.springframework.beans.factory.annotation.Value;
import org.springframework.transaction.annotation.Transactional; import org.springframework.transaction.support.*;
import org.springframework.web.multipart.MultipartFile; import org.springframework.core.io.*;
import java.nio.file.*; import java.io.*; import java.util.*;
@Service
public class ArmazenamentoService {
 private final Path pasta; private final DocumentoRepository documentos; private final UsuarioLogado logado;
 public ArmazenamentoService(@Value("${app.uploads.pasta}") String pasta,DocumentoRepository documentos,UsuarioLogado logado){this.pasta=Path.of(pasta).toAbsolutePath().normalize();this.documentos=documentos;this.logado=logado;}
 public void salvar(Pendencia pendencia,MultipartFile arquivo){
  if(arquivo==null||arquivo.isEmpty()||arquivo.getSize()>5*1024*1024)throw new RegraNegocioException("Selecione um PDF ou imagem de ate 5 MB.");
  try{
   byte[] dados=arquivo.getBytes();String tipo;
   if(dados.length>=5&&new String(dados,0,5,java.nio.charset.StandardCharsets.US_ASCII).equals("%PDF-"))tipo="application/pdf";
   else if(dados.length>=8&&Arrays.equals(Arrays.copyOf(dados,8),new byte[]{(byte)137,80,78,71,13,10,26,10}))tipo="image/png";
   else if(dados.length>=3&&(dados[0]&255)==255&&(dados[1]&255)==216&&(dados[2]&255)==255)tipo="image/jpeg";
   else throw new RegraNegocioException("Formato invalido. Envie PDF, PNG ou JPEG.");
   var diretorio=pasta.resolve(pendencia.getEmpresa().getId().toString());Files.createDirectories(diretorio);var caminho=diretorio.resolve(UUID.randomUUID().toString());Files.write(caminho,dados,StandardOpenOption.CREATE_NEW);
   if(TransactionSynchronizationManager.isSynchronizationActive())TransactionSynchronizationManager.registerSynchronization(new TransactionSynchronization(){@Override public void afterCompletion(int estado){if(estado!=STATUS_COMMITTED)try{Files.deleteIfExists(caminho);}catch(IOException erro){throw new UncheckedIOException(erro);}}});
   var documento=new Documento();documento.setEmpresa(pendencia.getEmpresa());documento.setPendencia(pendencia);documento.setFuncionario(pendencia.getFuncionario());documento.setEnviadoPor(logado.usuario());documento.setNomeOriginal(Path.of(Objects.requireNonNullElse(arquivo.getOriginalFilename(),"documento")).getFileName().toString());documento.setCaminhoArquivo(pasta.relativize(caminho).toString());documento.setContentType(tipo);documento.setTamanhoBytes(dados.length);documento.setSensivel(pendencia.getTipo()==TipoPendencia.ATESTADO);documentos.save(documento);
  }catch(IOException erro){throw new RegraNegocioException("Nao foi possivel salvar o arquivo. Tente novamente.");}
 }
 public record ArquivoResponse(Resource recurso,String nome,String contentType){}
 @Transactional(readOnly=true) public ArquivoResponse abrir(Long id){
  var documento=documentos.findByIdAndEmpresaId(id,logado.empresaId()).orElseThrow(NaoEncontradoException::new);
  if(!logado.tem(Papel.RH)&&!(logado.tem(Papel.FUNCIONARIO)&&Objects.equals(logado.funcionarioId(),documento.getFuncionario().getId())))throw new AcessoNegadoException();
  var caminho=pasta.resolve(documento.getCaminhoArquivo()).normalize();if(!caminho.startsWith(pasta.resolve(logado.empresaId().toString()))||!Files.isRegularFile(caminho))throw new NaoEncontradoException();
  return new ArquivoResponse(new FileSystemResource(caminho),documento.getNomeOriginal(),documento.getContentType());
 }
}
