package kh.eco.istad.platform.business.domain.mapper;

import kh.eco.istad.platform.business.domain.dto.RegisterBusinessCommand;
import kh.eco.istad.platform.business.domain.dto.RegisterBusinessResult;
import kh.eco.istad.platform.business.domain.dto.BusinessResult;
import kh.eco.istad.platform.business.domain.entity.Business;
import kh.eco.istad.platform.business.domain.valueobject.BusinessContact;
import kh.eco.istad.platform.business.domain.valueobject.BusinessName;
import kh.eco.istad.platform.business.domain.entity.Product;
import kh.eco.istad.common.domain.valueobject.Money;
import java.util.List;
import org.springframework.stereotype.Component;

@Component
public class BusinessDataMapper {

    public Business toBusiness(RegisterBusinessCommand command) {
        return Business.builder()
                .businessName(new BusinessName(command.legalName(), command.displayName()))
                .businessContact(new BusinessContact(command.email(), command.phoneNumber()))
                .products(command.products() == null ? List.of() : command.products().stream()
                        .map(p -> new Product
                                (null, p.name(), new Money(p.price()), p.quantity(), p.quantity() > 0)).toList())
                .build();
    }

    public RegisterBusinessResult toResult(Business business, String message) {
        return new RegisterBusinessResult(
                business.getId().value(),
                business.getBusinessName().legalName(),
                business.getBusinessName().displayName(),
                business.getBusinessContact().email(),
                business.getBusinessContact().phoneNumber(), business.isActive(), message, productResults(business));
    }

    public BusinessResult toBusinessResult(Business business) {
        return new BusinessResult(business.getId().value(),
                business.getBusinessName().legalName(), business.getBusinessName().displayName(),
                business.getBusinessContact().email(), business.getBusinessContact().phoneNumber(),
                business.isActive(), business.getProducts().stream().
                map(p -> new BusinessResult.ProductResult(
                        p.getId().value(),
                        p.getName(),
                        p.getPrice().amount(),
                        p.getQuantity(),
                        p.isAvailable())).toList());
    }

    private List<RegisterBusinessResult.ProductResult> productResults(Business business) {
        return business.getProducts().
                stream().
                map(p -> new RegisterBusinessResult.ProductResult(
                        p.getId().value(),
                        p.getName(),
                        p.getPrice().amount(),
                        p.getQuantity(),
                        p.isAvailable())).toList();
    }
}
