package kh.eco.istad.platform.business.domain.service;

import kh.eco.istad.platform.business.domain.entity.Business;
import kh.eco.istad.platform.business.domain.event.BusinessRegisteredEvent;
import kh.eco.istad.platform.business.domain.event.OrderApprovalEvent;
import kh.eco.istad.platform.business.domain.event.OrderApprovedEvent;
import kh.eco.istad.platform.business.domain.event.OrderRejectedEvent;
import kh.eco.istad.platform.business.domain.event.BusinessDeactivatedEvent;
import kh.eco.istad.platform.business.domain.valueobject.OrderApprovalStatus;

import java.time.ZoneId;
import java.time.ZonedDateTime;
import java.util.List;

public class BusinessDomainServiceImpl implements BusinessDomainService {

    private static final ZoneId UTC = ZoneId.of("UTC");

//    @Override
//    public BusinessRegisteredEvent validateAndInitiateBusiness(Business business) {
//        business.validateBusiness();
//        business.initializeBusiness();
//        return new BusinessRegisteredEvent(business, ZonedDateTime.now(UTC));
//    }

    @Override
    public BusinessRegisteredEvent validateAndInitiateBusiness(Business business) {
        business.validateBusiness();
        business.initializeBusiness();
        return new BusinessRegisteredEvent(business,ZonedDateTime.now(UTC));
    }

    @Override
    public OrderApprovalEvent validateOrder(Business business, List<String> failureMessages) {

        business.validateOrder(failureMessages);
        if (failureMessages.isEmpty()){
            business.constructOrderApproval(OrderApprovalStatus.APPROVED);
            return new OrderApprovedEvent(
                    business.getOrderApproval(),business.getId(),failureMessages,ZonedDateTime.now(UTC)
            );
        }

        business.constructOrderApproval(OrderApprovalStatus.REJECTED);
        return new OrderRejectedEvent(
                business.getOrderApproval(),business.getId(),failureMessages,ZonedDateTime.now(UTC)
        );
    }

//    @Override
//    public OrderApprovalEvent validateOrder(Business business, List<String> failureMessages) {
//        business.validateOrder(failureMessages);
//
//        if (failureMessages.isEmpty()) {
//            business.constructOrderApproval(OrderApprovalStatus.APPROVED);
//            return new OrderApprovedEvent(
//                    business.getOrderApproval(), business.getId(), failureMessages, ZonedDateTime.now(UTC));
//        }
//
//        business.constructOrderApproval(OrderApprovalStatus.REJECTED);
//        return new OrderRejectedEvent(
//                business.getOrderApproval(), business.getId(), failureMessages, ZonedDateTime.now(UTC));
//    }

    @Override
    public BusinessDeactivatedEvent deactivateBusiness(Business business) {
        business.deactivate();
        return new BusinessDeactivatedEvent(business, ZonedDateTime.now(UTC));
    }
}
