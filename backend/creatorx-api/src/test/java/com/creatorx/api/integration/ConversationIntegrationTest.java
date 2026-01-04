package com.creatorx.api.integration;

import com.creatorx.repository.CampaignRepository;
import com.creatorx.repository.ConversationRepository;
import com.creatorx.repository.MessageRepository;
import com.creatorx.repository.UserRepository;
import com.creatorx.repository.entity.Campaign;
import com.creatorx.repository.entity.Conversation;
import com.creatorx.repository.entity.Message;
import com.creatorx.repository.entity.User;
import com.creatorx.service.testdata.TestDataBuilder;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.MediaType;
import org.springframework.security.test.context.support.WithMockUser;
import org.springframework.test.web.servlet.MockMvc;

import java.time.LocalDateTime;

import static org.springframework.security.test.web.servlet.request.SecurityMockMvcRequestPostProcessors.csrf;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.post;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.jsonPath;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

@DisplayName("Conversation Integration Tests")
class ConversationIntegrationTest extends BaseIntegrationTest {
    @Autowired
    protected MockMvc mockMvc;

    @Autowired
    protected UserRepository userRepository;

    @Autowired
    protected CampaignRepository campaignRepository;

    @Autowired
    protected ConversationRepository conversationRepository;

    @Autowired
    protected MessageRepository messageRepository;

    private User creatorUser;
    private User brandUser;
    private Conversation conversation;

    @BeforeEach
    void setUp() {
        messageRepository.deleteAll();
        conversationRepository.deleteAll();
        campaignRepository.deleteAll();
        userRepository.deleteAll();

        creatorUser = TestDataBuilder.user()
                .asCreator()
                .withEmail("creator@test.com")
                .build();
        creatorUser = userRepository.save(creatorUser);

        brandUser = TestDataBuilder.user()
                .asBrand()
                .withEmail("brand@test.com")
                .build();
        brandUser = userRepository.save(brandUser);

        Campaign campaign = TestDataBuilder.campaign()
                .withBrand(brandUser)
                .active()
                .build();
        campaign = campaignRepository.save(campaign);

        conversation = Conversation.builder()
                .creator(creatorUser)
                .brand(brandUser)
                .campaign(campaign)
                .creatorUnreadCount(1)
                .brandUnreadCount(0)
                .lastMessageAt(LocalDateTime.now())
                .build();
        conversation = conversationRepository.save(conversation);

        Message message = Message.builder()
                .conversation(conversation)
                .sender(brandUser)
                .content("Hello from brand")
                .read(false)
                .build();
        messageRepository.save(message);
    }

    @Test
    @DisplayName("Should list conversations with lastMessage.text")
    @WithMockUser(username = "creator@test.com", roles = "CREATOR")
    void testGetConversations() throws Exception {
        mockMvc.perform(get("/api/v1/conversations"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.conversations").isArray())
                .andExpect(jsonPath("$.conversations[0].lastMessage.text").value("Hello from brand"));
    }

    @Test
    @DisplayName("Should send message via conversations endpoint")
    @WithMockUser(username = "creator@test.com", roles = "CREATOR")
    void testSendMessage() throws Exception {
        String payload = """
                { "text": "Creator reply" }
                """;

        mockMvc.perform(post("/api/v1/conversations/" + conversation.getId() + "/messages")
                        .with(csrf())
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(payload))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.text").value("Creator reply"));
    }
}
