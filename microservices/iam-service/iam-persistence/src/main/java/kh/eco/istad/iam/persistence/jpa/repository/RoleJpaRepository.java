package kh.eco.istad.iam.persistence.jpa.repository;

import kh.eco.istad.iam.persistence.jpa.entity.RoleEntity;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.JpaSpecificationExecutor;

import java.util.Collection;
import java.util.List;
import java.util.Optional;
import java.util.UUID;

public interface RoleJpaRepository extends JpaRepository<RoleEntity, Long>,
        JpaSpecificationExecutor<RoleEntity> {
    Optional<RoleEntity> findByUuidAndDeletedFalse(UUID uuid);

    Optional<RoleEntity> findByNameIgnoreCaseAndDeletedFalse(String name);

    List<RoleEntity> findByUuidInAndDeletedFalse(Collection<UUID> uuids);

    boolean existsByNameIgnoreCaseAndDeletedFalse(String name);
}
