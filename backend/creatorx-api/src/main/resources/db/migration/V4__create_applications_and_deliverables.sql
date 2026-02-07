-- Migration V4: Create Applications and Deliverable Submission tables

-- Applications (creator applications to campaigns)
CREATE TABLE applications (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    campaign_id UUID NOT NULL REFERENCES campaigns(id) ON DELETE CASCADE,
    creator_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    status application_status NOT NULL DEFAULT 'APPLIED',
    pitch_text TEXT NOT NULL,
    expected_timeline VARCHAR(255),
    proposed_budget DECIMAL(12, 2),
    applied_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT CURRENT_TIMESTAMP,
    
    CONSTRAINT chk_unique_application UNIQUE (campaign_id, creator_id),
    CONSTRAINT chk_proposed_budget CHECK (proposed_budget IS NULL OR proposed_budget > 0)
);

COMMENT ON TABLE applications IS 'Creator applications to brand campaigns';
COMMENT ON COLUMN applications.pitch_text IS 'Creator pitch explaining why they should be selected';
COMMENT ON COLUMN applications.proposed_budget IS 'Optional: Creator proposed budget if different from campaign budget';
COMMENT ON COLUMN applications.status IS 'Application workflow status';

-- Application Feedback (feedback from brand to creator)
CREATE TABLE application_feedback (
    application_id UUID PRIMARY KEY REFERENCES applications(id) ON DELETE CASCADE,
    feedback_text TEXT,
    rejected_reason TEXT,
    shortlisted_at TIMESTAMP WITH TIME ZONE,
    selected_at TIMESTAMP WITH TIME ZONE,
    rejected_at TIMESTAMP WITH TIME ZONE,
    created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT CURRENT_TIMESTAMP,
    
    CONSTRAINT chk_feedback_status CHECK (
        (rejected_reason IS NOT NULL AND rejected_at IS NOT NULL) OR
        (rejected_reason IS NULL)
    )
);

COMMENT ON TABLE application_feedback IS 'Brand feedback on creator applications';
COMMENT ON COLUMN application_feedback.rejected_reason IS 'Reason for rejection if application was rejected';

-- Deliverable Submissions (creator submissions of deliverables)
CREATE TABLE deliverable_submissions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    application_id UUID NOT NULL REFERENCES applications(id) ON DELETE CASCADE,
    campaign_deliverable_id UUID NOT NULL REFERENCES campaign_deliverables(id) ON DELETE RESTRICT,
    file_url TEXT NOT NULL,
    description TEXT,
    status submission_status NOT NULL DEFAULT 'PENDING',
    submitted_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT CURRENT_TIMESTAMP,
    
    CONSTRAINT chk_unique_submission UNIQUE (application_id, campaign_deliverable_id)
);

COMMENT ON TABLE deliverable_submissions IS 'Creator submissions for campaign deliverables';
COMMENT ON COLUMN deliverable_submissions.file_url IS 'URL to submitted file (stored in Supabase Storage)';
COMMENT ON COLUMN deliverable_submissions.status IS 'Review status of the submission';

-- Deliverable Reviews (brand reviews of submissions)
CREATE TABLE deliverable_reviews (
    submission_id UUID PRIMARY KEY REFERENCES deliverable_submissions(id) ON DELETE CASCADE,
    reviewer_id UUID NOT NULL REFERENCES users(id) ON DELETE RESTRICT,
    status submission_status NOT NULL,
    feedback TEXT,
    revision_notes TEXT,
    reviewed_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT CURRENT_TIMESTAMP
    -- Note: reviewer role validation (must be BRAND) is enforced at application layer
);

COMMENT ON TABLE deliverable_reviews IS 'Brand reviews and feedback on deliverable submissions';
COMMENT ON COLUMN deliverable_reviews.revision_notes IS 'Specific notes for revision if status is REVISION_REQUESTED';

-- Indexes for application and deliverable tables
CREATE INDEX idx_applications_campaign_id ON applications(campaign_id);
CREATE INDEX idx_applications_creator_id ON applications(creator_id);
CREATE INDEX idx_applications_status ON applications(status);
CREATE INDEX idx_applications_applied_at ON applications(applied_at);
CREATE INDEX idx_applications_campaign_status ON applications(campaign_id, status);
CREATE INDEX idx_applications_creator_status ON applications(creator_id, status);

CREATE INDEX idx_deliverable_submissions_application_id ON deliverable_submissions(application_id);
CREATE INDEX idx_deliverable_submissions_deliverable_id ON deliverable_submissions(campaign_deliverable_id);
CREATE INDEX idx_deliverable_submissions_status ON deliverable_submissions(status);
CREATE INDEX idx_deliverable_submissions_submitted_at ON deliverable_submissions(submitted_at);

CREATE INDEX idx_deliverable_reviews_reviewer_id ON deliverable_reviews(reviewer_id);
CREATE INDEX idx_deliverable_reviews_status ON deliverable_reviews(status);




