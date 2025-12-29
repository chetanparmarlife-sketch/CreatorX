package com.creatorx.api.restassured;

import com.creatorx.api.integration.BaseIntegrationTest;
import io.restassured.RestAssured;
import io.restassured.http.ContentType;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.springframework.boot.test.web.server.LocalServerPort;

import static io.restassured.RestAssured.given;
import static org.hamcrest.Matchers.*;

/**
 * REST Assured API tests for Campaign endpoints
 * Tests full HTTP request/response cycle
 */
@DisplayName("Campaign API Tests (REST Assured)")
class CampaignApiTest extends BaseIntegrationTest {
    
    @LocalServerPort
    protected int port;
    
    protected String baseUrl;
    protected String authToken;
    
    @BeforeEach
    void setUp() {
        baseUrl = "http://localhost:" + port + "/api/v1";
        RestAssured.baseURI = baseUrl;
        RestAssured.port = port;
        
        // Get auth token (simplified - in real scenario, login first)
        // authToken = getAuthToken();
    }
    
    @Test
    @DisplayName("GET /campaigns should return 200 with paginated campaigns")
    void testGetCampaigns_Returns200() {
        given()
                .contentType(ContentType.JSON)
        .when()
                .get("/campaigns?page=0&size=20")
        .then()
                .statusCode(200)
                .body("content", is(notNullValue()))
                .body("page", is(0))
                .body("size", is(20));
    }
    
    @Test
    @DisplayName("GET /campaigns/{id} should return 404 for non-existent campaign")
    void testGetCampaignById_Returns404() {
        given()
                .contentType(ContentType.JSON)
        .when()
                .get("/campaigns/non-existent-id")
        .then()
                .statusCode(404);
    }
    
    @Test
    @DisplayName("POST /campaigns should return 401 without authentication")
    void testCreateCampaign_Returns401_WhenUnauthenticated() {
        String requestBody = """
                {
                    "title": "Test Campaign",
                    "description": "Description",
                    "budget": 10000.00,
                    "platform": "INSTAGRAM",
                    "category": "Tech",
                    "deliverableTypes": ["IMAGE"],
                    "startDate": "2024-06-01",
                    "endDate": "2024-06-30"
                }
                """;
        
        given()
                .contentType(ContentType.JSON)
                .body(requestBody)
        .when()
                .post("/campaigns")
        .then()
                .statusCode(401);
    }
    
    @Test
    @DisplayName("POST /campaigns should return 400 for invalid request")
    void testCreateCampaign_Returns400_WhenInvalid() {
        String invalidRequestBody = """
                {
                    "title": "",
                    "budget": -100
                }
                """;
        
        given()
                .contentType(ContentType.JSON)
                .header("Authorization", "Bearer " + authToken)
                .body(invalidRequestBody)
        .when()
                .post("/campaigns")
        .then()
                .statusCode(400);
    }
    
    @Test
    @DisplayName("GET /campaigns should support filtering")
    void testGetCampaigns_WithFilters() {
        given()
                .contentType(ContentType.JSON)
                .queryParam("category", "Fashion")
                .queryParam("platform", "INSTAGRAM")
                .queryParam("budgetMin", 1000)
                .queryParam("budgetMax", 50000)
        .when()
                .get("/campaigns")
        .then()
                .statusCode(200)
                .body("content", is(notNullValue()));
    }
}

