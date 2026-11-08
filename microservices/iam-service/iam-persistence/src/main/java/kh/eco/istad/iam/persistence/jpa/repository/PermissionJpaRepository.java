package kh.eco.istad.iam.persistence.jpa.repository;

import kh.eco.istad.iam.persistence.jpa.entity.PermissionEntity;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.JpaSpecificationExecutor;

import java.util.Collection;
import java.util.List;
import java.util.Optional;
import java.util.UUID;

public interface PermissionJpaRepository extends JpaRepository<PermissionEntity, Long>,
        JpaSpecificationExecutor<PermissionEntity> {
    Optional<PermissionEntity> findByUuidAndDeletedFalse(UUID uuid);

    Optional<PermissionEntity> findByResourceIgnoreCaseAndActionIgnoreCaseAndDeletedFalse(
            String resource, String action);

    List<PermissionEntity> findByUuidInAndDeletedFalse(Collection<UUID> uuids);

    boolean existsByResourceIgnoreCaseAndActionIgnoreCaseAndDeletedFalse(String resource, String action);
}
