# Code Comments and JavaDoc Guide

## Overview

This document outlines the code commenting standards for CreatorX. All public methods and complex business logic should be documented with JavaDoc comments.

## JavaDoc Standards

### Class-Level Documentation

```java
/**
 * Service for managing campaigns.
 * 
 * This service handles all campaign-related operations including creation,
 * updates, retrieval, and deletion. It enforces business rules such as
 * ownership verification and status transitions.
 * 
 * @author CreatorX Team
 * @version 1.0
 * @since 1.0
 */
@Service
public class CampaignService {
    // ...
}
```

### Method Documentation

#### Simple Methods

```java
/**
 * Get campaign by ID.
 * 
 * @param id Campaign UUID
 * @return CampaignDTO or null if not found
 */
public CampaignDTO getCampaignById(String id) {
    // ...
}
```

#### Complex Methods

```java
/**
 * Get campaigns with filters and pagination.
 * 
 * Retrieves campaigns based on various filter criteria. Results are filtered
 * based on the current user's role:
 * - Creators see only ACTIVE campaigns
 * - Brands see their own campaigns and ACTIVE campaigns
 * - Admins see all campaigns
 * 
 * Search queries are sanitized to prevent SQL injection attacks.
 * 
 * @param category Filter by campaign category (e.g., "Fashion", "Food")
 * @param platform Filter by platform (INSTAGRAM, YOUTUBE, etc.)
 * @param budgetMin Minimum budget filter (inclusive)
 * @param budgetMax Maximum budget filter (inclusive)
 * @param status Filter by campaign status (ACTIVE, DRAFT, etc.)
 * @param search Full-text search query (sanitized before use)
 * @param page Page number (0-indexed)
 * @param size Page size (max 100, default 20)
 * @param currentUser The authenticated user (null for public access)
 * @return Paginated list of CampaignDTOs matching the filters
 * @throws BusinessException if search query is invalid after sanitization
 * @throws IllegalArgumentException if page size exceeds maximum
 */
@Transactional(readOnly = true)
public Page<CampaignDTO> getCampaigns(
    String category,
    CampaignPlatform platform,
    BigDecimal budgetMin,
    BigDecimal budgetMax,
    CampaignStatus status,
    String search,
    int page,
    int size,
    User currentUser
) {
    // ...
}
```

### Parameter Documentation

- Use `@param` for all parameters
- Describe what the parameter is and any constraints
- Include units if applicable (e.g., "amount in INR")

### Return Value Documentation

- Use `@return` to describe the return value
- Mention null possibility if applicable
- Describe the structure for complex objects

### Exception Documentation

- Use `@throws` for all checked and important unchecked exceptions
- Explain when the exception is thrown
- Include business context

### Inline Comments

Use inline comments for:
- Complex algorithms
- Business logic explanations
- Workarounds or temporary solutions
- Non-obvious code

```java
// Sanitize search query to prevent SQL injection
// Removes dangerous characters and limits length to 200 characters
String sanitizedQuery = searchQuerySanitizer.sanitize(query);

// Verify ownership - brands can only update their own campaigns
if (!campaign.getBrand().getId().equals(brandId)) {
    throw new UnauthorizedException("You can only update your own campaigns");
}
```

## Examples

### Service Method

```java
/**
 * Submit application to campaign.
 * 
 * Creates a new application for a creator to a campaign. Validates:
 * - Creator role
 * - Campaign exists and is ACTIVE
 * - Application deadline hasn't passed
 * - No duplicate application
 * - Creator hasn't exceeded application limit (50 active)
 * - KYC verification (if required)
 * 
 * Sends notification to brand upon successful submission.
 * 
 * @param creatorId UUID of the creator submitting the application
 * @param campaignId UUID of the campaign to apply to
 * @param pitchText The creator's pitch explaining why they're perfect for the campaign
 * @param availability Expected timeline for completing deliverables
 * @return The created ApplicationDTO
 * @throws ResourceNotFoundException if creator or campaign not found
 * @throws BusinessException if validation fails (deadline passed, limit exceeded, etc.)
 * @throws DuplicateApplicationException if creator already applied
 * @throws KYCNotVerifiedException if KYC verification required but not completed
 */
@Transactional
public ApplicationDTO submitApplication(
    String creatorId,
    String campaignId,
    String pitchText,
    String availability
) {
    // Implementation
}
```

### Controller Method

```java
/**
 * Submit application to campaign (Creator only).
 * 
 * Endpoint: POST /api/v1/applications
 * 
 * Requires CREATOR role. Creates a new application for the authenticated
 * creator to the specified campaign.
 * 
 * @param request Application request containing campaignId, pitchText, and availability
 * @return Created ApplicationDTO with 201 status
 * @throws MethodArgumentNotValidException if request validation fails
 * @throws BusinessException if business rules are violated
 */
@PostMapping
@PreAuthorize("hasRole('CREATOR')")
@Operation(summary = "Submit application", description = "Submit application to a campaign (Creator only)")
public ResponseEntity<ApplicationDTO> submitApplication(@Valid @RequestBody ApplicationRequest request) {
    // Implementation
}
```

## Best Practices

1. **Be Concise but Complete**: Explain what, why, and when
2. **Use Examples**: Include examples for complex parameters
3. **Document Side Effects**: Mention cache eviction, notifications, etc.
4. **Keep Updated**: Update comments when code changes
5. **Avoid Redundancy**: Don't repeat what the code clearly shows
6. **Use Standard Tags**: @param, @return, @throws, @see, @since, @author

## Tools

- **IDE Support**: Most IDEs generate JavaDoc from comments
- **JavaDoc Tool**: `javadoc` command generates HTML documentation
- **SonarQube**: Checks for missing JavaDoc on public methods

---

**Last Updated**: [Date]  
**Version**: 1.0.0

