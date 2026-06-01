package com.smartcart.product.controller;

import com.smartcart.product.dto.ProductDtos.*;
import com.smartcart.product.service.ProductService;
import jakarta.validation.Valid;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
public class ProductController {
    private final ProductService service;

    public ProductController(ProductService service) {
        this.service = service;
    }

    @GetMapping("/api/products")
    List<ProductResponse> products(@RequestParam(required = false) String search,
                                   @RequestParam(required = false) String sort) {
        return service.findAll(search, sort);
    }

    @GetMapping("/api/products/{id}")
    ProductResponse product(@PathVariable Long id) {
        return service.findById(id);
    }

    @PostMapping("/api/products")
    ResponseEntity<ProductResponse> create(@Valid @RequestBody ProductRequest request) {
        return ResponseEntity.status(HttpStatus.CREATED).body(service.create(request));
    }

    @PutMapping("/api/products/{id}")
    ProductResponse update(@PathVariable Long id, @Valid @RequestBody ProductRequest request) {
        return service.update(id, request);
    }

    @DeleteMapping("/api/products/{id}")
    ResponseEntity<Void> delete(@PathVariable Long id) {
        service.delete(id);
        return ResponseEntity.noContent().build();
    }

    @PostMapping("/internal/products/{id}/reserve")
    ProductResponse reserve(@PathVariable Long id, @RequestParam int quantity) {
        return service.reserve(id, quantity);
    }
}
