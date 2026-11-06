package kh.eco.istad.iamservice.feature.role;

import kh.eco.istad.iamservice.domain.Role;

import org.springframework.data.jpa.repository.JpaRepository;

public interface RoleJpaRepository extends JpaRepository<Role, Long> {
}
