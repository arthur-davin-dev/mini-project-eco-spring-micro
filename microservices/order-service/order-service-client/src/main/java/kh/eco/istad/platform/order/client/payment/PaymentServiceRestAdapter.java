package kh.eco.istad.platform.order.client.payment;

import kh.eco.istad.common.domain.valueobject.Money;
import kh.eco.istad.platform.order.domain.exception.ExternalServiceException;
import kh.eco.istad.platform.order.domain.exception.PaymentRejectedException;
import kh.eco.istad.platform.order.domain.port.out.PaymentGateway;
import org.springframework.beans.factory.annotation.Qualifier;
import org.springframework.stereotype.Component;
import org.springframework.web.client.RestClient;
import org.springframework.web.client.RestClientException;

import java.math.BigDecimal;
import java.nio.charset.StandardCharsets;
import java.time.Instant;
import java.util.UUID;
import java.util.regex.Matcher;
import java.util.regex.Pattern;

@Component
public class PaymentServiceRestAdapter implements PaymentGateway {

    private static final Pattern ERROR_MESSAGE = Pattern.compile("\"message\"\\s*:\\s*\"([^\"]*)\"");

    private final RestClient restClient;

    public PaymentServiceRestAdapter(@Qualifier("paymentRestClient") RestClient restClient) {
        this.restClient = restClient;
    }

    @Override
    public PaymentResult pay(UUID customerId, UUID orderId, Money amount, String idempotencyKey) {
        try {
            PaymentPayload payload = restClient.post()
                    .uri("/api/v1/payments")
                    .header("Idempotency-Key", idempotencyKey)
                    .body(new InitiatePaymentRequest(customerId, orderId, amount.amount()))
                    .retrieve()
                    .onStatus(status -> status.is4xxClientError(),
                            (request, response) -> {
                                String fallback = "Payment service rejected the payment (HTTP "
                                        + response.getStatusCode().value() + ")";
                                String body = new String(response.getBody().readAllBytes(), StandardCharsets.UTF_8);
                                Matcher matcher = ERROR_MESSAGE.matcher(body);
                                throw new PaymentRejectedException(matcher.find() ? matcher.group(1) : fallback);
                            })
                    .body(PaymentPayload.class);

            if (payload == null) {
                throw new ExternalServiceException("Payment service returned an empty response");
            }
            return new PaymentResult(payload.paymentId(), payload.customerId(), payload.orderId(),
                    new Money(payload.amount()), payload.status());
        } catch (PaymentRejectedException ex) {
            throw ex;
        } catch (ExternalServiceException ex) {
            throw ex;
        } catch (RestClientException ex) {
            throw new ExternalServiceException("Payment service is unavailable", ex);
        }
    }

    private record InitiatePaymentRequest(UUID customerId, UUID orderId, BigDecimal amount) {
    }

    private record PaymentPayload(UUID paymentId, UUID orderId, UUID customerId, BigDecimal amount,
                                  String status, Instant createdAt) {
    }
}
