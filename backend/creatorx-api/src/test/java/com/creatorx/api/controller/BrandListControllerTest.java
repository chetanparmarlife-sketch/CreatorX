package com.creatorx.api.controller;

import com.creatorx.api.integration.BaseIntegrationTest;
import com.creatorx.common.enums.UserRole;
import com.creatorx.repository.UserRepository;
import com.creatorx.repository.entity.User;
import com.creatorx.service.testdata.TestDataBuilder;
import com.fasterxml.jackson.databind.ObjectMapper;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.MediaType;

import java.util.Map;
import java.util.UUID;

import static org.springframework.security.test.web.servlet.request.SecurityMockMvcRequestPostProcessors.csrf;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.delete;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.post;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.jsonPath;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

/**
 * BrandListControllerTest.
 *
 * Integration tests for shared brand shortlist endpoints. These verify that
 * the database-backed API works where the dashboard previously relied on
 * browser localStorage.
 */
@DisplayName("BrandListController API Tests")
class BrandListControllerTest extends BaseIntegrationTest {
    @Autowired
    private ObjectMapper objectMapper;

    @Autowired
    private UserRepository localUserRepository;

    @Test
    @DisplayName("GET /api/v1/brands/lists returns 200 with lists")
    void getLists_returnsListsForBrand() throws Exception {
        authenticateAsBrand();
        addCreatorToShortlist(testCreator.getId());

        mockMvc.perform(get("/api/v1/brands/lists")
                        .with(csrf()))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$").isArray())
                .andExpect(jsonPath("$[0].creatorIds[0]").value(testCreator.getId()));
    }

    @Test
    @DisplayName("GET /api/v1/brands/lists without auth returns 401")
    void getLists_withoutAuth_returnsUnauthorized() throws Exception {
        clearAuthentication();

        mockMvc.perform(get("/api/v1/brands/lists")
                        .with(csrf()))
                .andExpect(status().isUnauthorized());
    }

    @Test
    @DisplayName("POST /api/v1/brands/lists/shortlist with valid body returns 200")
    void addToShortlist_withValidBody_returnsList() throws Exception {
        authenticateAsBrand();

        mockMvc.perform(post("/api/v1/brands/lists/shortlist")
                        .with(csrf())
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(Map.of("creatorId", testCreator.getId()))))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.creatorIds[0]").value(testCreator.getId()))
                .andExpect(jsonPath("$.creatorCount").value(1));
    }

    @Test
    @DisplayName("POST /api/v1/brands/lists/shortlist without creatorId returns 400")
    void addToShortlist_withoutCreatorId_returnsBadRequest() throws Exception {
        authenticateAsBrand();

        mockMvc.perform(post("/api/v1/brands/lists/shortlist")
                        .with(csrf())
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(Map.of())))
                .andExpect(status().isBadRequest());
    }

    @Test
    @DisplayName("DELETE /api/v1/brands/lists/shortlist/{creatorId} returns 204")
    void removeFromShortlist_returnsNoContent() throws Exception {
        authenticateAsBrand();
        addCreatorToShortlist(testCreator.getId());

        mockMvc.perform(delete("/api/v1/brands/lists/shortlist/" + testCreator.getId())
                        .with(csrf()))
                .andExpect(status().isNoContent());
    }

    @Test
    @DisplayName("Brand cannot read another brand's lists")
    void getLists_forAnotherBrand_returnsEmptyList() throws Exception {
        authenticateAsBrand();
        addCreatorToShortlist(testCreator.getId());

        User otherBrand = localUserRepository.save(TestDataBuilder.user()
                .asBrand()
                .withEmail("brand-" + UUID.randomUUID() + "@example.com")
                .build());
        authenticateAs(otherBrand);

        mockMvc.perform(get("/api/v1/brands/lists")
                        .with(csrf()))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$").isEmpty());
    }

    /**
     * Add a creator through the real endpoint so controller tests use the same
     * API path the brand dashboard calls.
     */
    private void addCreatorToShortlist(String creatorId) throws Exception {
        if (testCreator.getRole() != UserRole.CREATOR) {
            throw new IllegalStateException("Test shortlist target must be a creator");
        }
        mockMvc.perform(post("/api/v1/brands/lists/shortlist")
                        .with(csrf())
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(Map.of("creatorId", creatorId))))
                .andExpect(status().isOk());
    }
}
