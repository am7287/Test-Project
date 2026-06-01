package com.smartcart.product.dto;

import jakarta.validation.constraints.*;

import java.math.BigDecimal;

public final class ProductDtos {
    private ProductDtos() {
    }

    public record ProductRequest(
            @NotBlank @Size(max = 200) String name,
            @Size(max = 500) String description,
            @NotNull @DecimalMin("0.01") @Digits(integer = 8, fraction = 2) BigDecimal price,
            @NotNull @Min(0) Integer quantity) {
    }

    public record ProductResponse(Long id, String name, String description, BigDecimal price, Integer quantity) {
    }
}
