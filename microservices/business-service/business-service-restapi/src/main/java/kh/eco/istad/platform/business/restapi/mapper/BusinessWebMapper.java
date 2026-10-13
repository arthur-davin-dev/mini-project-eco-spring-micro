package kh.eco.istad.platform.business.restapi.mapper;

import kh.eco.istad.platform.business.domain.dto.RegisterBusinessCommand;
import kh.eco.istad.platform.business.domain.dto.RegisterBusinessResult;
import kh.eco.istad.platform.business.domain.dto.BusinessResult;
import kh.eco.istad.platform.business.domain.dto.RegisterBusinessCommand.ProductCommand;
import kh.eco.istad.platform.business.restapi.dto.RegisterBusinessRequest;
import kh.eco.istad.platform.business.restapi.dto.RegisterBusinessResponse;
import kh.eco.istad.platform.business.restapi.dto.BusinessResponse;
import org.springframework.stereotype.Component;

@Component
public class BusinessWebMapper {

    public RegisterBusinessCommand toCommand(RegisterBusinessRequest request) {
        return new RegisterBusinessCommand(
                request.legalName(), request.displayName(), request.email(), request.phoneNumber(),
                request.products() == null ? null : request.products().stream()
                        .map(p -> new ProductCommand(p.name(), p.price(), p.quantity())).toList());
    }

    public RegisterBusinessResponse toResponse(RegisterBusinessResult result) {
        return new RegisterBusinessResponse(
                result.businessId(),
                result.legalName(),
                result.displayName(),
                result.email(),
                result.phoneNumber(),
                result.active(),
                result.message(), result.products().stream().map(p -> new RegisterBusinessResponse.ProductResponse(
                        p.productId(), p.name(), p.price(), p.quantity(), p.available())).toList());
    }

    public BusinessResponse toResponse(BusinessResult result) {
        return new BusinessResponse(result.businessId(), result.legalName(), result.displayName(), result.email(),
                result.phoneNumber(), result.active(), result.products().stream().map(p ->
                new BusinessResponse.ProductResponse(p.productId(), p.name(), p.price(), p.quantity(), p.available())).toList());
    }
}
