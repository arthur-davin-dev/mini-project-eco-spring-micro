package kh.eco.istad.platform.order.client.payment;

import kh.eco.istad.common.domain.valueobject.Money;
import kh.eco.istad.platform.order.domain.exception.ExternalServiceException;
import kh.eco.istad.platform.order.domain.exception.PaymentRejectedException;
import kh.eco.istad.platform.order.domain.port.out.PaymentGateway;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.springframework.http.HttpMethod;
import org.springframework.http.MediaType;
import org.springframework.test.web.client.MockRestServiceServer;
import org.springframework.web.client.ResourceAccessException;
import org.springframework.web.client.RestClient;
import org.springframework.http.client.ClientHttpRequestFactory;

import java.io.IOException;
import java.math.BigDecimal;
import java.net.URI;
import java.util.UUID;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.junit.jupiter.api.Assertions.assertTrue;
import static org.junit.jupiter.api.Assertions.assertThrows;
import static org.springframework.test.web.client.match.MockRestRequestMatchers.content;
import static org.springframework.test.web.client.match.MockRestRequestMatchers.header;
import static org.springframework.test.web.client.match.MockRestRequestMatchers.method;
import static org.springframework.test.web.client.match.MockRestRequestMatchers.requestTo;
import static org.springframework.test.web.client.response.MockRestResponseCreators.withStatus;
import static org.springframework.test.web.client.response.MockRestResponseCreators.withSuccess;

class PaymentServiceRestAdapterTest {

    private static final UUID CUSTOMER_ID = UUID.fromString("267d73bd-3974-4b6b-a760-dcd20b4f781a");
    private static final UUID ORDER_ID = UUID.fromString("d2c7a7bb-a211-4a56-a3a5-3959f97fb31f");
    private static final UUID PAYMENT_ID = UUID.fromString("38567d87-0a37-43a6-a0a7-7301ed4e1e63");

    private MockRestServiceServer server;
    private PaymentServiceRestAdapter adapter;

    @BeforeEach
    void setUp() {
        RestClient.Builder builder = RestClient.builder().baseUrl("http://payment-service");
        server = MockRestServiceServer.bindTo(builder).build();
        adapter = new PaymentServiceRestAdapter(builder.build());
    }

    @Test
    void postsTypedPaymentContractAndReturnsPaymentRecord() {
        server.expect(requestTo("http://payment-service/api/v1/payments"))
                .andExpect(method(HttpMethod.POST))
                .andExpect(header("Idempotency-Key", ORDER_ID.toString()))
                .andExpect(content().json("""
                        {"customerId":"267d73bd-3974-4b6b-a760-dcd20b4f781a",
                         "orderId":"d2c7a7bb-a211-4a56-a3a5-3959f97fb31f","amount":10.00}
                        """))
                .andRespond(withSuccess("""
                        {"paymentId":"38567d87-0a37-43a6-a0a7-7301ed4e1e63",
                         "orderId":"d2c7a7bb-a211-4a56-a3a5-3959f97fb31f",
                         "customerId":"267d73bd-3974-4b6b-a760-dcd20b4f781a",
                         "amount":10.00,"status":"COMPLETED","createdAt":"2026-10-13T00:00:00Z"}
                        """, MediaType.APPLICATION_JSON));

        PaymentGateway.PaymentResult result = adapter.pay(CUSTOMER_ID, ORDER_ID,
                new Money(new BigDecimal("10.00")), ORDER_ID.toString());

        assertEquals(PAYMENT_ID, result.paymentId());
        assertEquals(CUSTOMER_ID, result.customerId());
        assertEquals(ORDER_ID, result.orderId());
        assertEquals(new Money(new BigDecimal("10.00")), result.amount());
        assertEquals("COMPLETED", result.status());
        server.verify();
    }

    @Test
    void mapsCreditRejectionToPaymentRejected() {
        server.expect(requestTo("http://payment-service/api/v1/payments"))
                .andRespond(withStatus(org.springframework.http.HttpStatus.UNPROCESSABLE_ENTITY)
                        .contentType(MediaType.APPLICATION_JSON)
                        .body("{\"status\":422,\"message\":\"Customer doesn't have enough credit\"}"));

        PaymentRejectedException exception = assertThrows(PaymentRejectedException.class,
                () -> adapter.pay(CUSTOMER_ID, ORDER_ID,
                        new Money(new BigDecimal("10.00")), ORDER_ID.toString()));
        assertTrue(exception.getMessage().contains("enough credit"));
    }

    @Test
    void mapsDownstreamServerFailureToUnavailable() {
        server.expect(requestTo("http://payment-service/api/v1/payments"))
                .andRespond(withStatus(org.springframework.http.HttpStatus.SERVICE_UNAVAILABLE));

        assertThrows(ExternalServiceException.class, () -> adapter.pay(CUSTOMER_ID, ORDER_ID,
                new Money(new BigDecimal("10.00")), ORDER_ID.toString()));
    }

    @Test
    void mapsTimeoutToUnavailable() {
        ClientHttpRequestFactory timeoutFactory = (URI uri, HttpMethod method) -> {
            throw new ResourceAccessException("Read timed out", new IOException("timeout"));
        };
        PaymentServiceRestAdapter timeoutAdapter = new PaymentServiceRestAdapter(
                RestClient.builder().baseUrl("http://payment-service").requestFactory(timeoutFactory).build());

        assertThrows(ExternalServiceException.class, () -> timeoutAdapter.pay(CUSTOMER_ID, ORDER_ID,
                new Money(new BigDecimal("10.00")), ORDER_ID.toString()));
    }
}
