package com.smartcart.order.service;

import com.smartcart.order.client.UserClient;
import com.smartcart.order.dto.OrderDtos.*;
import com.smartcart.order.entity.Order;
import com.smartcart.order.repository.OrderRepository;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;

@Service
public class OrderService {
    private static final Logger log = LoggerFactory.getLogger(OrderService.class);
    private final OrderRepository repository;
    private final UserClient userClient;
    private final CatalogService catalogService;

    public OrderService(OrderRepository repository, UserClient userClient, CatalogService catalogService) {
        this.repository = repository;
        this.userClient = userClient;
        this.catalogService = catalogService;
    }

    @Transactional
    public OrderResponse create(String username, CreateOrderRequest request) {
        UserResponse user = userClient.findByUsername(username);
        ProductResponse product = catalogService.product(request.productId());
        catalogService.reserve(product.id(), request.quantity());
        Order order = repository.save(new Order(user.id(), product.id(), request.quantity(),
                product.price().multiply(java.math.BigDecimal.valueOf(request.quantity()))));
        log.info("Placed order {} for user {}", order.getId(), username);
        return response(order);
    }

    public List<OrderResponse> history(String username) {
        Long userId = userClient.findByUsername(username).id();
        return repository.findByUserIdOrderByIdDesc(userId).stream().map(this::response).toList();
    }

    public List<OrderResponse> allOrders() {
        return repository.findAllByOrderByIdDesc().stream().map(this::response).toList();
    }

    private OrderResponse response(Order order) {
        return new OrderResponse(order.getId(), order.getUserId(), order.getProductId(),
                order.getQuantity(), order.getTotalAmount());
    }
}
