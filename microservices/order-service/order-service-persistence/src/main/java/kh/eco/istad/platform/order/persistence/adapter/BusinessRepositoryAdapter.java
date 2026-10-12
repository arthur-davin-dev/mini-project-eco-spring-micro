package kh.eco.istad.platform.order.persistence.adapter;

import kh.eco.istad.common.domain.valueobject.BusinessId;
import kh.eco.istad.platform.order.domain.entity.Business;
import kh.eco.istad.platform.order.domain.port.out.BusinessRepository;
import kh.eco.istad.platform.order.persistence.mapper.OrderPersistenceMapper;
import kh.eco.istad.platform.order.persistence.repository.BusinessJpaRepository;
import org.springframework.stereotype.Component;

import java.util.Optional;

@Component
public class BusinessRepositoryAdapter implements BusinessRepository {

    private final BusinessJpaRepository businessJpaRepository;
    private final OrderPersistenceMapper mapper;

    public BusinessRepositoryAdapter(BusinessJpaRepository businessJpaRepository, OrderPersistenceMapper mapper) {
        this.businessJpaRepository = businessJpaRepository;
        this.mapper = mapper;
    }

    @Override
    public Optional<Business> findBusiness(BusinessId businessId) {
        return businessJpaRepository.findByIdWithProducts(businessId.value())
                .map(entity -> mapper.toDomain(entity));
    }
}