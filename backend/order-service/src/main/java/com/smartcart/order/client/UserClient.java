package com.smartcart.order.client;

import com.smartcart.order.dto.OrderDtos.UserResponse;
import org.springframework.cloud.openfeign.FeignClient;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;

@FeignClient(name = "user-client", url = "${smartcart.clients.user-url}")
public interface UserClient {
    @GetMapping("/api/users/by-username/{username}")
    UserResponse findByUsername(@PathVariable String username);
}
