-- CuraLink Database Schema

-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Patient Profiles Table
CREATE TABLE IF NOT EXISTS patient_profiles (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    condition TEXT NOT NULL,
    location TEXT NOT NULL,
    additional_conditions TEXT[],
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Researcher Profiles Table
CREATE TABLE IF NOT EXISTS researcher_profiles (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    name TEXT NOT NULL,
    institution TEXT NOT NULL,
    specialties TEXT[] NOT NULL,
    research_interests TEXT[] NOT NULL,
    orcid TEXT,
    research_gate TEXT,
    available_for_meetings BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Clinical Trials Table
CREATE TABLE IF NOT EXISTS clinical_trials (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    title TEXT NOT NULL,
    phase TEXT NOT NULL,
    status TEXT NOT NULL,
    location TEXT NOT NULL,
    description TEXT,
    eligibility_criteria TEXT,
    researcher_id UUID REFERENCES researcher_profiles(id),
    participants_enrolled INTEGER DEFAULT 0,
    max_participants INTEGER,
    start_date DATE,
    end_date DATE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Publications Table
CREATE TABLE IF NOT EXISTS publications (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    title TEXT NOT NULL,
    journal TEXT NOT NULL,
    authors TEXT[] NOT NULL,
    publication_date DATE NOT NULL,
    doi TEXT,
    abstract TEXT,
    keywords TEXT[],
    researcher_id UUID REFERENCES researcher_profiles(id),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Health Experts Table (for external experts not registered)
CREATE TABLE IF NOT EXISTS health_experts (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    name TEXT NOT NULL,
    specialty TEXT NOT NULL,
    institution TEXT,
    location TEXT,
    email TEXT,
    research_interests TEXT[],
    publications_count INTEGER DEFAULT 0,
    external_profile_url TEXT,
    verified BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Favorites Table (for both patients and researchers)
CREATE TABLE IF NOT EXISTS favorites (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    user_id UUID NOT NULL,
    user_type TEXT NOT NULL CHECK (user_type IN ('patient', 'researcher')),
    item_id UUID NOT NULL,
    item_type TEXT NOT NULL CHECK (item_type IN ('clinical_trial', 'publication', 'expert', 'collaborator')),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    UNIQUE(user_id, item_id, item_type)
);

-- Forum Categories Table
CREATE TABLE IF NOT EXISTS forum_categories (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    name TEXT NOT NULL UNIQUE,
    description TEXT,
    created_by UUID REFERENCES researcher_profiles(id),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Forum Posts Table
CREATE TABLE IF NOT EXISTS forum_posts (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    category_id UUID REFERENCES forum_categories(id),
    title TEXT NOT NULL,
    content TEXT NOT NULL,
    author_id UUID NOT NULL,
    author_type TEXT NOT NULL CHECK (author_type IN ('patient', 'researcher')),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Forum Replies Table
CREATE TABLE IF NOT EXISTS forum_replies (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    post_id UUID REFERENCES forum_posts(id) ON DELETE CASCADE,
    content TEXT NOT NULL,
    author_id UUID REFERENCES researcher_profiles(id),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Meeting Requests Table
CREATE TABLE IF NOT EXISTS meeting_requests (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    patient_id UUID REFERENCES patient_profiles(id),
    researcher_id UUID REFERENCES researcher_profiles(id),
    status TEXT DEFAULT 'pending' CHECK (status IN ('pending', 'approved', 'declined', 'completed')),
    message TEXT,
    patient_name TEXT NOT NULL,
    patient_contact TEXT NOT NULL,
    phone TEXT,
    preferred_date TEXT,
    preferred_time TEXT,
    meeting_type TEXT DEFAULT 'video' CHECK (meeting_type IN ('video', 'phone', 'in-person')),
    urgency TEXT DEFAULT 'normal' CHECK (urgency IN ('low', 'normal', 'high', 'urgent')),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    requested_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    responded_at TIMESTAMP WITH TIME ZONE
);

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
    type TEXT NOT NULL CHECK (type IN ('external_expert_contact', 'nudge_invitation', 'missing_contact_info')),
    patient_name TEXT,
    patient_email TEXT,
    expert_name TEXT,
    expert_email TEXT,
    expert_id TEXT,
    data_source TEXT,
    specialty TEXT,
    institution TEXT,
    phone TEXT,
    preferred_date TEXT,
    preferred_time TEXT,
    meeting_type TEXT DEFAULT 'video',
    message TEXT,
    urgency TEXT DEFAULT 'normal' CHECK (urgency IN ('low', 'normal', 'high', 'urgent')),
    priority TEXT DEFAULT 'normal' CHECK (priority IN ('low', 'normal', 'high', 'urgent')),
    status TEXT DEFAULT 'pending_admin_review' CHECK (status IN ('pending_admin_review', 'in_progress', 'completed', 'declined')),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Indexes for better performance
CREATE INDEX IF NOT EXISTS idx_patient_profiles_condition ON patient_profiles(condition);
CREATE INDEX IF NOT EXISTS idx_patient_profiles_location ON patient_profiles(location);
CREATE INDEX IF NOT EXISTS idx_researcher_profiles_specialties ON researcher_profiles USING GIN(specialties);
CREATE INDEX IF NOT EXISTS idx_researcher_profiles_research_interests ON researcher_profiles USING GIN(research_interests);
CREATE INDEX IF NOT EXISTS idx_clinical_trials_status ON clinical_trials(status);
CREATE INDEX IF NOT EXISTS idx_clinical_trials_phase ON clinical_trials(phase);
CREATE INDEX IF NOT EXISTS idx_publications_journal ON publications(journal);
CREATE INDEX IF NOT EXISTS idx_publications_keywords ON publications USING GIN(keywords);
CREATE INDEX IF NOT EXISTS idx_health_experts_specialty ON health_experts(specialty);
CREATE INDEX IF NOT EXISTS idx_favorites_user ON favorites(user_id, user_type);
CREATE INDEX IF NOT EXISTS idx_forum_posts_category ON forum_posts(category_id);
CREATE INDEX IF NOT EXISTS idx_forum_replies_post ON forum_replies(post_id);
CREATE INDEX IF NOT EXISTS idx_connection_requests_to_researcher ON connection_requests(to_researcher_id);
CREATE INDEX IF NOT EXISTS idx_connections_researchers ON connections(researcher1_id, researcher2_id);
CREATE INDEX IF NOT EXISTS idx_chat_messages_connection ON chat_messages(connection_id);
CREATE INDEX IF NOT EXISTS idx_admin_requests_status ON admin_requests(status);

-- Insert some default forum categories
INSERT INTO forum_categories (name, description) 
SELECT * FROM (VALUES
('Cancer Research', 'Discussions about cancer research and treatments'),
('Clinical Trials Insights', 'Share experiences and insights about clinical trials'),
('Immunotherapy', 'Focus on immunotherapy treatments and research'),
('Neurology', 'Neurological conditions and treatments'),
('General Health', 'General health and medical discussions')
) AS t(name, description)
WHERE NOT EXISTS (SELECT 1 FROM forum_categories WHERE forum_categories.name = t.name);