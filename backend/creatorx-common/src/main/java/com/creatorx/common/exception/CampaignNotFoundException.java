package com.creatorx.common.exception;

public class CampaignNotFoundException extends ResourceNotFoundException {
    public CampaignNotFoundException(String campaignId) {
        super("Campaign", campaignId);
    }
    
    public CampaignNotFoundException(String message, String campaignId) {
        super(String.format("%s: %s", message, campaignId));
    }
}

