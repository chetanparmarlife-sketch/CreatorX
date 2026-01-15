package com.creatorx.api.controller;

import com.creatorx.common.enums.SocialProvider;
import com.creatorx.service.SocialAccountService;
import com.creatorx.service.dto.SocialAccountDTO;
import com.creatorx.service.social.SocialOAuthService;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.mockito.junit.jupiter.MockitoSettings;
import org.mockito.quality.Strictness;
import org.springframework.mock.web.MockHttpSession;
import org.springframework.security.core.Authentication;
import org.springframework.test.util.ReflectionTestUtils;

import java.time.LocalDateTime;

import static org.assertj.core.api.Assertions.assertThat;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.ArgumentMatchers.eq;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
@MockitoSettings(strictness = Strictness.LENIENT)
class SocialConnectControllerTest {

        @Mock
        private SocialOAuthService socialOAuthService;

        @Mock
        private SocialAccountService socialAccountService;

        @Mock
        private Authentication authentication;

        @InjectMocks
        private SocialConnectController controller;

        private MockHttpSession session;

        @BeforeEach
        void setUp() {
                session = new MockHttpSession();
                ReflectionTestUtils.setField(controller, "deepLinkScheme", "creatorx");
                when(authentication.getName()).thenReturn("user-123");
        }

        @Test
        void startOAuth_instagram_returns302() {
                // Given
                when(socialOAuthService.isProviderEnabled(SocialProvider.INSTAGRAM)).thenReturn(true);
                when(socialOAuthService.getAuthorizationUrl(eq(SocialProvider.INSTAGRAM), any()))
                                .thenReturn("https://api.instagram.com/oauth/authorize?...");

                // When
                var response = controller.startOAuth("instagram", authentication, session);

                // Then
                assertThat(response.getStatusCode().value()).isEqualTo(302);
                assertThat(response.getHeaders().getLocation()).isNotNull();
                assertThat(response.getHeaders().getLocation().toString())
                                .startsWith("https://api.instagram.com/oauth/authorize");

                // Verify session state was set
                assertThat(session.getAttribute("oauth_state")).isNotNull();
                assertThat(session.getAttribute("oauth_user_id")).isEqualTo("user-123");
                assertThat(session.getAttribute("oauth_provider")).isEqualTo("INSTAGRAM");
        }

        @Test
        void startOAuth_facebook_returns302() {
                // Given
                when(socialOAuthService.isProviderEnabled(SocialProvider.FACEBOOK)).thenReturn(true);
                when(socialOAuthService.getAuthorizationUrl(eq(SocialProvider.FACEBOOK), any()))
                                .thenReturn("https://www.facebook.com/v18.0/dialog/oauth?...");

                // When
                var response = controller.startOAuth("facebook", authentication, session);

                // Then
                assertThat(response.getStatusCode().value()).isEqualTo(302);
                assertThat(response.getHeaders().getLocation()).isNotNull();
                assertThat(response.getHeaders().getLocation().toString())
                                .startsWith("https://www.facebook.com");
        }

        @Test
        void startOAuth_linkedin_returns501() {
                // When
                var response = controller.startOAuth("linkedin", authentication, session);

                // Then
                assertThat(response.getStatusCode().value()).isEqualTo(501);
                assertThat(response.getHeaders().getFirst("X-Error-Code"))
                                .isEqualTo("SOCIAL_LINKEDIN_NOT_AVAILABLE");
        }

        @Test
        void callback_success_storesTokensAndRedirects() {
                // Given
                String state = "test-state";
                session.setAttribute("oauth_state", state);
                session.setAttribute("oauth_user_id", "user-123");
                session.setAttribute("oauth_provider", "INSTAGRAM");

                var tokenResult = new SocialOAuthService.OAuthTokenResult(
                                "access-token",
                                "refresh-token",
                                LocalDateTime.now().plusDays(60));
                when(socialOAuthService.exchangeCodeForToken(eq(SocialProvider.INSTAGRAM), eq("auth-code")))
                                .thenReturn(tokenResult);
                when(socialAccountService.connectSocialAccount(
                                eq("user-123"),
                                eq(SocialProvider.INSTAGRAM),
                                eq("access-token"),
                                eq("refresh-token"),
                                any()))
                                .thenReturn(SocialAccountDTO.builder().provider(SocialProvider.INSTAGRAM)
                                                .connected(true).build());

                // When
                var response = controller.oauthCallback("instagram", "auth-code", state, null, null, session);

                // Then
                assertThat(response.getStatusCode().value()).isEqualTo(302);
                assertThat(response.getHeaders().getLocation().toString())
                                .isEqualTo("creatorx://social-connect?provider=instagram&status=success");

                // Verify tokens were stored
                verify(socialAccountService).connectSocialAccount(
                                eq("user-123"),
                                eq(SocialProvider.INSTAGRAM),
                                eq("access-token"),
                                eq("refresh-token"),
                                any());

                // Verify session was cleared
                assertThat(session.getAttribute("oauth_state")).isNull();
        }

        @Test
        void callback_error_redirectsWithErrorMessage() {
                // When
                var response = controller.oauthCallback(
                                "instagram",
                                null,
                                null,
                                "access_denied",
                                "User denied access",
                                session);

                // Then
                assertThat(response.getStatusCode().value()).isEqualTo(302);
                assertThat(response.getHeaders().getLocation().toString())
                                .contains("status=error")
                                .contains("message=User+denied+access");
        }

        @Test
        void callback_invalidState_redirectsWithError() {
                // Given
                session.setAttribute("oauth_state", "valid-state");
                session.setAttribute("oauth_user_id", "user-123");
                session.setAttribute("oauth_provider", "INSTAGRAM");

                // When
                var response = controller.oauthCallback("instagram", "code", "invalid-state", null, null, session);

                // Then
                assertThat(response.getStatusCode().value()).isEqualTo(302);
                assertThat(response.getHeaders().getLocation().toString())
                                .contains("status=error")
                                .contains("message=Invalid+OAuth+state");
        }

        @Test
        void callback_noSession_redirectsWithError() {
                // When (empty session)
                var response = controller.oauthCallback("instagram", "code", "state", null, null, session);

                // Then
                assertThat(response.getStatusCode().value()).isEqualTo(302);
                assertThat(response.getHeaders().getLocation().toString())
                                .contains("status=error");
        }
}
