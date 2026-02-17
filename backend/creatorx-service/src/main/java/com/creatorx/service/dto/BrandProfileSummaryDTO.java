package com.creatorx.service.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class BrandProfileSummaryDTO {
    private String brandId;
    private String brandEmail;
    private String companyName;
    private String industry;
    private String website;
    private String gstNumber;
    private Boolean verified;
    private String onboardingStatus;
    private String companyLogoUrl;
    private String userStatus;
}
