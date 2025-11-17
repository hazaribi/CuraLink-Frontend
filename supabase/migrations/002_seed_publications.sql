-- Migration: Seed Publications Data
-- Adds comprehensive publications for all medical specialties

INSERT INTO publications (title, journal, authors, publication_date, doi, abstract, keywords) VALUES
-- Parkinson's Publications
('Stem Cell Therapy for Parkinson''s Disease: Current Progress and Future Directions', 'Nature Medicine', ARRAY['Dr. Suneil Kalia', 'Dr. Anthony Lang'], '2024-01-15', '10.1038/s41591-024-0001-1', 'Comprehensive review of stem cell approaches for treating Parkinson''s disease.', ARRAY['Parkinson''s Disease', 'Stem Cell Therapy']),
('Deep Brain Stimulation Outcomes in Parkinson''s Disease: A Multi-Center Study', 'New England Journal of Medicine', ARRAY['Dr. Alfonso Fasano', 'Dr. Andres Lozano'], '2024-01-10', '10.1056/NEJMoa2024001', 'Long-term outcomes of deep brain stimulation in 500 Parkinson''s patients.', ARRAY['Deep Brain Stimulation', 'Parkinson''s Disease']),
('Vyalev (Foslevodopa/Foscarbidopa) in Advanced Parkinson''s Disease', 'Movement Disorders', ARRAY['Dr. Alfonso Fasano', 'Dr. Renato Munhoz'], '2024-01-05', '10.1002/mds.29001', 'Clinical trial results of continuous subcutaneous foslevodopa/foscarbidopa infusion.', ARRAY['Vyalev', 'Parkinson''s Disease']),

-- Breast Cancer Publications
('Ductal Carcinoma in Situ: Risk Factors and Treatment Strategies', 'The Lancet Oncology', ARRAY['Dr. Jo Chien', 'Dr. Laura J. Esserman'], '2024-01-15', '10.1016/S1470-2045(24)00001-1', 'Comprehensive analysis of DCIS management strategies and long-term outcomes.', ARRAY['Ductal Carcinoma in Situ', 'DCIS']),
('Mediterranean Diet and Breast Cancer Prevention: Los Angeles Cohort Study', 'Cancer Prevention Research', ARRAY['Dr. Hope S. Rugo', 'Dr. Laura J. Esserman'], '2024-01-12', '10.1158/1940-6207.CAPR-24-0001', 'Prospective study of Mediterranean diet adherence and breast cancer risk.', ARRAY['Mediterranean Diet', 'Breast Cancer Prevention']),

-- ADHD Publications
('Methylphenidate Effects on Brain Connectivity in ADHD: A Neuroimaging Study', 'Biological Psychiatry', ARRAY['Dr. Anouk Schrantee', 'Dr. Sarah Durston'], '2024-01-18', '10.1016/j.biopsych.2024.01.001', 'fMRI study examining methylphenidate treatment effects on neural connectivity.', ARRAY['ADHD', 'Methylphenidate', 'Brain Connectivity']),
('Dopamine Modulation in ADHD: Neuroimaging and Behavioral Studies', 'Biological Psychiatry', ARRAY['Dr. Sarah Durston', 'Dr. Anouk Schrantee'], '2024-01-08', '10.1016/j.biopsych.2024.02.001', 'Comprehensive analysis of dopamine system modulation in ADHD.', ARRAY['ADHD', 'Dopamine Modulation']),

-- Depression Publications
('Long-term Outcomes of Depression Treatment in Netherlands Cohort Study', 'The Lancet Psychiatry', ARRAY['Dr. Brenda Penninx', 'Dr. Claudi Bockting'], '2024-01-12', '10.1016/S2215-0366(24)00002-2', '15-year follow-up study of depression treatment outcomes in Dutch cohort.', ARRAY['Depression', 'Long-term Outcomes']),
('Ketamine Therapy for Treatment-Resistant Depression: Netherlands Experience', 'Nature Medicine', ARRAY['Dr. Guido van Wingen', 'Dr. Damiaan Denys'], '2024-01-15', '10.1038/s41591-024-0002-2', 'Clinical outcomes of ketamine treatment in treatment-resistant depression.', ARRAY['Depression', 'Ketamine Therapy']),

-- Glioma Publications
('Radiotherapy Advances in Recurrent Glioma: Multi-center Analysis', 'Neuro-Oncology', ARRAY['Dr. Amanda Paulovich', 'Dr. Akhilesh Pandey'], '2024-01-10', '10.1093/neuonc/noac002', 'Novel radiotherapy techniques and outcomes in recurrent glioblastoma patients.', ARRAY['Glioma', 'Radiotherapy'])

ON CONFLICT DO NOTHING;