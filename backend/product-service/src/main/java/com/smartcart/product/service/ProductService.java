package com.smartcart.product.service;

import com.smartcart.product.dto.ProductDtos.*;
import com.smartcart.product.entity.Product;
import com.smartcart.product.exception.ApiException;
import com.smartcart.product.repository.ProductRepository;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.boot.CommandLineRunner;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.util.Comparator;
import java.util.List;

@Service
public class ProductService implements CommandLineRunner {
    private static final Logger log = LoggerFactory.getLogger(ProductService.class);
    private final ProductRepository repository;
    private final boolean seedProducts;

    public ProductService(ProductRepository repository,
                          @Value("${smartcart.seed-products:false}") boolean seedProducts) {
        this.repository = repository;
        this.seedProducts = seedProducts;
    }

    public List<ProductResponse> findAll(String search, String sort) {
        Comparator<Product> comparator = switch (sort == null ? "" : sort) {
            case "priceAsc" -> Comparator.comparing(Product::getPrice);
            case "priceDesc" -> Comparator.comparing(Product::getPrice).reversed();
            default -> Comparator.comparing(Product::getName, String.CASE_INSENSITIVE_ORDER);
        };
        String query = search == null ? "" : search.trim().toLowerCase();
        return repository.findAll().stream()
                .filter(product -> query.isEmpty()
                        || product.getName().toLowerCase().contains(query)
                        || (product.getDescription() != null
                        && product.getDescription().toLowerCase().contains(query)))
                .sorted(comparator)
                .map(this::response)
                .toList();
    }

    public ProductResponse findById(Long id) {
        return response(requireProduct(id));
    }

    public ProductResponse create(ProductRequest request) {
        Product saved = repository.save(new Product(request.name(), request.description(), request.price(), request.quantity()));
        log.info("Created product {}", saved.getName());
        return response(saved);
    }

    @Transactional
    public ProductResponse update(Long id, ProductRequest request) {
        Product product = requireProduct(id);
        product.update(request.name(), request.description(), request.price(), request.quantity());
        return response(product);
    }

    public void delete(Long id) {
        Product product = requireProduct(id);
        repository.delete(product);
        log.info("Deleted product {}", id);
    }

    @Transactional
    public ProductResponse reserve(Long id, int quantity) {
        if (quantity < 1) {
            throw new ApiException(HttpStatus.BAD_REQUEST, "Order quantity must be at least 1");
        }
        Product product = requireProduct(id);
        if (product.getQuantity() < quantity) {
            throw new ApiException(HttpStatus.CONFLICT, "Insufficient stock for " + product.getName());
        }
        product.reserve(quantity);
        log.info("Reserved {} unit(s) of product {}", quantity, id);
        return response(product);
    }

    private Product requireProduct(Long id) {
        return repository.findById(id)
                .orElseThrow(() -> new ApiException(HttpStatus.NOT_FOUND, "Product not found"));
    }

    private ProductResponse response(Product product) {
        return new ProductResponse(product.getId(), product.getName(), product.getDescription(),
                product.getPrice(), product.getQuantity());
    }

    @Override
    public void run(String... args) {
        if (seedProducts && repository.count() == 0) {
            repository.saveAll(List.of(
                    new Product("Wireless Headphones", "Noise-isolating audio for study sessions.", new BigDecimal("2499.00"), 20),
                    new Product("Smart Watch", "Fitness tracking and phone notifications.", new BigDecimal("3999.00"), 15),
                    new Product("Laptop Backpack", "Water-resistant storage for everyday commutes.", new BigDecimal("1499.00"), 32),
                    new Product("Mechanical Keyboard", "Tactile keyboard with backlighting.", new BigDecimal("3299.00"), 12),
                    new Product("USB-C Hub", "Seven-port hub for workstations.", new BigDecimal("1899.00"), 28)
            ));
            log.info("Seeded SmartCart product catalog");
        }
    }
}
