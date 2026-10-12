package kh.eco.istad.platform.business.domain.event;

import kh.eco.istad.common.domain.event.DomainEvent;
import kh.eco.istad.platform.business.domain.entity.Business;

import java.time.ZonedDateTime;

public record BusinessRegisteredEvent(Business business, ZonedDateTime createdAt)
        implements DomainEvent<Business> {
}