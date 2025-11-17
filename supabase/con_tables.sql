-- Only create new tables for connection/chat functionality

-- Connection Requests Table
CREATE TABLE IF NOT EXISTS connection_requests (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    from_researcher_id UUID REFERENCES researcher_profiles(id),
    to_researcher_id UUID REFERENCES researcher_profiles(id),
    message TEXT,
    status TEXT DEFAULT 'pending' CHECK (status IN ('pending', 'accepted', 'declined')),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    UNIQUE(from_researcher_id, to_researcher_id)
);

-- Connections Table (for accepted connections)
CREATE TABLE IF NOT EXISTS connections (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    researcher1_id UUID REFERENCES researcher_profiles(id),
    researcher2_id UUID REFERENCES researcher_profiles(id),
    status TEXT DEFAULT 'active' CHECK (status IN ('active', 'blocked')),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    UNIQUE(researcher1_id, researcher2_id)
);

-- Chat Messages Table
CREATE TABLE IF NOT EXISTS chat_messages (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    connection_id UUID REFERENCES connections(id) ON DELETE CASCADE,
    sender_id UUID REFERENCES researcher_profiles(id),
    message TEXT NOT NULL,
    sent_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    read_at TIMESTAMP WITH TIME ZONE
);

-- Admin Requests Table (for external expert contacts)
CREATE TABLE IF NOT EXISTS admin_requests (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    type TEXT NOT NULL CHECK (type IN ('external_expert_contact', 'nudge_invitation')),
    patient_name TEXT,
    patient_email TEXT,
    expert_name TEXT,
    expert_email TEXT,
    message TEXT,
    urgency TEXT DEFAULT 'normal' CHECK (urgency IN ('low', 'normal', 'high', 'urgent')),
    status TEXT DEFAULT 'pending_admin_review' CHECK (status IN ('pending_admin_review', 'in_progress', 'completed', 'declined')),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- New indexes only
DO $$
BEGIN
    IF NOT EXISTS (SELECT 1 FROM pg_indexes WHERE indexname = 'idx_connection_requests_to_researcher') THEN
        CREATE INDEX idx_connection_requests_to_researcher ON connection_requests(to_researcher_id);
    END IF;
    
    IF NOT EXISTS (SELECT 1 FROM pg_indexes WHERE indexname = 'idx_connections_researchers') THEN
        CREATE INDEX idx_connections_researchers ON connections(researcher1_id, researcher2_id);
    END IF;
    
    IF NOT EXISTS (SELECT 1 FROM pg_indexes WHERE indexname = 'idx_chat_messages_connection') THEN
        CREATE INDEX idx_chat_messages_connection ON chat_messages(connection_id);
    END IF;
    
    IF NOT EXISTS (SELECT 1 FROM pg_indexes WHERE indexname = 'idx_admin_requests_status') THEN
        CREATE INDEX idx_admin_requests_status ON admin_requests(status);
    END IF;
END $$;