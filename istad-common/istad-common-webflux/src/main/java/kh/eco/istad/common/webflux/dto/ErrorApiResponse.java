package kh.eco.istad.common.webflux.dto;

import java.util.Map;

public record ErrorApiResponse(
        String message,
        Integer status,
        Map<String,Object> details
) {
}
