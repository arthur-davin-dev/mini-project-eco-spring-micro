package kh.eco.istad.platform.business.domain.service;

import kh.eco.istad.platform.business.domain.entity.Business;
import kh.eco.istad.platform.business.domain.event.BusinessRegisteredEvent;
import kh.eco.istad.platform.business.domain.event.OrderApprovalEvent;

import java.util.List;

public interface BusinessDomainService {

    BusinessRegisteredEvent validateAndInitiateBusiness(Business business);

    OrderApprovalEvent validateOrder(Business business, List<String> failureMessages);
}