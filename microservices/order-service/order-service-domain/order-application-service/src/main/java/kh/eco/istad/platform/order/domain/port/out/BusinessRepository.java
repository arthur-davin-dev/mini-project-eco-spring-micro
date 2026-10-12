package kh.eco.istad.platform.order.domain.port.out;

import kh.eco.istad.common.domain.valueobject.BusinessId;
import kh.eco.istad.platform.order.domain.entity.Business;

import java.util.Optional;

public interface BusinessRepository {

    Optional<Business> findBusiness(BusinessId businessId);

}