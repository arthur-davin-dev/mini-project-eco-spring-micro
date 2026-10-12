package kh.eco.istad.platform.order.persistence.repository;

import kh.eco.istad.platform.order.persistence.entity.BusinessEntity;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.util.Optional;
import java.util.UUID;

public interface BusinessJpaRepository extends JpaRepository<BusinessEntity, UUID> {

    @Query("select b from BusinessEntity b left join fetch b.products where b.id = :id")
    Optional<BusinessEntity> findByIdWithProducts(@Param("id") UUID id);
}