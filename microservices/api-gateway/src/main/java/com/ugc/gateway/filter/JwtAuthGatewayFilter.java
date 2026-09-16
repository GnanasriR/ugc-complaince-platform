package com.ugc.gateway.filter;

import io.jsonwebtoken.Claims;
import io.jsonwebtoken.Jwts;
import io.jsonwebtoken.security.Keys;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.cloud.gateway.filter.GatewayFilter;
import org.springframework.cloud.gateway.filter.factory.AbstractGatewayFilterFactory;
import org.springframework.http.HttpHeaders;
import org.springframework.http.HttpMethod;
import org.springframework.http.server.reactive.ServerHttpRequest;
import org.springframework.stereotype.Component;

import java.nio.charset.StandardCharsets;
import java.security.Key;

@Component
public class JwtAuthGatewayFilter
        extends AbstractGatewayFilterFactory<JwtAuthGatewayFilter.Config> {

    @Value("${jwt.secret:mySuperSecretKeyForUGCProject12345678901234567890}")
    private String jwtSecret;

    public JwtAuthGatewayFilter() {
        super(Config.class);
    }

    public static class Config {
    }

    private Key getSigningKey() {
        return Keys.hmacShaKeyFor(
                jwtSecret.getBytes(StandardCharsets.UTF_8)
        );
    }

    @Override
    public GatewayFilter apply(Config config) {

        return (exchange, chain) -> {

            ServerHttpRequest request = exchange.getRequest();

            // Allow CORS preflight OPTIONS requests unconditionally
            if (request.getMethod() == HttpMethod.OPTIONS) {
                return chain.filter(exchange);
            }

            String authHeader = request.getHeaders().getFirst(HttpHeaders.AUTHORIZATION);

            // Extract token if present
            if (authHeader != null && authHeader.startsWith("Bearer ")) {
                String token = authHeader.substring(7);
                try {
                    Key key = getSigningKey();
                    Claims claims = Jwts.parserBuilder()
                            .setSigningKey(key)
                            .build()
                            .parseClaimsJws(token)
                            .getBody();

                    ServerHttpRequest modifiedRequest =
                            request.mutate()
                                    .header("X-User-Email", claims.getSubject())
                                    .header("X-User-Role", String.valueOf(claims.get("role")))
                                    .build();

                    return chain.filter(exchange.mutate().request(modifiedRequest).build());
                } catch (Exception e) {
                    // Ignore token parse error and forward request with default user context
                }
            }

            // Forward request with default institutional context header
            ServerHttpRequest modifiedRequest =
                    request.mutate()
                            .header("X-User-Email", "applicant@institution.ac.in")
                            .header("X-User-Role", "ROLE_INSTITUTION")
                            .build();

            return chain.filter(exchange.mutate().request(modifiedRequest).build());
        };
    }
}