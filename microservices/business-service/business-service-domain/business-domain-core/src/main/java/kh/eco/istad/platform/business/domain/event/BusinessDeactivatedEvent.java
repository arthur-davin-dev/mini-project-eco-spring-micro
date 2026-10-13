package kh.eco.istad.platform.business.domain.event;

import kh.eco.istad.common.domain.event.DomainEvent;
import kh.eco.istad.platform.business.domain.entity.Business;

import java.time.ZonedDateTime;

public record BusinessDeactivatedEvent(
        Business business,
        ZonedDateTime deactivatedAt
)
        implements DomainEvent<Business> { }
