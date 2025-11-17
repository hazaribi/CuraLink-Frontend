-- Migration: Enhanced Medical Data for CuraLink
-- Adds comprehensive data for Movement Disorders, Breast Cancer, ADHD, and Depression

-- Insert Enhanced Clinical Trials
INSERT INTO clinical_trials (title, phase, status, location, description, max_participants, start_date, end_date) VALUES
-- Movement Disorders / Parkinson's Trials
('Multiple System Atrophy Natural History Study', 'Phase II', 'Recruiting', 'Toronto, Canada', 'Longitudinal study tracking disease progression in multiple system atrophy patients.', 100, '2024-01-15', '2025-12-15'),
('Freezing of Gait in Parkinson''s Disease: Intervention Study', 'Phase II', 'Recruiting', 'Toronto, Ontario, Canada', 'Testing novel interventions for freezing of gait episodes in PD.', 80, '2024-01-20', '2025-06-20'),

-- Breast Cancer / Ductal Carcinoma Trials
('Ductal Carcinoma in Situ Active Surveillance Study', 'Phase III', 'Recruiting', 'Los Angeles, California', 'Comparing active surveillance to standard treatment for low-risk ductal carcinoma in situ.', 300, '2024-01-10', '2027-01-10'),
('Immunotherapy for Ductal Carcinoma in Situ', 'Phase I', 'Recruiting', 'Multi-center', 'Novel immunotherapy approach for DCIS treatment.', 50, '2024-02-15', '2025-08-15'),

-- ADHD Trials (Amsterdam)
('Neurofeedback Training for ADHD in Amsterdam', 'Phase III', 'Recruiting', 'Amsterdam, Netherlands', 'Comparing neurofeedback training to standard ADHD treatments in Amsterdam medical centers.', 200, '2024-01-15', '2025-07-15'),
('ADHD Dopamine Modulation Amsterdam Study', 'Phase II', 'Recruiting', 'Amsterdam, Netherlands', 'Investigating dopamine modulation effects in ADHD treatment using neuroimaging.', 80, '2024-01-20', '2025-06-20'),

-- Depression Trials (Amsterdam)
('Psilocybin-Assisted Therapy for Treatment-Resistant Depression', 'Phase II', 'Recruiting', 'Amsterdam, Netherlands', 'Safety and efficacy of psilocybin-assisted therapy for depression in Amsterdam medical centers.', 60, '2024-01-10', '2025-07-10'),
('Ketamine Therapy for Major Depressive Disorder Amsterdam Study', 'Phase III', 'Recruiting', 'Amsterdam, Netherlands', 'Randomized controlled trial of ketamine infusion therapy for treatment-resistant depression.', 120, '2024-02-01', '2025-12-01'),

-- Glioma Trials
('Bevacizumab Plus Radiotherapy for Recurrent Glioma', 'Phase III', 'Recruiting', 'New York, NY, USA', 'Combination therapy with bevacizumab and radiation for recurrent glioblastoma.', 200, '2024-01-05', '2026-01-05')

ON CONFLICT DO NOTHING;

-- Insert Enhanced Researcher Profiles
INSERT INTO researcher_profiles (name, institution, specialties, research_interests, orcid, available_for_meetings) VALUES
-- Movement Disorders Experts (Toronto)
('Dr. Alfonso Fasano', 'University Health Network, Toronto, Canada', ARRAY['Movement Disorders Neurology'], ARRAY['Deep Brain Stimulation', 'Parkinson''s Disease', 'Movement Disorders'], '0000-0002-1234-5678', true),
('Dr. Anthony Lang', 'Toronto Western Hospital, Toronto, Canada', ARRAY['Movement Disorders Neurology'], ARRAY['Parkinson''s Disease', 'Neurodegeneration', 'Stem Cell Therapy'], '0000-0002-3456-7890', true),

-- Breast Cancer Experts (Los Angeles)
('Dr. Laura J. Esserman', 'UCSF, Los Angeles, California, USA', ARRAY['Breast Cancer Oncology'], ARRAY['Breast Cancer', 'Ductal Carcinoma in Situ', 'Precision Medicine'], '0000-0003-1234-5678', true),
('Dr. Hope S. Rugo', 'UCSF, Los Angeles, California, USA', ARRAY['Breast Cancer Oncology'], ARRAY['Breast Cancer', 'Immunotherapy', 'Clinical Trials'], '0000-0003-2345-6789', true),

-- ADHD Experts (Amsterdam)
('Dr. Jan Buitelaar', 'Radboud University, Amsterdam, Netherlands', ARRAY['Child and Adolescent Psychiatry'], ARRAY['ADHD', 'Neurofeedback Training', 'Developmental Disorders'], '0000-0004-1234-5678', true),
('Dr. Anouk Schrantee', 'Amsterdam UMC, Amsterdam, Netherlands', ARRAY['Neuroimaging'], ARRAY['ADHD', 'Neuroimaging', 'Methylphenidate Brain Connectivity'], '0000-0004-4567-8901', true),

-- Depression Experts (Amsterdam)
('Dr. Guido van Wingen', 'Amsterdam UMC, Amsterdam, Netherlands', ARRAY['Psychiatry and Neuroimaging'], ARRAY['Depression', 'Brain Stimulation', 'Neuroimaging'], '0000-0005-1234-5678', true),
('Dr. Brenda Penninx', 'Vrije Universiteit Amsterdam, Amsterdam, Netherlands', ARRAY['Psychiatry and Epidemiology'], ARRAY['Depression', 'Long-term Outcomes', 'Epidemiology'], '0000-0005-3456-7890', true),
('Dr. Claudi Bockting', 'University of Amsterdam, Amsterdam, Netherlands', ARRAY['Clinical Psychology'], ARRAY['Depression', 'Cognitive Therapy', 'Relapse Prevention'], '0000-0005-4567-8901', true),
('Dr. Damiaan Denys', 'Amsterdam UMC, Amsterdam, Netherlands', ARRAY['Psychiatry'], ARRAY['Depression', 'Deep Brain Stimulation', 'OCD'], '0000-0005-2345-6789', true),

-- Glioma/Proteomics Experts
('Dr. Amanda Paulovich', 'Fred Hutchinson Cancer Center, New York, USA', ARRAY['Proteomics and Cancer Research'], ARRAY['Proteomics', 'Recurrent Glioma', 'Biomarker Discovery'], '0000-0006-1234-5678', true)

ON CONFLICT DO NOTHING;

-- Create indexes for enhanced search performance
CREATE INDEX IF NOT EXISTS idx_clinical_trials_title_search ON clinical_trials USING gin(to_tsvector('english', title));
CREATE INDEX IF NOT EXISTS idx_clinical_trials_description_search ON clinical_trials USING gin(to_tsvector('english', description));
CREATE INDEX IF NOT EXISTS idx_researcher_profiles_name_search ON researcher_profiles USING gin(to_tsvector('english', name));
CREATE INDEX IF NOT EXISTS idx_researcher_profiles_institution_search ON researcher_profiles USING gin(to_tsvector('english', institution));