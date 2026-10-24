package kh.eco.istad.platform.order.client.business;

import kh.eco.istad.common.domain.valueobject.BusinessId;
import kh.eco.istad.common.domain.valueobject.Money;
import kh.eco.istad.platform.order.domain.entity.Business;
import kh.eco.istad.platform.order.domain.entity.Product;
import kh.eco.istad.platform.order.domain.exception.ExternalServiceException;
import kh.eco.istad.platform.order.domain.port.out.BusinessRepository;
import kh.eco.istad.platform.order.domain.valueobject.ProductId;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Qualifier;
import org.springframework.stereotype.Component;
import org.springframework.web.client.HttpClientErrorException;
import org.springframework.web.client.RestClient;
import org.springframework.web.client.RestClientException;

import java.util.Optional;

@Component
public class BusinessServiceRestAdapter implements BusinessRepository {

    private static final Logger log = LoggerFactory.getLogger(
            BusinessServiceRestAdapter.class
    );
    private final RestClient restClient;

    public BusinessServiceRestAdapter(
            @Qualifier("businessRestClient")
            RestClient restClient
    ){
        this.restClient = restClient;
    }

    @Override
    public Optional<Business> findBusiness(BusinessId businessId) {
        try {
            BusinessServicePayload payload = restClient.get().uri("/api/businesses/{id}", businessId.value())
                    .retrieve().body(BusinessServicePayload.class);
            if (payload == null)
                return Optional.empty();
            return Optional.of(new Business(businessId,payload.products()
                    .stream()
                    .filter(BusinessServicePayload.ProductPayload::available)
                    .map(p->new Product(
                            new ProductId(p.productId()),
                            p.name(),
                            new Money(p.price()))).toList(),
                    payload.active()));
        }catch (HttpClientErrorException.NotFound ex){
            return Optional.empty();
        }catch (RestClientException | IllegalStateException ex){
            // IllegalStateException: Spring Cloud LoadBalancer found no instance of the service in Eureka
            log.error("Call to business-service failed", ex);
            throw new ExternalServiceException(
                    "Business is unavailable", ex
            );
        }
    }

}
