package kh.eco.istad.platform.business.restapi.mapper;

import kh.eco.istad.platform.business.domain.dto.RegisterBusinessCommand;
import kh.eco.istad.platform.business.domain.dto.RegisterBusinessResult;
import kh.eco.istad.platform.business.restapi.dto.RegisterBusinessRequest;
import kh.eco.istad.platform.business.restapi.dto.RegisterBusinessResponse;
import org.springframework.stereotype.Component;

@Component
public class BusinessWebMapper {

    public RegisterBusinessCommand toCommand(RegisterBusinessRequest request) {
        return new RegisterBusinessCommand(
                request.legalName(), request.displayName(), request.email(), request.phoneNumber());
    }

    public RegisterBusinessResponse toResponse(RegisterBusinessResult result) {
        return new RegisterBusinessResponse(
                result.businessId(),
                result.legalName(),
                result.displayName(),
                result.email(),
                result.phoneNumber(),
                result.active(),
                result.message());
    }
}