package com.creatorx.service;

import com.creatorx.common.enums.UserRole;
import com.creatorx.common.exception.BusinessException;
import com.creatorx.common.exception.ResourceNotFoundException;
import com.creatorx.repository.BrandProfileRepository;
import com.creatorx.repository.CreatorProfileRepository;
import com.creatorx.repository.UserProfileRepository;
import com.creatorx.repository.UserRepository;
import com.creatorx.repository.entity.BrandProfile;
import com.creatorx.repository.entity.CreatorProfile;
import com.creatorx.repository.entity.User;
import com.creatorx.repository.entity.UserProfile;
import com.creatorx.service.dto.*;
import com.creatorx.service.storage.SupabaseStorageService;
import com.creatorx.service.testdata.TestDataBuilder;
import com.fasterxml.jackson.databind.ObjectMapper;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.web.multipart.MultipartFile;

import java.math.BigDecimal;
import java.util.ArrayList;
import java.util.Optional;

import static org.assertj.core.api.Assertions.assertThat;
import static org.assertj.core.api.Assertions.assertThatThrownBy;
import static org.mockito.ArgumentMatchers.*;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
@DisplayName("ProfileService Unit Tests")
class ProfileServiceTest {
    
    @Mock
    private UserRepository userRepository;
    
    @Mock
    private UserProfileRepository userProfileRepository;
    
    @Mock
    private CreatorProfileRepository creatorProfileRepository;
    
    @Mock
    private BrandProfileRepository brandProfileRepository;
    
    @Mock
    private SupabaseStorageService storageService;
    
    @Mock
    private ObjectMapper objectMapper;
    
    @InjectMocks
    private ProfileService profileService;
    
    private User creator;
    private User brand;
    private UserProfile userProfile;
    private CreatorProfile creatorProfile;
    private BrandProfile brandProfile;
    private MultipartFile file;
    
    @BeforeEach
    void setUp() {
        creator = TestDataBuilder.user()
                .asCreator()
                .withEmail("creator@example.com")
                .build();
        
        brand = TestDataBuilder.user()
                .asBrand()
                .withEmail("brand@example.com")
                .build();
        
        userProfile = UserProfile.builder()
                .userId(creator.getId())
                .user(creator)
                .fullName("Creator Name")
                .bio("Creator bio")
                .build();
        
        creatorProfile = CreatorProfile.builder()
                .userId(creator.getId())
                .user(creator)
                .username("creator123")
                .category("FASHION")
                .followerCount(1000)
                .engagementRate(new BigDecimal("5.5"))
                .portfolioItems(new ArrayList<>())
                .build();
        
        brandProfile = BrandProfile.builder()
                .userId(brand.getId())
                .user(brand)
                .companyName("Test Brand")
                .industry("Fashion")
                .build();
        
        file = mock(MultipartFile.class);
    }
    
    @Test
    @DisplayName("Should get user profile")
    void shouldGetUserProfile() {
        // Given
        when(userRepository.findById(creator.getId())).thenReturn(Optional.of(creator));
        creator.setUserProfile(userProfile);
        
        // When
        UserProfileDTO result = profileService.getProfile(creator.getId());
        
        // Then
        assertThat(result).isNotNull();
        assertThat(result.getFullName()).isEqualTo("Creator Name");
        assertThat(result.getEmail()).isEqualTo("creator@example.com");
    }
    
    @Test
    @DisplayName("Should create default profile if doesn't exist")
    void shouldCreateDefaultProfileIfDoesntExist() {
        // Given
        when(userRepository.findById(creator.getId())).thenReturn(Optional.of(creator));
        when(userProfileRepository.save(any())).thenAnswer(invocation -> invocation.getArgument(0));
        
        // When
        UserProfileDTO result = profileService.getProfile(creator.getId());
        
        // Then
        assertThat(result).isNotNull();
        verify(userProfileRepository).save(any(UserProfile.class));
    }
    
    @Test
    @DisplayName("Should update user profile")
    void shouldUpdateUserProfile() {
        // Given
        when(userRepository.findById(creator.getId())).thenReturn(Optional.of(creator));
        creator.setUserProfile(userProfile);
        when(userProfileRepository.save(any())).thenReturn(userProfile);
        when(userRepository.save(any())).thenReturn(creator);
        
        // When
        UserProfileDTO result = profileService.updateProfile(
                creator.getId(),
                "New Name",
                "+919876543210",
                "New bio"
        );
        
        // Then
        assertThat(result).isNotNull();
        assertThat(userProfile.getFullName()).isEqualTo("New Name");
        assertThat(userProfile.getBio()).isEqualTo("New bio");
        verify(userProfileRepository).save(userProfile);
    }
    
    @Test
    @DisplayName("Should upload avatar")
    void shouldUploadAvatar() {
        // Given
        String avatarUrl = "https://storage.example.com/avatars/user123/avatar.jpg";
        FileUploadResponse uploadResponse = FileUploadResponse.builder()
                .fileUrl(avatarUrl)
                .build();
        
        when(userRepository.findById(creator.getId())).thenReturn(Optional.of(creator));
        creator.setUserProfile(userProfile);
        userProfile.setAvatarUrl("old-avatar.jpg");
        when(storageService.uploadProfileAvatar(anyString(), any())).thenReturn(uploadResponse);
        when(userProfileRepository.save(any())).thenReturn(userProfile);
        
        // When
        String result = profileService.uploadAvatar(creator.getId(), file);
        
        // Then
        assertThat(result).isEqualTo(avatarUrl);
        verify(storageService).deleteFile("old-avatar.jpg");
        verify(storageService).uploadProfileAvatar(anyString(), any());
    }
    
    @Test
    @DisplayName("Should get creator profile")
    void shouldGetCreatorProfile() {
        // Given
        when(userRepository.findById(creator.getId())).thenReturn(Optional.of(creator));
        creator.setCreatorProfile(creatorProfile);
        
        // When
        CreatorProfileDTO result = profileService.getCreatorProfile(creator.getId());
        
        // Then
        assertThat(result).isNotNull();
        assertThat(result.getUsername()).isEqualTo("creator123");
        assertThat(result.getCategory()).isEqualTo("FASHION");
    }
    
    @Test
    @DisplayName("Should throw exception when user is not creator")
    void shouldThrowExceptionWhenUserIsNotCreator() {
        // Given
        when(userRepository.findById(brand.getId())).thenReturn(Optional.of(brand));
        
        // When/Then
        assertThatThrownBy(() -> profileService.getCreatorProfile(brand.getId()))
                .isInstanceOf(BusinessException.class)
                .hasMessageContaining("not a creator");
    }
    
    @Test
    @DisplayName("Should update creator profile")
    void shouldUpdateCreatorProfile() {
        // Given
        when(userRepository.findById(creator.getId())).thenReturn(Optional.of(creator));
        creator.setCreatorProfile(creatorProfile);
        when(creatorProfileRepository.existsByUsernameAndUserIdNot(anyString(), anyString()))
                .thenReturn(false);
        when(creatorProfileRepository.save(any())).thenReturn(creatorProfile);
        
        // When
        CreatorProfileDTO result = profileService.updateCreatorProfile(
                creator.getId(),
                "newusername",
                "BEAUTY",
                "https://instagram.com/newuser",
                null,
                null
        );
        
        // Then
        assertThat(result).isNotNull();
        assertThat(creatorProfile.getUsername()).isEqualTo("newusername");
        assertThat(creatorProfile.getCategory()).isEqualTo("BEAUTY");
        verify(creatorProfileRepository).save(creatorProfile);
    }
    
    @Test
    @DisplayName("Should throw exception when username already taken")
    void shouldThrowExceptionWhenUsernameAlreadyTaken() {
        // Given
        when(userRepository.findById(creator.getId())).thenReturn(Optional.of(creator));
        creator.setCreatorProfile(creatorProfile);
        when(creatorProfileRepository.existsByUsernameAndUserIdNot("taken", creator.getId()))
                .thenReturn(true);
        
        // When/Then
        assertThatThrownBy(() -> profileService.updateCreatorProfile(
                creator.getId(),
                "taken",
                null,
                null,
                null,
                null
        )).isInstanceOf(BusinessException.class)
                .hasMessageContaining("already taken");
    }
    
    @Test
    @DisplayName("Should add portfolio item")
    void shouldAddPortfolioItem() {
        // Given
        String mediaUrl = "https://storage.example.com/portfolio/item.jpg";
        FileUploadResponse uploadResponse = FileUploadResponse.builder()
                .fileUrl(mediaUrl)
                .fileType("image/jpeg")
                .build();
        
        when(userRepository.findById(creator.getId())).thenReturn(Optional.of(creator));
        creator.setCreatorProfile(creatorProfile);
        when(storageService.uploadPortfolioItem(anyString(), any())).thenReturn(uploadResponse);
        when(creatorProfileRepository.save(any())).thenReturn(creatorProfile);
        
        // When
        PortfolioItem result = profileService.addPortfolioItem(
                creator.getId(),
                "Test Item",
                "Test Description",
                file
        );
        
        // Then
        assertThat(result).isNotNull();
        assertThat(result.getTitle()).isEqualTo("Test Item");
        assertThat(result.getMediaUrl()).isEqualTo(mediaUrl);
        verify(storageService).uploadPortfolioItem(anyString(), any());
    }
    
    @Test
    @DisplayName("Should get brand profile")
    void shouldGetBrandProfile() {
        // Given
        when(userRepository.findById(brand.getId())).thenReturn(Optional.of(brand));
        brand.setBrandProfile(brandProfile);
        
        // When
        BrandProfileDTO result = profileService.getBrandProfile(brand.getId());
        
        // Then
        assertThat(result).isNotNull();
        assertThat(result.getCompanyName()).isEqualTo("Test Brand");
        assertThat(result.getIndustry()).isEqualTo("Fashion");
    }
    
    @Test
    @DisplayName("Should update brand profile")
    void shouldUpdateBrandProfile() {
        // Given
        when(userRepository.findById(brand.getId())).thenReturn(Optional.of(brand));
        brand.setBrandProfile(brandProfile);
        when(brandProfileRepository.save(any())).thenReturn(brandProfile);
        
        // When
        BrandProfileDTO result = profileService.updateBrandProfile(
                brand.getId(),
                "New Company",
                "22AAAAA0000A1Z5",
                "Tech",
                "https://example.com",
                "Company description"
        );
        
        // Then
        assertThat(result).isNotNull();
        assertThat(brandProfile.getCompanyName()).isEqualTo("New Company");
        assertThat(brandProfile.getIndustry()).isEqualTo("Tech");
        verify(brandProfileRepository).save(brandProfile);
    }
}

