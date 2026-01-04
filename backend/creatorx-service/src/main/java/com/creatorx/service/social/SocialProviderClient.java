package com.creatorx.service.social;

import com.creatorx.common.enums.SocialProvider;
import com.creatorx.common.exception.BusinessException;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;

@Service
@Slf4j
public class SocialProviderClient {
    @Value("${creatorx.social.meta.enabled:false}")
    private boolean metaEnabled;

    @Value("${creatorx.social.linkedin.enabled:false}")
    private boolean linkedinEnabled;

    public SocialMetrics fetchMetrics(SocialProvider provider, String accessToken) {
        if (provider == SocialProvider.LINKEDIN && !linkedinEnabled) {
            throw new BusinessException("LinkedIn integration is disabled", "SOCIAL_PROVIDER_DISABLED");
        }

        if ((provider == SocialProvider.INSTAGRAM || provider == SocialProvider.FACEBOOK) && !metaEnabled) {
            throw new BusinessException("Meta Graph integration is disabled", "SOCIAL_PROVIDER_DISABLED");
        }

        // Provider-specific API integrations should be implemented here.
        // This placeholder avoids any mobile-side API calls and keeps tokens server-side only.
        log.warn("Social metrics fetcher not configured for provider {}", provider);
        throw new BusinessException("Provider integration not configured", "SOCIAL_PROVIDER_DISABLED");
    }
}
