package com.smartcart.gateway.security;

import io.jsonwebtoken.Claims;
import io.jsonwebtoken.Jwts;
import io.jsonwebtoken.security.Keys;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.cloud.gateway.filter.GatewayFilterChain;
import org.springframework.cloud.gateway.filter.GlobalFilter;
import org.springframework.core.Ordered;
import org.springframework.http.HttpMethod;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Component;
import org.springframework.web.server.ServerWebExchange;
import reactor.core.publisher.Mono;

import javax.crypto.SecretKey;
import java.nio.charset.StandardCharsets;

@Component
public class JwtAuthenticationFilter implements GlobalFilter, Ordered {
    private final SecretKey key;

    public JwtAuthenticationFilter(@Value("${smartcart.jwt.secret}") String secret) {
        this.key = Keys.hmacShaKeyFor(secret.getBytes(StandardCharsets.UTF_8));
    }

    @Override
    public Mono<Void> filter(ServerWebExchange exchange, GatewayFilterChain chain) {
        String path = exchange.getRequest().getURI().getPath();
        HttpMethod method = exchange.getRequest().getMethod();
        boolean publicRequest = path.startsWith("/api/auth/")
                || (path.startsWith("/api/products") && HttpMethod.GET.equals(method))
                || HttpMethod.OPTIONS.equals(method);
        if (publicRequest) {
            return chain.filter(exchange);
        }

        String authorization = exchange.getRequest().getHeaders().getFirst("Authorization");
        if (authorization == null || !authorization.startsWith("Bearer ")) {
            return reject(exchange, HttpStatus.UNAUTHORIZED);
        }
        try {
            Claims claims = Jwts.parser().verifyWith(key).build()
                    .parseSignedClaims(authorization.substring(7)).getPayload();
            String role = claims.get("role", String.class);
            boolean adminWrite = path.startsWith("/api/products") && !HttpMethod.GET.equals(method);
            boolean viewAllOrders = path.equals("/api/orders") && HttpMethod.GET.equals(method);
            if ((adminWrite || viewAllOrders) && !"ADMIN".equals(role)) {
                return reject(exchange, HttpStatus.FORBIDDEN);
            }
            ServerWebExchange authenticated = exchange.mutate().request(request -> request
                    .header("X-Authenticated-User", claims.getSubject())
                    .header("X-User-Role", role)).build();
            return chain.filter(authenticated);
        } catch (RuntimeException ex) {
            return reject(exchange, HttpStatus.UNAUTHORIZED);
        }
    }

    private Mono<Void> reject(ServerWebExchange exchange, HttpStatus status) {
        exchange.getResponse().setStatusCode(status);
        return exchange.getResponse().setComplete();
    }

    @Override
    public int getOrder() {
        return -1;
    }
}
