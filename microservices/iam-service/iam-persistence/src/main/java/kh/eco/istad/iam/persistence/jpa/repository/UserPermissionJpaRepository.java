package kh.eco.istad.iam.persistence.jpa.repository;

import kh.eco.istad.iam.persistence.jpa.entity.UserPermissionEntity;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;
import java.util.Optional;

public interface UserPermissionJpaRepository extends JpaRepository<UserPermissionEntity, Long> {
    List<UserPermissionEntity> findByUserId(Long userId);

    Optional<UserPermissionEntity> findFirstByUserIdAndPermissionIdOrderByIdDesc(Long userId, Long permissionId);
}
