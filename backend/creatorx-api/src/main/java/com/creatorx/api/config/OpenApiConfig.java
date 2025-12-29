package com.creatorx.api.config;

import io.swagger.v3.oas.models.Components;
import io.swagger.v3.oas.models.OpenAPI;
import io.swagger.v3.oas.models.info.Contact;
import io.swagger.v3.oas.models.info.Info;
import io.swagger.v3.oas.models.info.License;
import io.swagger.v3.oas.models.security.SecurityRequirement;
import io.swagger.v3.oas.models.security.SecurityScheme;
import io.swagger.v3.oas.models.servers.Server;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;

import java.util.List;

/**
 * OpenAPI/Swagger configuration
 * Auto-generates API documentation from Spring Boot controllers
 */
@Configuration
public class OpenApiConfig {
    
    @Value("${server.port:8080}")
    private int serverPort;
    
    @Bean
    public OpenAPI creatorXOpenAPI() {
        return new OpenAPI()
                .info(new Info()
                        .title("CreatorX API")
                        .version("1.0.0")
                        .description("""
                                Complete API specification for CreatorX - A three-sided marketplace 
                                connecting creators, brands, and admins for influencer campaign management.
                                
                                ## Authentication
                                All protected endpoints require JWT Bearer token in Authorization header:
                                `Authorization: Bearer <access_token>`
                                
                                Tokens are obtained from Supabase Auth via `/api/v1/auth/login` or `/api/v1/auth/register`.
                                
                                ## Pagination
                                List endpoints support pagination with query parameters:
                                - `page`: Page number (default: 0)
                                - `size`: Items per page (default: 20, max: 100)
                                
                                ## Error Handling
                                All errors follow standard format:
                                ```json
                                {
                                  "timestamp": "2024-01-01T00:00:00Z",
                                  "status": 400,
                                  "error": "Bad Request",
                                  "message": "Error description",
                                  "path": "/api/v1/endpoint"
                                }
                                ```
                                
                                ## Rate Limiting
                                - Authentication endpoints: 5 requests/minute per IP
                                - Other endpoints: 100 requests/minute per user
                                
                                ## WebSocket
                                Real-time messaging available via WebSocket:
                                - Endpoint: `ws://localhost:8080/ws`
                                - Protocol: STOMP over WebSocket
                                - Authentication: JWT token in CONNECT frame
                                """)
                        .contact(new Contact()
                                .name("CreatorX API Support")
                                .email("api@creatorx.com")
                                .url("https://creatorx.com/support"))
                        .license(new License()
                                .name("Proprietary")
                                .url("https://creatorx.com/license")))
                .servers(List.of(
                        new Server()
                                .url("http://localhost:" + serverPort)
                                .description("Local development server"),
                        new Server()
                                .url("https://api-dev.creatorx.com")
                                .description("Development environment"),
                        new Server()
                                .url("https://api-staging.creatorx.com")
                                .description("Staging environment"),
                        new Server()
                                .url("https://api.creatorx.com")
                                .description("Production environment")
                ))
                .components(new Components()
                        .addSecuritySchemes("bearerAuth", new SecurityScheme()
                                .type(SecurityScheme.Type.HTTP)
                                .scheme("bearer")
                                .bearerFormat("JWT")
                                .description("""
                                        JWT token obtained from Supabase Auth.
                                        Include in Authorization header: `Bearer <token>`
                                        
                                        Token expires after 24 hours. Use refresh token endpoint to get new token.
                                        """)))
                .addSecurityItem(new SecurityRequirement().addList("bearerAuth"));
    }
}
