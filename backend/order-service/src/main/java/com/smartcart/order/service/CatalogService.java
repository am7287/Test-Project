package com.smartcart.order.service;

import com.smartcart.order.client.ProductClient;
import com.smartcart.order.dto.OrderDtos.ProductResponse;
import com.smartcart.order.exception.ApiException;
import io.github.resilience4j.circuitbreaker.annotation.CircuitBreaker;
import io.github.resilience4j.retry.annotation.Retry;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;

@Service
public class CatalogService {
    private final ProductClient productClient;

    public CatalogService(ProductClient productClient) {
        this.productClient = productClient;
    }

    @Retry(name = "productService", fallbackMethod = "unavailable")
    @CircuitBreaker(name = "productService", fallbackMethod = "unavailable")
    public ProductResponse product(Long id) {
        return productClient.findById(id);
    }

    @Retry(name = "productService", fallbackMethod = "unavailableReserve")
    @CircuitBreaker(name = "productService", fallbackMethod = "unavailableReserve")
    public ProductResponse reserve(Long id, int quantity) {
        return productClient.reserve(id, quantity);
    }

    private ProductResponse unavailable(Long id, Throwable cause) {
        throw new ApiException(HttpStatus.SERVICE_UNAVAILABLE, "Product service is temporarily unavailable");
    }

    private ProductResponse unavailableReserve(Long id, int quantity, Throwable cause) {
        throw new ApiException(HttpStatus.SERVICE_UNAVAILABLE, "Unable to reserve product stock at this time");
    }
}
