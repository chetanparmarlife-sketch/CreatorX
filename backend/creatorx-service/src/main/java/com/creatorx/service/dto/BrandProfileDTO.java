package com.creatorx.service.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class BrandProfileDTO {
    private String userId;
    private String companyName;
    private String gstNumber;
    private String industry;
    private String website;
    private Boolean verified;
    private String onboardingStatus;
    private String companyLogoUrl;
    private String companyDescription;
}

