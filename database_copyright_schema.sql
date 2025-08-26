-- Copyright Compliance and Content Attribution Schema
-- This schema supports DMCA safe harbor compliance and content tracking

-- Content attribution tracking table
CREATE TABLE IF NOT EXISTS content_attributions (
    id SERIAL PRIMARY KEY,
    article_id TEXT NOT NULL,
    user_id TEXT NOT NULL,
    content_type VARCHAR(20) NOT NULL CHECK (content_type IN ('original', 'fair-use', 'public-domain', 'licensed')),
    source_url TEXT,
    original_author TEXT,
    ai_generated BOOLEAN DEFAULT true,
    has_permission BOOLEAN DEFAULT false,
    created_at TIMESTAMP DEFAULT NOW(),
    updated_at TIMESTAMP DEFAULT NOW(),
    
    -- Foreign key constraints
    FOREIGN KEY (user_id) REFERENCES user_profiles(id) ON DELETE CASCADE
);

-- Copyright infringement reports table (DMCA compliance)
CREATE TABLE IF NOT EXISTS copyright_reports (
    id SERIAL PRIMARY KEY,
    article_id TEXT NOT NULL,
    reporter_name VARCHAR(255) NOT NULL,
    reporter_email VARCHAR(255) NOT NULL,
    reporter_organization VARCHAR(255),
    copyright_owner VARCHAR(255) NOT NULL,
    infringement_description TEXT NOT NULL,
    original_work_description TEXT NOT NULL,
    infringing_urls TEXT[] NOT NULL,
    contact_address TEXT,
    phone_number VARCHAR(50),
    good_faith_statement TEXT NOT NULL,
    accuracy_statement TEXT NOT NULL,
    authorization_statement TEXT NOT NULL,
    electronic_signature VARCHAR(255) NOT NULL,
    status VARCHAR(20) DEFAULT 'pending' CHECK (status IN ('pending', 'reviewing', 'valid', 'invalid', 'resolved')),
    dmca_agent_notified BOOLEAN DEFAULT false,
    content_removed BOOLEAN DEFAULT false,
    counter_notice_received BOOLEAN DEFAULT false,
    created_at TIMESTAMP DEFAULT NOW(),
    resolved_at TIMESTAMP,
    notes TEXT
);

-- Counter-notification table
CREATE TABLE IF NOT EXISTS counter_notifications (
    id SERIAL PRIMARY KEY,
    copyright_report_id INTEGER NOT NULL,
    user_id TEXT NOT NULL,
    counter_party_name VARCHAR(255) NOT NULL,
    counter_party_email VARCHAR(255) NOT NULL,
    counter_party_address TEXT NOT NULL,
    counter_party_phone VARCHAR(50),
    material_description TEXT NOT NULL,
    good_faith_statement TEXT NOT NULL,
    consent_to_jurisdiction TEXT NOT NULL,
    accept_service_of_process TEXT NOT NULL,
    electronic_signature VARCHAR(255) NOT NULL,
    status VARCHAR(20) DEFAULT 'pending' CHECK (status IN ('pending', 'reviewing', 'valid', 'invalid', 'processed')),
    created_at TIMESTAMP DEFAULT NOW(),
    processed_at TIMESTAMP,
    
    FOREIGN KEY (copyright_report_id) REFERENCES copyright_reports(id) ON DELETE CASCADE,
    FOREIGN KEY (user_id) REFERENCES user_profiles(id) ON DELETE CASCADE
);

-- User copyright strikes tracking (repeat infringer policy)
CREATE TABLE IF NOT EXISTS user_copyright_strikes (
    id SERIAL PRIMARY KEY,
    user_id TEXT NOT NULL,
    copyright_report_id INTEGER NOT NULL,
    strike_number INTEGER NOT NULL,
    strike_type VARCHAR(20) DEFAULT 'warning' CHECK (strike_type IN ('warning', 'suspension', 'termination')),
    description TEXT,
    expires_at TIMESTAMP,
    created_at TIMESTAMP DEFAULT NOW(),
    
    FOREIGN KEY (user_id) REFERENCES user_profiles(id) ON DELETE CASCADE,
    FOREIGN KEY (copyright_report_id) REFERENCES copyright_reports(id) ON DELETE CASCADE
);

-- DMCA agent contact information (required for safe harbor)
CREATE TABLE IF NOT EXISTS dmca_agents (
    id SERIAL PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    organization VARCHAR(255) NOT NULL,
    address TEXT NOT NULL,
    phone VARCHAR(50) NOT NULL,
    email VARCHAR(255) NOT NULL,
    fax VARCHAR(50),
    is_active BOOLEAN DEFAULT true,
    uspto_registered BOOLEAN DEFAULT false,
    registration_number VARCHAR(100),
    created_at TIMESTAMP DEFAULT NOW(),
    updated_at TIMESTAMP DEFAULT NOW()
);

-- Insert default DMCA agent (update with your actual information)
INSERT INTO dmca_agents (name, organization, address, phone, email) 
VALUES (
    'DMCA Agent',
    'ShareX AI',
    'Your Company Address, City, State, ZIP Code',
    '+1-XXX-XXX-XXXX',
    'dmca@sharex.ai'
) ON CONFLICT DO NOTHING;

-- Content fingerprinting for duplicate detection (optional)
CREATE TABLE IF NOT EXISTS content_fingerprints (
    id SERIAL PRIMARY KEY,
    article_id TEXT NOT NULL,
    content_hash VARCHAR(64) NOT NULL,
    similarity_hash VARCHAR(64),
    created_at TIMESTAMP DEFAULT NOW(),
    
    UNIQUE(content_hash)
);

-- Add indexes for performance
CREATE INDEX IF NOT EXISTS idx_content_attributions_article_id ON content_attributions(article_id);
CREATE INDEX IF NOT EXISTS idx_content_attributions_user_id ON content_attributions(user_id);
CREATE INDEX IF NOT EXISTS idx_copyright_reports_status ON copyright_reports(status);
CREATE INDEX IF NOT EXISTS idx_copyright_reports_article_id ON copyright_reports(article_id);
CREATE INDEX IF NOT EXISTS idx_user_copyright_strikes_user_id ON user_copyright_strikes(user_id);
CREATE INDEX IF NOT EXISTS idx_content_fingerprints_hash ON content_fingerprints(content_hash);

-- RLS Policies
ALTER TABLE content_attributions ENABLE ROW LEVEL SECURITY;
ALTER TABLE copyright_reports ENABLE ROW LEVEL SECURITY;
ALTER TABLE counter_notifications ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_copyright_strikes ENABLE ROW LEVEL SECURITY;
ALTER TABLE content_fingerprints ENABLE ROW LEVEL SECURITY;

-- Users can only see their own attribution records
CREATE POLICY "Users can view own attributions" ON content_attributions
    FOR SELECT USING (user_id = auth.uid()::text);

CREATE POLICY "Users can insert own attributions" ON content_attributions
    FOR INSERT WITH CHECK (user_id = auth.uid()::text);

-- Copyright reports are public for viewing (transparency)
CREATE POLICY "Copyright reports are publicly viewable" ON copyright_reports
    FOR SELECT USING (true);

-- Only authenticated users can submit copyright reports
CREATE POLICY "Authenticated users can submit copyright reports" ON copyright_reports
    FOR INSERT WITH CHECK (auth.role() = 'authenticated');

-- Users can view their own strikes
CREATE POLICY "Users can view own strikes" ON user_copyright_strikes
    FOR SELECT USING (user_id = auth.uid()::text);

-- Admin policies (require admin role in user_profiles)
CREATE POLICY "Admins can manage all copyright data" ON content_attributions
    FOR ALL USING (
        EXISTS (
            SELECT 1 FROM user_profiles 
            WHERE id = auth.uid()::text AND role = 'admin'
        )
    );

CREATE POLICY "Admins can manage copyright reports" ON copyright_reports
    FOR ALL USING (
        EXISTS (
            SELECT 1 FROM user_profiles 
            WHERE id = auth.uid()::text AND role = 'admin'
        )
    );

CREATE POLICY "Admins can manage counter notifications" ON counter_notifications
    FOR ALL USING (
        EXISTS (
            SELECT 1 FROM user_profiles 
            WHERE id = auth.uid()::text AND role = 'admin'
        )
    );

CREATE POLICY "Admins can manage user strikes" ON user_copyright_strikes
    FOR ALL USING (
        EXISTS (
            SELECT 1 FROM user_profiles 
            WHERE id = auth.uid()::text AND role = 'admin'
        )
    );

-- Functions for copyright compliance

-- Function to check if user has too many strikes
CREATE OR REPLACE FUNCTION check_user_copyright_status(target_user_id TEXT)
RETURNS TABLE (
    total_strikes INTEGER,
    active_strikes INTEGER,
    is_suspended BOOLEAN,
    is_terminated BOOLEAN,
    can_post_content BOOLEAN
) AS $$
BEGIN
    RETURN QUERY
    SELECT 
        COUNT(*)::INTEGER as total_strikes,
        COUNT(CASE WHEN expires_at > NOW() OR expires_at IS NULL THEN 1 END)::INTEGER as active_strikes,
        EXISTS(
            SELECT 1 FROM user_copyright_strikes 
            WHERE user_id = target_user_id 
            AND strike_type = 'suspension' 
            AND (expires_at > NOW() OR expires_at IS NULL)
        ) as is_suspended,
        EXISTS(
            SELECT 1 FROM user_copyright_strikes 
            WHERE user_id = target_user_id 
            AND strike_type = 'termination'
        ) as is_terminated,
        NOT EXISTS(
            SELECT 1 FROM user_copyright_strikes 
            WHERE user_id = target_user_id 
            AND strike_type IN ('suspension', 'termination')
            AND (expires_at > NOW() OR expires_at IS NULL OR strike_type = 'termination')
        ) as can_post_content
    FROM user_copyright_strikes 
    WHERE user_id = target_user_id;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function to create content hash for duplicate detection
CREATE OR REPLACE FUNCTION create_content_fingerprint(
    p_article_id TEXT,
    p_content TEXT
) RETURNS TEXT AS $$
DECLARE
    content_hash VARCHAR(64);
    similarity_hash VARCHAR(64);
BEGIN
    -- Create SHA-256 hash of content
    content_hash := encode(digest(p_content, 'sha256'), 'hex');
    
    -- Create similarity hash (simple approach - could use more sophisticated methods)
    similarity_hash := encode(digest(
        lower(regexp_replace(p_content, '[^a-zA-Z0-9\s]', '', 'g')), 
        'sha256'
    ), 'hex');
    
    -- Insert or update fingerprint
    INSERT INTO content_fingerprints (article_id, content_hash, similarity_hash)
    VALUES (p_article_id, content_hash, similarity_hash)
    ON CONFLICT (content_hash) DO NOTHING;
    
    RETURN content_hash;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function to find similar content
CREATE OR REPLACE FUNCTION find_similar_content(
    p_content_hash VARCHAR(64),
    p_exclude_article_id TEXT DEFAULT NULL
) RETURNS TABLE (
    article_id TEXT,
    content_hash VARCHAR(64),
    similarity_score FLOAT
) AS $$
BEGIN
    RETURN QUERY
    SELECT 
        cf.article_id,
        cf.content_hash,
        1.0 as similarity_score  -- Exact match
    FROM content_fingerprints cf
    WHERE cf.content_hash = p_content_hash
    AND (p_exclude_article_id IS NULL OR cf.article_id != p_exclude_article_id);
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;