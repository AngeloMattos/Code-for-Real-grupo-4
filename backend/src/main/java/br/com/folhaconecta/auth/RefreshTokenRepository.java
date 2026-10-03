package br.com.folhaconecta.auth;
import java.util.*; import org.springframework.data.jpa.repository.*; import org.springframework.data.repository.query.Param;
public interface RefreshTokenRepository extends JpaRepository<RefreshToken,Long> {
 @Lock(jakarta.persistence.LockModeType.PESSIMISTIC_WRITE) Optional<RefreshToken> findByTokenHash(String tokenHash);
}
