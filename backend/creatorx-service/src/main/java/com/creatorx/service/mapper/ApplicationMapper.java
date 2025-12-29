package com.creatorx.service.mapper;

import com.creatorx.repository.entity.Application;
import com.creatorx.repository.entity.User;
import com.creatorx.service.dto.ApplicationDTO;
import org.mapstruct.Mapper;
import org.mapstruct.Mapping;
import org.mapstruct.NullValuePropertyMappingStrategy;

import java.util.List;

@Mapper(componentModel = "spring", nullValuePropertyMappingStrategy = NullValuePropertyMappingStrategy.IGNORE)
public interface ApplicationMapper {
    
    @Mapping(target = "campaign", ignore = true) // Will be set manually in service
    @Mapping(target = "creator", expression = "java(mapCreatorInfo(application.getCreator()))")
    @Mapping(target = "rejectionReason", expression = "java(application.getFeedback() != null ? application.getFeedback().getRejectedReason() : null)")
    ApplicationDTO toDTO(Application application);
    
    List<ApplicationDTO> toDTOList(List<Application> applications);
    
    default ApplicationDTO.CreatorInfo mapCreatorInfo(User creator) {
        if (creator == null) {
            return null;
        }
        
        ApplicationDTO.CreatorInfo creatorInfo = new ApplicationDTO.CreatorInfo();
        creatorInfo.setId(creator.getId());
        creatorInfo.setEmail(creator.getEmail());
        
        // Get creator profile if available
        if (creator.getCreatorProfile() != null) {
            creatorInfo.setUsername(creator.getCreatorProfile().getUsername());
            creatorInfo.setVerified(creator.getCreatorProfile().getVerified());
        }
        
        // Get user profile for name and avatar
        if (creator.getUserProfile() != null) {
            creatorInfo.setName(creator.getUserProfile().getFullName());
            creatorInfo.setAvatarUrl(creator.getUserProfile().getAvatarUrl());
        }
        
        return creatorInfo;
    }
}

