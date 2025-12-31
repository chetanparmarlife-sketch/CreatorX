package com.creatorx.service.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.util.List;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class ModerationRuleTestResultDTO {
    private String ruleId;
    private int testedCount;
    private int matchCount;
    private List<MatchedCampaign> matches;

    @Data
    @Builder
    @NoArgsConstructor
    @AllArgsConstructor
    public static class MatchedCampaign {
        private String campaignId;
        private String campaignTitle;
    }
}
