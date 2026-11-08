package kh.eco.istad.iam.persistence.jpa.repository;

import kh.eco.istad.iam.persistence.jpa.entity.IdentityEntity;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;
import java.util.Optional;
import java.util.UUID;
import java.util.UUID;

public interface IdentityJpaRepository extends JpaRepository<IdentityEntity, Long> {
    Optional<IdentityEntity> findByUuid(UUID uuid);

    Optional<IdentityEntity> findByProviderAndProviderSubjectAndDeletedFalse(String provider, String subject);

    List<IdentityEntity> findByUserIdOrderById(Long userId);
}
