package com.creatorx.service.mapper;

import com.creatorx.repository.entity.DeliverableSubmission;
import com.creatorx.service.dto.CampaignDeliverableDTO;
import com.creatorx.service.dto.DeliverableDTO;
import org.mapstruct.Mapper;
import org.mapstruct.Mapping;
import org.mapstruct.NullValuePropertyMappingStrategy;

import java.util.List;

@Mapper(componentModel = "spring", nullValuePropertyMappingStrategy = NullValuePropertyMappingStrategy.IGNORE)
public interface DeliverableMapper {
    
    @Mapping(target = "campaignDeliverable", expression = "java(mapCampaignDeliverable(submission.getCampaignDeliverable()))")
    @Mapping(target = "feedback", expression = "java(submission.getReview() != null ? submission.getReview().getFeedback() : null)")
    @Mapping(target = "revisionNotes", expression = "java(submission.getReview() != null ? submission.getReview().getRevisionNotes() : null)")
    @Mapping(target = "reviewedAt", expression = "java(submission.getReview() != null ? submission.getReview().getReviewedAt() : null)")
    @Mapping(target = "versionNumber", ignore = true) // Will be set manually
    @Mapping(target = "isLatest", ignore = true) // Will be set manually
    @Mapping(target = "fileName", ignore = true) // Will be extracted from fileUrl if needed
    @Mapping(target = "fileType", ignore = true) // Will be extracted from fileUrl if needed
    @Mapping(target = "fileSize", ignore = true) // Not stored in entity
    DeliverableDTO toDTO(DeliverableSubmission submission);
    
    List<DeliverableDTO> toDTOList(List<DeliverableSubmission> submissions);
    
    default CampaignDeliverableDTO mapCampaignDeliverable(com.creatorx.repository.entity.CampaignDeliverable campaignDeliverable) {
        if (campaignDeliverable == null) {
            return null;
        }
        
        return CampaignDeliverableDTO.builder()
                .id(campaignDeliverable.getId())
                .title(campaignDeliverable.getTitle())
                .description(campaignDeliverable.getDescription())
                .type(mapDeliverableType(campaignDeliverable.getType()))
                .dueDate(campaignDeliverable.getDueDate())
                .isMandatory(campaignDeliverable.getIsMandatory())
                .orderIndex(campaignDeliverable.getOrderIndex())
                .build();
    }
    
    default CampaignDeliverableDTO.CampaignDeliverableType mapDeliverableType(com.creatorx.repository.entity.CampaignDeliverable.DeliverableType type) {
        if (type == null) {
            return null;
        }
        return CampaignDeliverableDTO.CampaignDeliverableType.valueOf(type.name());
    }
}

