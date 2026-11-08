package kh.eco.istad.platform.order.persistence.repository;

import kh.eco.istad.platform.order.persistence.entity.BusinessEntity;
import kh.eco.istad.platform.order.persistence.entity.BusinessEntityId;
import org.springframework.data.r2dbc.repository.R2dbcRepository;

public interface BusinessReactiveRepository extends R2dbcRepository<BusinessEntity, BusinessEntityId> {
}
