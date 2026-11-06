package kh.eco.istad.iamservice.feature.permission;

import kh.eco.istad.iamservice.domain.Permission;
import org.springframework.data.jpa.repository.JpaRepository;

public interface PermissionJpaRepository extends JpaRepository<Permission, Long> {
}