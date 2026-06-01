package com.smartcart.order.client;

import com.smartcart.order.dto.OrderDtos.ProductResponse;
import org.springframework.cloud.openfeign.FeignClient;
import org.springframework.web.bind.annotation.*;

@FeignClient(name = "product-client", url = "${smartcart.clients.product-url}")
public interface ProductClient {
    @GetMapping("/api/products/{id}")
    ProductResponse findById(@PathVariable Long id);

    @PostMapping("/internal/products/{id}/reserve")
    ProductResponse reserve(@PathVariable Long id, @RequestParam int quantity);
}
