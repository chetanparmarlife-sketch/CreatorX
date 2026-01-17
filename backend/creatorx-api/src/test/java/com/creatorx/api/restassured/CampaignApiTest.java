package com.creatorx.api.restassured;

import io.restassured.RestAssured;
import io.restassured.http.ContentType;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Disabled;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Tag;
import org.junit.jupiter.api.Test;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.boot.test.web.server.LocalServerPort;
import org.springframework.test.context.ActiveProfiles;

import static io.restassured.RestAssured.given;
import static org.hamcrest.Matchers.*;

/**
 * REST Assured API tests for Campaign endpoints.
 * 
 * <p>
 * <b>RATIONALE FOR EXCLUSION FROM CI:</b>
 * </p>
 * These REST Assured tests are disabled because:
 * <ol>
 * <li>They are redundant with {@code CampaignIntegrationTest} which uses
 * MockMvc
 * and provides equivalent coverage</li>
 * <li>REST Assured requires a real HTTP server (RANDOM_PORT), which adds test
 * execution time and complexity</li>
 * <li>The authentication setup is incomplete (would require actual JWT
 * flow)</li>
 * </ol>
 * 
 * <p>
 * To run these tests manually, use:
 * {@code ./gradlew test --tests "*CampaignApiTest" -Pinclude.restassured=true}
 * </p>
 * 
 * <p>
 * The equivalent MockMvc tests in {@code CampaignIntegrationTest} are preferred
 * for CI because they run faster and don't require a running server.
 * </p>
 */
@SpringBootTest(webEnvironment = SpringBootTest.WebEnvironment.RANDOM_PORT)
@ActiveProfiles("test")
@DisplayName("Campaign API Tests (REST Assured)")
@Tag("restassured")
@Disabled("Redundant with CampaignIntegrationTest MockMvc tests - see class Javadoc for rationale")
class CampaignApiTest {

        @LocalServerPort
        protected int port;

        protected String baseUrl;
        protected String authToken;

        @BeforeEach
        void setUp() {
                baseUrl = "http://localhost:" + port + "/api/v1";
                RestAssured.baseURI = "http://localhost";
                RestAssured.port = port;
                RestAssured.basePath = "/api/v1";

                // Auth token would need to be obtained via actual login flow
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
