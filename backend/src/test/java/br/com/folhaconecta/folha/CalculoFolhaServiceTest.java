package br.com.folhaconecta.folha;
import br.com.folhaconecta.funcionario.Funcionario; import br.com.folhaconecta.ponto.dto.ResumoPonto;
import org.junit.jupiter.api.Test; import org.springframework.beans.factory.annotation.Autowired; import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.boot.webmvc.test.autoconfigure.AutoConfigureMockMvc; import org.springframework.test.context.ActiveProfiles;
import java.math.BigDecimal; import java.util.*; import static org.junit.jupiter.api.Assertions.*;
@SpringBootTest @AutoConfigureMockMvc @ActiveProfiles("dev")
class CalculoFolhaServiceTest {
 @Autowired CalculoFolhaService calculo;
 private ItemFolha salario(String valor){var funcionario=new Funcionario();funcionario.setSalarioBase(new BigDecimal(valor));funcionario.setCargaHorariaMensal(220);return calculo.calcular(funcionario,new ResumoPonto(BigDecimal.ZERO,0,List.of(),List.of()),Set.of());}
 @Test void salarioMinimoSemExtrasNemFaltas(){var item=salario("1621.00");assertEquals(new BigDecimal("121.58"),item.getInss());assertEquals(new BigDecimal("97.26"),item.getValeTransporte());assertEquals(new BigDecimal("1402.16"),item.getLiquido());}
 @Test void rendaCincoMilComIsencao2026(){var item=salario("5000.00");assertEquals(new BigDecimal("501.51"),item.getInss());assertEquals(new BigDecimal("0.00"),item.getIrrf());assertEquals(new BigDecimal("4198.49"),item.getLiquido());}
 @Test void rendaAcimaTetoPrevidenciario(){var item=salario("10000.00");assertEquals(new BigDecimal("988.09"),item.getInss());assertEquals(new BigDecimal("1569.55"),item.getIrrf());assertEquals(new BigDecimal("6842.36"),item.getLiquido());}
}
