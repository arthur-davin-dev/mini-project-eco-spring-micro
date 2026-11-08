package kh.eco.istad.iam.persistence.jpa.repository;

import kh.eco.istad.iam.persistence.jpa.entity.RolePermissionEntity;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;
import java.util.Optional;

public interface RolePermissionJpaRepository extends JpaRepository<RolePermissionEntity, Long> {
    List<RolePermissionEntity> findByRoleId(Long roleId);

    Optional<RolePermissionEntity> findFirstByRoleIdAndPermissionIdOrderByIdDesc(Long roleId, Long permissionId);
}
