package kh.eco.istad.platform.business.domain.event;

import kh.eco.istad.common.domain.event.DomainEvent;
import kh.eco.istad.common.domain.valueobject.BusinessId;
import kh.eco.istad.platform.business.domain.entity.OrderApproval;

import java.time.ZonedDateTime;
import java.util.List;

public sealed interface OrderApprovalEvent extends DomainEvent<OrderApproval>
        permits OrderApprovedEvent, OrderRejectedEvent {

    OrderApproval orderApproval();

    BusinessId businessId();

    List<String> failureMessages();

    ZonedDateTime createdAt();
}