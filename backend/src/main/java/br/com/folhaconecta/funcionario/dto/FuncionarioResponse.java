package br.com.folhaconecta.funcionario.dto;
import br.com.folhaconecta.funcionario.Funcionario; import java.time.LocalDate; import java.math.BigDecimal;
public record FuncionarioResponse(Long id,Long usuarioId,String nome,String cpf,String matricula,String cargo,String departamento,BigDecimal salarioBase,int cargaHorariaMensal,LocalDate dataAdmissao,boolean ativo){
 public static FuncionarioResponse de(Funcionario funcionario,boolean salario){return new FuncionarioResponse(funcionario.getId(),funcionario.getUsuario()==null?null:funcionario.getUsuario().getId(),funcionario.getNome(),funcionario.getCpf(),funcionario.getMatricula(),funcionario.getCargo(),funcionario.getDepartamento(),salario?funcionario.getSalarioBase():null,funcionario.getCargaHorariaMensal(),funcionario.getDataAdmissao(),funcionario.isAtivo());}
}
