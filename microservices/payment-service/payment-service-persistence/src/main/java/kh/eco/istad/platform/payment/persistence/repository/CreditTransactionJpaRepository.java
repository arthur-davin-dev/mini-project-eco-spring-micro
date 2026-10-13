package kh.eco.istad.platform.payment.persistence.repository;

import kh.eco.istad.platform.payment.persistence.entity.CreditTransactionEntity;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.*;

public interface CreditTransactionJpaRepository extends JpaRepository<CreditTransactionEntity, UUID> {
    Optional<CreditTransactionEntity> findByOperationId(UUID operationId);

    List<CreditTransactionEntity> findAllByCustomerIdOrderByCreatedAtDesc(UUID customerId);
}
