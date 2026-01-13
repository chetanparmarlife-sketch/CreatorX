package com.creatorx.service.social;

import com.creatorx.common.enums.SocialProvider;
import com.creatorx.common.exception.BusinessException;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.*;
import org.springframework.stereotype.Service;
import org.springframework.util.LinkedMultiValueMap;
import org.springframework.util.MultiValueMap;
import org.springframework.web.client.RestTemplate;

import java.net.URLEncoder;
import java.nio.charset.StandardCharsets;
import java.time.LocalDateTime;
import java.util.Map;

/**
 * OAuth service for social provider authentication flows.
 * Handles authorization URL generation and token exchange.
 */
@Service
@Slf4j
public class SocialOAuthService {

    @Value("${creatorx.social.instagram.client-id:}")
    private String instagramClientId;

    @Value("${creatorx.social.instagram.client-secret:}")
    private String instagramClientSecret;

    @Value("${creatorx.social.facebook.app-id:}")
    private String facebookAppId;

    @Value("${creatorx.social.facebook.app-secret:}")
    private String facebookAppSecret;

    @Value("${creatorx.api.base-url:http://localhost:8080}")
    private String apiBaseUrl;

    private final RestTemplate restTemplate = new RestTemplate();

    /**
     * Build the OAuth authorization URL for the given provider.
     * Mobile opens this URL in a browser to start OAuth flow.
     */
    public String getAuthorizationUrl(SocialProvider provider, String state) {
        return switch (provider) {
            case INSTAGRAM -> buildInstagramAuthUrl(state);
            case FACEBOOK -> buildFacebookAuthUrl(state);
            case LINKEDIN -> throw new BusinessException("LinkedIn integration coming soon", "SOCIAL_LINKEDIN_NOT_AVAILABLE");
        };
    }

    /**
     * Exchange authorization code for access token.
     */
    public OAuthTokenResult exchangeCodeForToken(SocialProvider provider, String code) {
        return switch (provider) {
            case INSTAGRAM -> exchangeInstagramToken(code);
            case FACEBOOK -> exchangeFacebookToken(code);
            case LINKEDIN -> throw new BusinessException("LinkedIn integration coming soon", "SOCIAL_LINKEDIN_NOT_AVAILABLE");
        };
    }

    /**
     * Check if provider is enabled (has credentials configured).
     */
    public boolean isProviderEnabled(SocialProvider provider) {
        return switch (provider) {
            case INSTAGRAM -> instagramClientId != null && !instagramClientId.isBlank();
            case FACEBOOK -> facebookAppId != null && !facebookAppId.isBlank();
            case LINKEDIN -> false; // Always disabled
        };
    }

    private String buildInstagramAuthUrl(String state) {
        if (instagramClientId == null || instagramClientId.isBlank()) {
            throw new BusinessException("Instagram OAuth not configured", "SOCIAL_CONFIG_MISSING");
        }

        String redirectUri = apiBaseUrl + "/api/v1/social/connect/instagram/callback";
        String scope = "user_profile,user_media";

        return "https://api.instagram.com/oauth/authorize" +
                "?client_id=" + encode(instagramClientId) +
                "&redirect_uri=" + encode(redirectUri) +
                "&scope=" + encode(scope) +
                "&response_type=code" +
                "&state=" + encode(state);
    }

    private String buildFacebookAuthUrl(String state) {
        if (facebookAppId == null || facebookAppId.isBlank()) {
            throw new BusinessException("Facebook OAuth not configured", "SOCIAL_CONFIG_MISSING");
        }

        String redirectUri = apiBaseUrl + "/api/v1/social/connect/facebook/callback";
        String scope = "public_profile,pages_show_list,pages_read_engagement";

        return "https://www.facebook.com/v18.0/dialog/oauth" +
                "?client_id=" + encode(facebookAppId) +
                "&redirect_uri=" + encode(redirectUri) +
                "&scope=" + encode(scope) +
                "&response_type=code" +
                "&state=" + encode(state);
    }

    private OAuthTokenResult exchangeInstagramToken(String code) {
        String redirectUri = apiBaseUrl + "/api/v1/social/connect/instagram/callback";

        MultiValueMap<String, String> params = new LinkedMultiValueMap<>();
        params.add("client_id", instagramClientId);
        params.add("client_secret", instagramClientSecret);
        params.add("grant_type", "authorization_code");
        params.add("redirect_uri", redirectUri);
        params.add("code", code);

        HttpHeaders headers = new HttpHeaders();
        headers.setContentType(MediaType.APPLICATION_FORM_URLENCODED);

        try {
            ResponseEntity<Map> response = restTemplate.exchange(
                    "https://api.instagram.com/oauth/access_token",
                    HttpMethod.POST,
                    new HttpEntity<>(params, headers),
                    Map.class
            );

            Map<String, Object> body = response.getBody();
            if (body == null || !body.containsKey("access_token")) {
                throw new BusinessException("Instagram token exchange failed", "SOCIAL_TOKEN_EXCHANGE_FAIL");
            }

            String shortLivedToken = (String) body.get("access_token");
            
            // Exchange for long-lived token
            return exchangeInstagramLongLivedToken(shortLivedToken);
        } catch (BusinessException e) {
            throw e;
        } catch (Exception e) {
            log.error("Instagram token exchange failed", e);
            throw new BusinessException("Failed to connect Instagram", "SOCIAL_TOKEN_EXCHANGE_FAIL");
        }
    }

    private OAuthTokenResult exchangeInstagramLongLivedToken(String shortLivedToken) {
        try {
            String url = "https://graph.instagram.com/access_token" +
                    "?grant_type=ig_exchange_token" +
                    "&client_secret=" + encode(instagramClientSecret) +
                    "&access_token=" + encode(shortLivedToken);

            ResponseEntity<Map> response = restTemplate.getForEntity(url, Map.class);
            Map<String, Object> body = response.getBody();

            if (body == null || !body.containsKey("access_token")) {
                // Fall back to short-lived token
                return new OAuthTokenResult(shortLivedToken, null, LocalDateTime.now().plusHours(1));
            }

            String accessToken = (String) body.get("access_token");
            Number expiresIn = (Number) body.get("expires_in");
            LocalDateTime expiresAt = expiresIn != null
                    ? LocalDateTime.now().plusSeconds(expiresIn.longValue())
                    : LocalDateTime.now().plusDays(60);

            return new OAuthTokenResult(accessToken, null, expiresAt);
        } catch (Exception e) {
            log.warn("Failed to get Instagram long-lived token, using short-lived", e);
            return new OAuthTokenResult(shortLivedToken, null, LocalDateTime.now().plusHours(1));
        }
    }

    private OAuthTokenResult exchangeFacebookToken(String code) {
        String redirectUri = apiBaseUrl + "/api/v1/social/connect/facebook/callback";

        String url = "https://graph.facebook.com/v18.0/oauth/access_token" +
                "?client_id=" + encode(facebookAppId) +
                "&client_secret=" + encode(facebookAppSecret) +
                "&redirect_uri=" + encode(redirectUri) +
                "&code=" + encode(code);

        try {
            ResponseEntity<Map> response = restTemplate.getForEntity(url, Map.class);
            Map<String, Object> body = response.getBody();

            if (body == null || !body.containsKey("access_token")) {
                throw new BusinessException("Facebook token exchange failed", "SOCIAL_TOKEN_EXCHANGE_FAIL");
            }

            String accessToken = (String) body.get("access_token");
            Number expiresIn = (Number) body.get("expires_in");
            LocalDateTime expiresAt = expiresIn != null
                    ? LocalDateTime.now().plusSeconds(expiresIn.longValue())
                    : LocalDateTime.now().plusDays(60);

            return new OAuthTokenResult(accessToken, null, expiresAt);
        } catch (BusinessException e) {
            throw e;
        } catch (Exception e) {
            log.error("Facebook token exchange failed", e);
            throw new BusinessException("Failed to connect Facebook", "SOCIAL_TOKEN_EXCHANGE_FAIL");
        }
    }

    private String encode(String value) {
        return URLEncoder.encode(value, StandardCharsets.UTF_8);
    }

    /**
     * OAuth token result DTO.
     */
    public record OAuthTokenResult(
            String accessToken,
            String refreshToken,
            LocalDateTime expiresAt
    ) {}
}
