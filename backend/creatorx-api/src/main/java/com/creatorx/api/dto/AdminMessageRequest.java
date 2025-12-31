package com.creatorx.api.dto;

import jakarta.validation.constraints.NotBlank;
import lombok.Data;

@Data
public class AdminMessageRequest {
    @NotBlank(message = "Message content is required")
    private String content;
}
