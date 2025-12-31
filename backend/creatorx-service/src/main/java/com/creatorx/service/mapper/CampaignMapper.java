package com.creatorx.service.mapper;

import com.creatorx.repository.entity.Campaign;
import com.creatorx.repository.entity.CampaignDeliverable;
import com.creatorx.repository.entity.User;
import com.creatorx.service.dto.CampaignDTO;
import com.creatorx.service.dto.CampaignDeliverableDTO;
import org.mapstruct.Builder;
import org.mapstruct.Mapper;
import org.mapstruct.Mapping;
import org.mapstruct.MappingTarget;
import org.mapstruct.NullValuePropertyMappingStrategy;

import java.util.List;

@Mapper(
        componentModel = "spring",
        nullValuePropertyMappingStrategy = NullValuePropertyMappingStrategy.IGNORE,
        builder = @Builder(disableBuilder = true)
)
public interface CampaignMapper {
    
    @Mapping(target = "brand", expression = "java(mapBrandInfo(campaign.getBrand()))")
    @Mapping(target = "deliverables", expression = "java(mapDeliverables(campaign.getCampaignDeliverables()))")
    @Mapping(target = "applicationCount", ignore = true)
    @Mapping(target = "isSaved", ignore = true)
    @Mapping(target = "reviewedBy", expression = "java(mapReviewedBy(campaign.getReviewedBy()))")
    CampaignDTO toDTO(Campaign campaign);
    
    List<CampaignDTO> toDTOList(List<Campaign> campaigns);
    
    @Mapping(target = "id", ignore = true)
    @Mapping(target = "brand", ignore = true)
    @Mapping(target = "campaignDeliverables", ignore = true)
    @Mapping(target = "applications", ignore = true)
    @Mapping(target = "activeCampaigns", ignore = true)
    @Mapping(target = "createdAt", ignore = true)
    @Mapping(target = "updatedAt", ignore = true)
    @Mapping(target = "version", ignore = true)
    @Mapping(target = "selectedCreatorsCount", ignore = true)
    @Mapping(target = "reviewReason", ignore = true)
    @Mapping(target = "reviewedBy", ignore = true)
    @Mapping(target = "reviewedAt", ignore = true)
    Campaign toEntity(CampaignDTO dto);
    
    @Mapping(target = "id", ignore = true)
    @Mapping(target = "brand", ignore = true)
    @Mapping(target = "campaignDeliverables", ignore = true)
    @Mapping(target = "applications", ignore = true)
    @Mapping(target = "activeCampaigns", ignore = true)
    @Mapping(target = "createdAt", ignore = true)
    @Mapping(target = "updatedAt", ignore = true)
    @Mapping(target = "version", ignore = true)
    @Mapping(target = "reviewReason", ignore = true)
    @Mapping(target = "reviewedBy", ignore = true)
    @Mapping(target = "reviewedAt", ignore = true)
    void updateEntityFromDTO(CampaignDTO dto, @MappingTarget Campaign entity);
    
    default CampaignDTO.BrandInfo mapBrandInfo(User brand) {
        if (brand == null) {
            return null;
        }
        
        CampaignDTO.BrandInfo brandInfo = new CampaignDTO.BrandInfo();
        brandInfo.setId(brand.getId());
        brandInfo.setEmail(brand.getEmail());
        
        // Get brand profile if available
        if (brand.getBrandProfile() != null) {
            brandInfo.setName(brand.getBrandProfile().getCompanyName());
            brandInfo.setLogoUrl(brand.getBrandProfile().getCompanyLogoUrl());
            brandInfo.setVerified(brand.getBrandProfile().getVerified());
        } else if (brand.getUserProfile() != null) {
            brandInfo.setName(brand.getUserProfile().getFullName());
        }
        
        return brandInfo;
    }
    
    default List<CampaignDeliverableDTO> mapDeliverables(List<CampaignDeliverable> deliverables) {
        if (deliverables == null) {
            return List.of();
        }
        return deliverables.stream()
                .map(this::mapDeliverable)
                .toList();
    }
    
    default CampaignDeliverableDTO mapDeliverable(CampaignDeliverable deliverable) {
        if (deliverable == null) {
            return null;
        }
        
        return CampaignDeliverableDTO.builder()
                .id(deliverable.getId())
                .title(deliverable.getTitle())
                .description(deliverable.getDescription())
                .type(mapDeliverableType(deliverable.getType()))
                .dueDate(deliverable.getDueDate())
                .isMandatory(deliverable.getIsMandatory())
                .orderIndex(deliverable.getOrderIndex())
                .build();
    }
    
    default CampaignDeliverableDTO.CampaignDeliverableType mapDeliverableType(CampaignDeliverable.DeliverableType type) {
        if (type == null) {
            return null;
        }
        return CampaignDeliverableDTO.CampaignDeliverableType.valueOf(type.name());
    }

    default String mapReviewedBy(User reviewedBy) {
        return reviewedBy != null ? reviewedBy.getId() : null;
    }
}
