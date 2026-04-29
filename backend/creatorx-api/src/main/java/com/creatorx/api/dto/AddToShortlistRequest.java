package com.creatorx.api.dto;

import jakarta.validation.constraints.NotBlank;
import lombok.Data;

/**
 * AddToShortlistRequest.
 *
 * Request body used by the brand dashboard when it saves a creator to a shared
 * backend shortlist instead of browser localStorage.
 */
@Data
public class AddToShortlistRequest {
    @NotBlank(message = "Creator ID is required")
    private String creatorId;

    private String campaignId;

    private String listName;
}
