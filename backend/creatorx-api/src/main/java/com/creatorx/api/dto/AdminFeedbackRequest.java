package com.creatorx.api.dto;

import lombok.Data;

@Data
public class AdminFeedbackRequest {
    private int rating;
    private String comment;
}
