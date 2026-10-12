package kh.eco.istad.platform.business.domain.valueobject;

import kh.eco.istad.platform.business.domain.exception.BusinessDomainException;

public record BusinessName(
        String legalName,
        String displayName
) {
    public BusinessName{
        if (legalName == null || legalName.isBlank()){
            throw new BusinessDomainException("Legal name must not be blank");
        }
        if (displayName == null || displayName.isBlank()){
            throw new BusinessDomainException("Display name must not be blank");
        }
        legalName = legalName.trim();
        displayName = displayName.trim();
    }
}
