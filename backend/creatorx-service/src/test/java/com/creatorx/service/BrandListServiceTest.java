package com.creatorx.service;

import com.creatorx.repository.BrandListCreatorRepository;
import com.creatorx.repository.BrandListRepository;
import com.creatorx.repository.CampaignRepository;
import com.creatorx.repository.TeamMemberRepository;
import com.creatorx.repository.UserRepository;
import com.creatorx.repository.entity.BrandList;
import com.creatorx.repository.entity.BrandListCreator;
import com.creatorx.repository.entity.Campaign;
import com.creatorx.repository.entity.User;
import com.creatorx.service.dto.BrandListResponse;
import com.creatorx.service.testdata.TestDataBuilder;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.mockito.junit.jupiter.MockitoSettings;
import org.mockito.quality.Strictness;

import java.util.List;
import java.util.Optional;
import java.util.UUID;
import java.util.concurrent.atomic.AtomicReference;

import static org.assertj.core.api.Assertions.assertThat;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.ArgumentMatchers.anyString;
import static org.mockito.Mockito.never;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.when;

/**
 * BrandListServiceTest.
 *
 * Unit tests for shared brand creator lists, which replaced browser-only
 * localStorage shortlists with backend persistence.
 */
@ExtendWith(MockitoExtension.class)
@MockitoSettings(strictness = Strictness.LENIENT)
@DisplayName("BrandListService Unit Tests")
class BrandListServiceTest {
    @Mock
    private BrandListRepository brandListRepository;

    @Mock
    private BrandListCreatorRepository brandListCreatorRepository;

    @Mock
    private UserRepository userRepository;

    @Mock
    private CampaignRepository campaignRepository;

    @Mock
    private TeamMemberRepository teamMemberRepository;

    @InjectMocks
    private BrandListService brandListService;

    private String brandId;
    private String creatorId;
    private String campaignId;
    private User brand;
    private User creator;
    private Campaign campaign;

    @BeforeEach
    void setUp() {
        brandId = UUID.randomUUID().toString();
        creatorId = UUID.randomUUID().toString();
        campaignId = UUID.randomUUID().toString();

        brand = TestDataBuilder.user().asBrand().withId(brandId).build();
        creator = TestDataBuilder.user().asCreator().withId(creatorId).build();
        campaign = TestDataBuilder.campaign().withId(campaignId).withBrand(brand).build();

        when(teamMemberRepository.findByUserId(brandId)).thenReturn(List.of());
        when(userRepository.findById(brandId)).thenReturn(Optional.of(brand));
        when(userRepository.findById(creatorId)).thenReturn(Optional.of(creator));
        when(campaignRepository.findById(campaignId)).thenReturn(Optional.of(campaign));
    }

    @Test
    @DisplayName("getLists returns empty list when brand has no lists")
    void getLists_whenNoneExist_returnsEmptyList() {
        when(brandListRepository.findByBrandIdOrderByCreatedAtDesc(brandId)).thenReturn(List.of());

        List<BrandListResponse> result = brandListService.getLists(brandId, null);

        assertThat(result).isEmpty();
    }

    @Test
    @DisplayName("addToShortlist creates a new list when none exists")
    void addToShortlist_whenNoListExists_createsNewList() {
        AtomicReference<BrandListCreator> savedEntry = new AtomicReference<>();
        when(brandListRepository.findByBrandIdAndCampaignIdIsNullOrderByCreatedAtDesc(brandId)).thenReturn(List.of());
        when(brandListRepository.save(any(BrandList.class))).thenAnswer(invocation -> {
            BrandList list = invocation.getArgument(0);
            if (list.getId() == null) {
                list.setId(UUID.randomUUID().toString());
            }
            return list;
        });
        when(brandListCreatorRepository.existsByListIdAndCreatorId(anyString(), anyString())).thenReturn(false);
        when(brandListCreatorRepository.save(any(BrandListCreator.class))).thenAnswer(invocation -> {
            BrandListCreator entry = invocation.getArgument(0);
            if (entry.getId() == null) {
                entry.setId(UUID.randomUUID().toString());
            }
            savedEntry.set(entry);
            return entry;
        });
        when(brandListCreatorRepository.findByListId(anyString())).thenAnswer(invocation ->
                savedEntry.get() == null ? List.of() : List.of(savedEntry.get()));

        BrandListResponse result = brandListService.addToShortlist(brandId, creatorId, null, null);

        assertThat(result.getName()).isEqualTo("Shortlist");
        assertThat(result.getBrandId()).isEqualTo(brandId);
        assertThat(result.getCreatorIds()).containsExactly(creatorId);
        verify(brandListCreatorRepository).save(any(BrandListCreator.class));
    }

    @Test
    @DisplayName("addToShortlist is idempotent when creator already exists")
    void addToShortlist_whenCreatorAlreadyInList_doesNotDuplicate() {
        BrandList existingList = buildList(null);
        BrandListCreator existingEntry = BrandListCreator.builder()
                .id(UUID.randomUUID().toString())
                .list(existingList)
                .creatorId(creatorId)
                .addedBy(brand)
                .build();

        when(brandListRepository.findByBrandIdAndCampaignIdIsNullOrderByCreatedAtDesc(brandId))
                .thenReturn(List.of(existingList));
        when(brandListCreatorRepository.existsByListIdAndCreatorId(existingList.getId(), creatorId)).thenReturn(true);
        when(brandListCreatorRepository.findByListId(existingList.getId())).thenReturn(List.of(existingEntry));

        BrandListResponse result = brandListService.addToShortlist(brandId, creatorId, null, null);

        assertThat(result.getCreatorIds()).containsExactly(creatorId);
        verify(brandListCreatorRepository, never()).save(any(BrandListCreator.class));
    }

    @Test
    @DisplayName("removeFromShortlist removes creator from all matching lists")
    void removeFromShortlist_removesCreatorFromAllMatchingLists() {
        BrandList firstList = buildList(null);
        BrandList secondList = buildList(null);
        when(brandListRepository.findByBrandIdOrderByCreatedAtDesc(brandId))
                .thenReturn(List.of(firstList, secondList));

        brandListService.removeFromShortlist(brandId, creatorId, null);

        verify(brandListCreatorRepository).deleteByListIdAndCreatorId(firstList.getId(), creatorId);
        verify(brandListCreatorRepository).deleteByListIdAndCreatorId(secondList.getId(), creatorId);
    }

    @Test
    @DisplayName("getLists with campaignId filters correctly")
    void getLists_withCampaignId_filtersCorrectly() {
        BrandList campaignList = buildList(campaign);
        when(brandListRepository.findByBrandIdAndCampaignIdOrderByCreatedAtDesc(brandId, campaignId))
                .thenReturn(List.of(campaignList));
        when(brandListCreatorRepository.findByListId(campaignList.getId())).thenReturn(List.of());

        List<BrandListResponse> result = brandListService.getLists(brandId, campaignId);

        assertThat(result).hasSize(1);
        assertThat(result.get(0).getCampaignId()).isEqualTo(campaignId);
    }

    /**
     * Build a persisted list for repository mock responses.
     */
    private BrandList buildList(Campaign listCampaign) {
        return BrandList.builder()
                .id(UUID.randomUUID().toString())
                .brand(brand)
                .campaign(listCampaign)
                .name("Shortlist")
                .createdBy(brand)
                .build();
    }
}
