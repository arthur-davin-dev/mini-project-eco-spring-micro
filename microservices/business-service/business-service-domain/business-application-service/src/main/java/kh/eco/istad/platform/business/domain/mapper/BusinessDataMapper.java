package kh.eco.istad.platform.business.domain.mapper;

import kh.eco.istad.platform.business.domain.dto.RegisterBusinessCommand;
import kh.eco.istad.platform.business.domain.dto.RegisterBusinessResult;
import kh.eco.istad.platform.business.domain.entity.Business;
import kh.eco.istad.platform.business.domain.valueobject.BusinessContact;
import kh.eco.istad.platform.business.domain.valueobject.BusinessName;
import org.springframework.stereotype.Component;

@Component
public class BusinessDataMapper {

    public Business toBusiness(RegisterBusinessCommand command) {
        return Business.builder()
                .businessName(new BusinessName(command.legalName(), command.displayName()))
                .businessContact(new BusinessContact(command.email(), command.phoneNumber()))
                .build();
    }

    public RegisterBusinessResult toResult(Business business, String message) {
        return new RegisterBusinessResult(
                business.getId().value(),
                business.getBusinessName().legalName(),
                business.getBusinessName().displayName(),
                business.getBusinessContact().email(),
                business.getBusinessContact().phoneNumber(),
                business.isActive(),
                message);
    }
}