package br.com.folhaconecta.folha;
import br.com.folhaconecta.shared.exception.RegraNegocioException; import org.springframework.stereotype.Service; import lombok.RequiredArgsConstructor;
import org.apache.pdfbox.pdmodel.*; import org.apache.pdfbox.pdmodel.font.*; import java.io.*;
@Service @RequiredArgsConstructor
public class HoleritePdfService {
 private final FolhaService folhas;
 public byte[] gerar(String competencia){var item=folhas.meuHolerite(competencia);try(var documento=new PDDocument();var saida=new ByteArrayOutputStream()){
  var pagina=new PDPage();documento.addPage(pagina);try(var conteudo=new PDPageContentStream(documento,pagina)){conteudo.beginText();conteudo.setFont(new PDType1Font(Standard14Fonts.FontName.HELVETICA),12);conteudo.newLineAtOffset(50,740);
   for(String linha:new String[]{"Folha Conecta - Holerite "+competencia,item.funcionarioNome(),"Salario base: R$ "+item.salarioBase(),"Horas extras: R$ "+item.valorHorasExtras(),"Faltas: R$ "+item.valorFaltas(),"INSS: R$ "+item.inss(),"IRRF: R$ "+item.irrf(),"Vale-transporte: R$ "+item.valeTransporte(),"Liquido: R$ "+item.liquido(),"Demonstracao com dados ficticios. Calculo simplificado."}){conteudo.showText(linha);conteudo.newLineAtOffset(0,-28);}conteudo.endText();}documento.save(saida);return saida.toByteArray();
 }catch(IOException erro){throw new RegraNegocioException("Nao foi possivel gerar o PDF.");}}
}
