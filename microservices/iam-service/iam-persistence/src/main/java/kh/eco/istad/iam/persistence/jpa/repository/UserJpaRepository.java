package kh.eco.istad.iam.persistence.jpa.repository;

import kh.eco.istad.iam.persistence.jpa.entity.UserEntity;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.JpaSpecificationExecutor;

import java.util.Optional;
import java.util.UUID;

public interface UserJpaRepository extends JpaRepository<UserEntity, Long>,
        JpaSpecificationExecutor<UserEntity> {
    Optional<UserEntity> findByUuidAndDeletedFalse(UUID uuid);

    Optional<UserEntity> findByUsernameIgnoreCaseAndDeletedFalseOrEmailIgnoreCaseAndDeletedFalse(
            String username, String email);

    boolean existsByUsernameIgnoreCaseAndDeletedFalse(String username);

    boolean existsByEmailIgnoreCaseAndDeletedFalse(String email);

    boolean existsByPhoneNumber(String phoneNumber);

    boolean existsByPhoneNumberAndUuidNot(String phoneNumber, UUID userUuid);
}
