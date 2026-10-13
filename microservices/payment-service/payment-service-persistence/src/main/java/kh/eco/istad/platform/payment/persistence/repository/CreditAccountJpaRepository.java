package kh.eco.istad.platform.payment.persistence.repository;

import kh.eco.istad.platform.payment.persistence.entity.CreditAccountEntity;
import org.springframework.data.jpa.repository.*;
import org.springframework.data.repository.query.Param;
import jakarta.persistence.LockModeType;

import java.util.*;

public interface CreditAccountJpaRepository extends JpaRepository<CreditAccountEntity, UUID> {
    Optional<CreditAccountEntity> findByCustomerId(UUID customerId);

    @Lock(LockModeType.PESSIMISTIC_WRITE)
    @Query("select a from CreditAccountEntity a where a.customerId=:customerId")
    Optional<CreditAccountEntity> lockByCustomer(@Param("customerId") UUID customerId);
}
