package com.smartcart.order.dto;

import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.NotNull;

import java.math.BigDecimal;

public final class OrderDtos {
    private OrderDtos() {
    }

    public record CreateOrderRequest(@NotNull Long productId, @NotNull @Min(1) Integer quantity) {
    }

    public record OrderResponse(Long id, Long userId, Long productId, Integer quantity, BigDecimal totalAmount) {
    }

    public record UserResponse(Long id, String username, String role) {
    }

    public record ProductResponse(Long id, String name, String description, BigDecimal price, Integer quantity) {
    }
}
