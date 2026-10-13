package kh.eco.istad.platform.order.restapi.controller;

import kh.eco.istad.common.domain.valueobject.OrderStatus;
import kh.eco.istad.common.restapi.exception.GlobalExceptionHandler;
import kh.eco.istad.platform.order.domain.dto.CreateOrderCommand;
import kh.eco.istad.platform.order.domain.dto.CreateOrderResult;
import kh.eco.istad.platform.order.domain.usecase.CreateOrderUseCase;
import kh.eco.istad.platform.order.restapi.mapper.OrderWebMapper;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.SpringBootConfiguration;
import org.springframework.boot.autoconfigure.EnableAutoConfiguration;
import org.springframework.boot.webmvc.test.autoconfigure.WebMvcTest;
import org.springframework.context.annotation.Import;
import org.springframework.test.context.ContextConfiguration;
import org.springframework.test.context.bean.override.mockito.MockitoBean;
import org.springframework.test.web.servlet.MockMvc;

import java.util.UUID;

import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.when;
import static org.springframework.http.MediaType.APPLICATION_JSON;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.post;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.jsonPath;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

@WebMvcTest(OrderController.class)
@Import({OrderController.class, OrderWebMapper.class, GlobalExceptionHandler.class})
@ContextConfiguration(classes = OrderControllerTest.TestApplication.class)
class OrderControllerTest {

    @SpringBootConfiguration
    @EnableAutoConfiguration
    static class TestApplication {
    }

    @Autowired
    private MockMvc mockMvc;

    @MockitoBean
    private CreateOrderUseCase createOrderUseCase;

    @Test
    void createsOrderAndReturnsCreated() throws Exception {
        UUID orderId = UUID.randomUUID();
        UUID trackingId = UUID.randomUUID();
        when(createOrderUseCase.execute(any(CreateOrderCommand.class)))
                .thenReturn(new CreateOrderResult(orderId, trackingId, OrderStatus.PENDING, "Order created successfully"));

        mockMvc.perform(post("/api/orders")
                        .contentType(APPLICATION_JSON)
                        .content(validOrderJson()))
                .andExpect(status().isCreated())
                .andExpect(jsonPath("$.orderId").value(orderId.toString()))
                .andExpect(jsonPath("$.trackingId").value(trackingId.toString()))
                .andExpect(jsonPath("$.orderStatus").value("PENDING"));
    }

    @Test
    void rejectsMissingQuantityAsBadRequest() throws Exception {
        String request = validOrderJson().replace("\"quantity\": 2, ", "");

        mockMvc.perform(post("/api/orders")
                        .contentType(APPLICATION_JSON)
                        .content(request))
                .andExpect(status().isBadRequest())
                .andExpect(jsonPath("$.message").value("Validation failed"))
                .andExpect(jsonPath("$.errors['items[0].quantity']").value("quantity is required"));
    }

    private String validOrderJson() {
        return """
                {
                  "customerId": "%s",
                  "businessId": "%s",
                  "address": {"street": "St 271", "postalCode": "12000", "city": "Phnom Penh"},
                  "price": 10.00,
                  "items": [{"productId": "%s", "quantity": 2, "price": 5.00, "subTotal": 10.00}]
                }
                """.formatted(UUID.randomUUID(), UUID.randomUUID(), UUID.randomUUID());
    }
}
