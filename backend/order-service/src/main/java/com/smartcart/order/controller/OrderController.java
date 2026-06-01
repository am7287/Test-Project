package com.smartcart.order.controller;

import com.smartcart.order.dto.OrderDtos.*;
import com.smartcart.order.service.OrderService;
import jakarta.validation.Valid;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/orders")
public class OrderController {
    private final OrderService service;

    public OrderController(OrderService service) {
        this.service = service;
    }

    @PostMapping
    ResponseEntity<OrderResponse> create(@RequestHeader("X-Authenticated-User") String username,
                                         @Valid @RequestBody CreateOrderRequest request) {
        return ResponseEntity.status(HttpStatus.CREATED).body(service.create(username, request));
    }

    @GetMapping("/history")
    List<OrderResponse> history(@RequestHeader("X-Authenticated-User") String username) {
        return service.history(username);
    }

    @GetMapping
    List<OrderResponse> allOrders() {
        return service.allOrders();
    }
}
