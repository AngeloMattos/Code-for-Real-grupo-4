package br.com.folhaconecta.usuario;

import java.util.Optional;

import org.springframework.data.jpa.repository.JpaRepository;

public interface UsuarioRepository extends JpaRepository<Usuario, Long> {

    Optional<Usuario> findByEmailIgnoreCaseAndTipoLogin(String email, TipoLogin tipoLogin);

    Optional<Usuario> findByCpfAndTipoLogin(String cpf, TipoLogin tipoLogin);
}
