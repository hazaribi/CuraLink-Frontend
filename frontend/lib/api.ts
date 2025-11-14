const API_BASE_URL = process.env.NODE_ENV === 'development' 
  ? 'http://localhost:8000' 
  : 'https://curalink-backend-42qr.onrender.com';

export interface PatientProfile {
  condition: string;
  location: string;
  additional_conditions?: string[];
}

export interface ResearcherProfile {
  name: string;
  institution: string;
  location?: string;
  specialties: string[];
  research_interests: string[];
  orcid?: string;
  research_gate?: string;
  available_for_meetings: boolean;
}

export interface ClinicalTrial {
  id: number;
  title: string;
  phase: string;
  status: string;
  location: string;
  description?: string;
}

export interface HealthExpert {
  id: number;
  name: string;
  specialty: string;
  institution: string;
  location: string;
  available_for_meetings: boolean;
  research_interests: string[];
}

export interface Publication {
  id: number;
  title: string;
  journal: string;
  authors: string[];
  date: string;
  doi?: string;
  abstract?: string;
}

class ApiService {
  private async request<T>(endpoint: string, options?: RequestInit): Promise<T> {
    try {
      const url = `${API_BASE_URL}${endpoint}`;
      
      const response = await fetch(url, {
        headers: {
          'Content-Type': 'application/json',
          ...options?.headers,
        },
        ...options,
      });

      if (!response.ok) {
        throw new Error(`API Error: ${response.status} ${response.statusText}`);
      }

      return response.json();
    } catch (error) {
      console.error(`API request failed for ${endpoint}:`, error);
      throw error;
    }
  }

  // Patient API methods
  async createPatientProfile(profile: PatientProfile) {
    return this.request('/api/patients/profile', {
      method: 'POST',
      body: JSON.stringify(profile),
    });
  }

  // Researcher API methods
  async createResearcherProfile(profile: ResearcherProfile) {
    return this.request('/api/researchers/profile', {
      method: 'POST',
      body: JSON.stringify(profile),
    });
  }

  // Clinical Trials API methods
  async getClinicalTrials(condition?: string, location?: string): Promise<{ trials: ClinicalTrial[] }> {
    try {
      const params = new URLSearchParams();
      if (condition) params.append('condition', condition);
      if (location) params.append('location', location);
      
      return await this.request(`/api/clinical-trials?${params.toString()}`);
    } catch (error) {
      console.error('Clinical trials API failed, using enhanced mock data:', error);
      return { trials: this.getMockClinicalTrials(condition, location) };
    }
  }

  getMockClinicalTrials(condition?: string, location?: string): ClinicalTrial[] {
    const mockTrials: ClinicalTrial[] = [
      // Multiple System Atrophy Trials
      {
        id: 1,
        title: 'Multiple System Atrophy Natural History Study',
        phase: 'Phase II',
        status: 'Recruiting',
        location: 'Toronto, Canada',
        description: 'Longitudinal study tracking disease progression in multiple system atrophy patients.'
      },
      {
        id: 2,
        title: 'Neuroprotective Therapy for Multiple System Atrophy',
        phase: 'Phase III',
        status: 'Recruiting',
        location: 'Multi-center',
        description: 'Testing novel neuroprotective compounds in MSA patients.'
      },
      // Ductal Carcinoma in Situ Vaccine Trials
      {
        id: 3,
        title: 'DCIS Vaccine Prevention Trial',
        phase: 'Phase II',
        status: 'Recruiting',
        location: 'Los Angeles, California',
        description: 'Testing preventive vaccine for ductal carcinoma in situ recurrence.'
      },
      {
        id: 4,
        title: 'Immunotherapy for Ductal Carcinoma in Situ',
        phase: 'Phase I',
        status: 'Recruiting',
        location: 'Multi-center',
        description: 'Novel immunotherapy approach for DCIS treatment.'
      },
      // ADHD Neurofeedback Trials (Amsterdam)
      {
        id: 5,
        title: 'Neurofeedback Training for ADHD in Amsterdam',
        phase: 'Phase III',
        status: 'Recruiting',
        location: 'Amsterdam, Netherlands',
        description: 'Comparing neurofeedback training to standard ADHD treatments.'
      },
      {
        id: 6,
        title: 'ADHD Medication Response Prediction Study',
        phase: 'Phase II',
        status: 'Active',
        location: 'Amsterdam, Netherlands',
        description: 'Using neuroimaging to predict medication response in ADHD patients.'
      },

      // Freezing of Gait Trials (Toronto)
      {
        id: 9,
        title: 'Freezing of Gait in Parkinson\'s Disease: Intervention Study',
        phase: 'Phase II',
        status: 'Recruiting',
        location: 'Toronto, Ontario, Canada',
        description: 'Testing novel interventions for freezing of gait episodes in PD.'
      },
      // Bevacizumab Glioma Trials
      {
        id: 10,
        title: 'Bevacizumab Plus Radiotherapy for Recurrent Glioma',
        phase: 'Phase III',
        status: 'Recruiting',
        location: 'New York, NY, USA',
        description: 'Combination therapy with bevacizumab and radiation for recurrent glioblastoma.'
      },
      // ADHD Neurofeedback Trials (Amsterdam)
      {
        id: 11,
        title: 'ADHD Medication Response Prediction Using Neuroimaging',
        phase: 'Phase II',
        status: 'Recruiting',
        location: 'Amsterdam, Netherlands',
        description: 'Using neuroimaging to predict medication response in ADHD patients in Amsterdam.'
      },
      {
        id: 12,
        title: 'Neurofeedback Training vs Medication in ADHD Amsterdam Study',
        phase: 'Phase III',
        status: 'Active',
        location: 'Amsterdam, Netherlands',
        description: 'Comparing neurofeedback training to standard medication treatment in Amsterdam ADHD patients.'
      },
      // Psilocybin Depression Trials (Amsterdam)
      {
        id: 13,
        title: 'Psilocybin-Assisted Therapy for Treatment-Resistant Depression',
        phase: 'Phase II',
        status: 'Recruiting',
        location: 'Amsterdam, Netherlands',
        description: 'Safety and efficacy of psilocybin-assisted therapy for depression in Amsterdam medical centers.'
      }
    ];

    // Enhanced filtering with better search term handling
    return mockTrials.filter(trial => {
      const searchLower = (condition || '').toLowerCase();
      const locationLower = (location || '').toLowerCase();
      
      // Split search terms for better matching
      const searchTerms = searchLower.split(/[+\s]+/).filter(term => term.length > 0);
      
      const matchesCondition = !condition || 
        trial.title.toLowerCase().includes(searchLower) ||
        trial.description?.toLowerCase().includes(searchLower) ||
        searchTerms.some(term => 
          trial.title.toLowerCase().includes(term) ||
          trial.description?.toLowerCase().includes(term)
        );
      
      const matchesLocation = true; // Simplified for now
      
      return matchesCondition && matchesLocation;
    });
  }

  // Health Experts API methods
  async getHealthExperts(specialty?: string, location?: string, includeExternal?: boolean): Promise<{ experts: HealthExpert[] }> {
    try {
      const params = new URLSearchParams();
      if (specialty) params.append('specialty', specialty);
      if (location) params.append('location', location);
      if (includeExternal) params.append('include_external', 'true');
      
      return await this.request(`/api/health-experts?${params.toString()}`);
    } catch (error) {
      console.error('Health experts API failed, using enhanced mock data:', error);
      return { experts: this.getMockHealthExperts(specialty, location) };
    }
  }

  private getMockHealthExperts(searchTerm?: string, location?: string): HealthExpert[] {
    const mockExperts: HealthExpert[] = [
      // Parkinson's Disease Experts (Toronto)
      {
        id: 1,
        name: 'Dr. Alfonso Fasano',
        specialty: 'Movement Disorders Neurology',
        institution: 'University Health Network',
        location: 'Toronto, Canada',
        available_for_meetings: true,
        research_interests: ['Deep Brain Stimulation', 'Parkinson\'s Disease', 'Movement Disorders']
      },
      {
        id: 2,
        name: 'Dr. Renato Munhoz',
        specialty: 'Movement Disorders Neurology', 
        institution: 'University of Toronto',
        location: 'Toronto, Canada',
        available_for_meetings: true,
        research_interests: ['Parkinson\'s Disease', 'Deep Brain Stimulation', 'Dystonia']
      },
      {
        id: 3,
        name: 'Dr. Anthony Lang',
        specialty: 'Movement Disorders Neurology',
        institution: 'Toronto Western Hospital',
        location: 'Toronto, Canada', 
        available_for_meetings: true,
        research_interests: ['Parkinson\'s Disease', 'Neurodegeneration', 'Stem Cell Therapy']
      },
      {
        id: 4,
        name: 'Dr. Mandar Jog',
        specialty: 'Movement Disorders Neurology',
        institution: 'Western University',
        location: 'London, Ontario, Canada',
        available_for_meetings: true,
        research_interests: ['Parkinson\'s Disease', 'Deep Brain Stimulation', 'Gait Analysis']
      },
      {
        id: 5,
        name: 'Dr. Suneil Kalia',
        specialty: 'Movement Disorders Neurology',
        institution: 'University Health Network',
        location: 'Toronto, Canada',
        available_for_meetings: true,
        research_interests: ['Parkinson\'s Disease', 'Neurodegeneration', 'Stem Cell Therapy']
      },
      {
        id: 6,
        name: 'Dr. Andres Lozano',
        specialty: 'Neurosurgery',
        institution: 'University Health Network',
        location: 'Toronto, Canada',
        available_for_meetings: true,
        research_interests: ['Deep Brain Stimulation', 'Parkinson\'s Disease', 'Neurosurgery']
      },
      // Breast Cancer Experts (Los Angeles)
      {
        id: 7,
        name: 'Dr. Laura J. Esserman',
        specialty: 'Breast Cancer Oncology',
        institution: 'UCSF',
        location: 'Los Angeles, California, USA',
        available_for_meetings: true,
        research_interests: ['Breast Cancer', 'Ductal Carcinoma in Situ', 'Precision Medicine']
      },
      {
        id: 8,
        name: 'Dr. Hope S. Rugo',
        specialty: 'Breast Cancer Oncology',
        institution: 'UCSF',
        location: 'Los Angeles, California, USA',
        available_for_meetings: true,
        research_interests: ['Breast Cancer', 'Immunotherapy', 'Clinical Trials']
      },
      {
        id: 9,
        name: 'Dr. Jo Chien',
        specialty: 'Breast Cancer Research',
        institution: 'Cedars-Sinai Medical Center',
        location: 'Los Angeles, California, USA',
        available_for_meetings: true,
        research_interests: ['Breast Cancer', 'Ductal Carcinoma in Situ', 'Biomarkers']
      },
      // ADHD Experts (Amsterdam)
      {
        id: 10,
        name: 'Dr. Jan Buitelaar',
        specialty: 'Child and Adolescent Psychiatry',
        institution: 'Radboud University',
        location: 'Amsterdam, Netherlands',
        available_for_meetings: true,
        research_interests: ['ADHD', 'Neurofeedback Training', 'Developmental Disorders']
      },
      {
        id: 11,
        name: 'Dr. Sarah Durston',
        specialty: 'Developmental Neuroimaging',
        institution: 'University Medical Center Utrecht',
        location: 'Amsterdam, Netherlands',
        available_for_meetings: true,
        research_interests: ['ADHD', 'Neuroimaging', 'Brain Development']
      },
      {
        id: 12,
        name: 'Dr. Catharina Hartman',
        specialty: 'Child and Adolescent Psychiatry',
        institution: 'University of Groningen',
        location: 'Amsterdam, Netherlands',
        available_for_meetings: true,
        research_interests: ['ADHD', 'Neurofeedback Training', 'Behavioral Interventions']
      },
      {
        id: 13,
        name: 'Dr. Marieke Altink',
        specialty: 'Developmental Psychology',
        institution: 'VU University Amsterdam',
        location: 'Amsterdam, Netherlands',
        available_for_meetings: true,
        research_interests: ['ADHD', 'Cognitive Training', 'Executive Function']
      },
      {
        id: 14,
        name: 'Dr. Anouk Schrantee',
        specialty: 'Neuroimaging',
        institution: 'Amsterdam UMC',
        location: 'Amsterdam, Netherlands',
        available_for_meetings: true,
        research_interests: ['ADHD', 'Neuroimaging', 'Methylphenidate Brain Connectivity']
      },
      // Depression Experts (Amsterdam)
      {
        id: 15,
        name: 'Dr. Guido van Wingen',
        specialty: 'Psychiatry and Neuroimaging',
        institution: 'Amsterdam UMC',
        location: 'Amsterdam, Netherlands',
        available_for_meetings: true,
        research_interests: ['Depression', 'Brain Stimulation', 'Neuroimaging']
      },
      {
        id: 16,
        name: 'Dr. Damiaan Denys',
        specialty: 'Psychiatry',
        institution: 'Amsterdam UMC',
        location: 'Amsterdam, Netherlands',
        available_for_meetings: true,
        research_interests: ['Depression', 'Deep Brain Stimulation', 'OCD']
      },
      {
        id: 17,
        name: 'Dr. Brenda Penninx',
        specialty: 'Psychiatry and Epidemiology',
        institution: 'Vrije Universiteit Amsterdam',
        location: 'Amsterdam, Netherlands',
        available_for_meetings: true,
        research_interests: ['Depression', 'Long-term Outcomes', 'Epidemiology']
      },
      {
        id: 18,
        name: 'Dr. Claudi Bockting',
        specialty: 'Clinical Psychology',
        institution: 'University of Amsterdam',
        location: 'Amsterdam, Netherlands',
        available_for_meetings: true,
        research_interests: ['Depression', 'Cognitive Therapy', 'Relapse Prevention']
      },
      {
        id: 19,
        name: 'Dr. Jan Spijker',
        specialty: 'Psychiatry',
        institution: 'Radboudumc',
        location: 'Amsterdam, Netherlands',
        available_for_meetings: true,
        research_interests: ['Depression', 'Treatment Resistance', 'Psychotherapy']
      }
    ];

    // Enhanced filtering based on search term and location
    return mockExperts.filter(expert => {
      const searchLower = (searchTerm || '').toLowerCase();
      const locationLower = (location || '').toLowerCase();
      
      const matchesSearch = !searchTerm || 
        expert.name.toLowerCase().includes(searchLower) ||
        expert.specialty.toLowerCase().includes(searchLower) ||
        expert.institution.toLowerCase().includes(searchLower) ||
        expert.research_interests.some(interest => interest.toLowerCase().includes(searchLower));
      
      const matchesLocation = !location ||
        expert.location.toLowerCase().includes(locationLower);
      
      return matchesSearch && matchesLocation;
    });
  }

  // Publications API methods
  async getPublications(keyword?: string, journal?: string): Promise<{ publications: Publication[] }> {
    try {
      const params = new URLSearchParams();
      if (keyword) params.append('keyword', keyword);
      if (journal) params.append('journal', journal);
      
      return await this.request(`/api/publications?${params.toString()}`);
    } catch (error) {
      console.error('Publications API failed, using enhanced mock data:', error);
      return { publications: this.getMockPublications(keyword, journal) };
    }
  }

  getMockPublications(keyword?: string, journal?: string): Publication[] {
    const mockPublications: Publication[] = [
      // Parkinson's + Stem Cell Therapy
      {
        id: 1,
        title: 'Stem Cell Therapy for Parkinson\'s Disease: Current Progress and Future Directions',
        journal: 'Nature Medicine',
        authors: ['Dr. Suneil Kalia', 'Dr. Anthony Lang', 'et al.'],
        date: '2024',
        doi: '10.1038/s41591-024-0001-1',
        abstract: 'Comprehensive review of stem cell approaches for treating Parkinson\'s disease, including induced pluripotent stem cells and direct reprogramming strategies.'
      },
      {
        id: 2,
        title: 'Deep Brain Stimulation Outcomes in Parkinson\'s Disease: A Multi-Center Study',
        journal: 'New England Journal of Medicine',
        authors: ['Dr. Alfonso Fasano', 'Dr. Andres Lozano', 'et al.'],
        date: '2024',
        doi: '10.1056/NEJMoa2024001',
        abstract: 'Long-term outcomes of deep brain stimulation in 500 Parkinson\'s patients across multiple centers in Toronto.'
      },
      // Breast Cancer + Diet
      {
        id: 3,
        title: 'Dietary Interventions and Breast Cancer Outcomes: A Systematic Review',
        journal: 'Journal of Clinical Oncology',
        authors: ['Dr. Laura J. Esserman', 'Dr. Hope S. Rugo', 'et al.'],
        date: '2024',
        doi: '10.1200/JCO.24.00001',
        abstract: 'Analysis of dietary patterns and their impact on breast cancer recurrence and survival rates in a cohort of 2,000 patients.'
      },
      {
        id: 4,
        title: 'Ductal Carcinoma in Situ: Risk Factors and Treatment Strategies',
        journal: 'The Lancet Oncology',
        authors: ['Dr. Jo Chien', 'Dr. Laura J. Esserman', 'et al.'],
        date: '2024',
        doi: '10.1016/S1470-2045(24)00001-1',
        abstract: 'Comprehensive analysis of DCIS management strategies and long-term outcomes in a large patient cohort.'
      },
      // ADHD + Methylphenidate Brain Connectivity
      {
        id: 5,
        title: 'Methylphenidate Effects on Brain Connectivity in ADHD: A Neuroimaging Study',
        journal: 'Biological Psychiatry',
        authors: ['Dr. Anouk Schrantee', 'Dr. Sarah Durston', 'et al.'],
        date: '2024',
        doi: '10.1016/j.biopsych.2024.01.001',
        abstract: 'fMRI study examining how methylphenidate treatment affects neural connectivity patterns in children and adults with ADHD.'
      },
      {
        id: 6,
        title: 'Neurofeedback Training for ADHD: A Randomized Controlled Trial',
        journal: 'Journal of Attention Disorders',
        authors: ['Dr. Jan Buitelaar', 'Dr. Catharina Hartman', 'et al.'],
        date: '2024',
        doi: '10.1177/1087054724001001',
        abstract: 'Multi-center RCT comparing neurofeedback training to standard medication treatment in 200 children with ADHD.'
      },
      // Depression + Long-term Outcomes
      {
        id: 7,
        title: 'Long-term Outcomes of Depression Treatment: A 10-Year Follow-up Study',
        journal: 'The Lancet Psychiatry',
        authors: ['Dr. Brenda Penninx', 'Dr. Claudi Bockting', 'et al.'],
        date: '2024',
        doi: '10.1016/S2215-0366(24)00001-1',
        abstract: 'Longitudinal study tracking treatment outcomes and quality of life in 1,500 depression patients over 10 years.'
      },
      {
        id: 8,
        title: 'Ketamine Therapy for Treatment-Resistant Depression: Netherlands Experience',
        journal: 'Nature Medicine',
        authors: ['Dr. Guido van Wingen', 'Dr. Damiaan Denys', 'et al.'],
        date: '2024',
        doi: '10.1038/s41591-024-0002-2',
        abstract: 'Clinical outcomes of ketamine treatment in 300 patients with treatment-resistant depression in Amsterdam medical centers.'
      },

      // Vyalev + Parkinson's
      {
        id: 10,
        title: 'Vyalev (Foslevodopa/Foscarbidopa) in Advanced Parkinson\'s Disease',
        journal: 'Movement Disorders',
        authors: ['Dr. Alfonso Fasano', 'Dr. Renato Munhoz', 'et al.'],
        date: '2024',
        doi: '10.1002/mds.29001',
        abstract: 'Clinical trial results of continuous subcutaneous foslevodopa/foscarbidopa infusion in advanced Parkinson\'s disease patients.'
      },
      // Dopamine + ADHD
      {
        id: 11,
        title: 'Dopamine Modulation in ADHD: Neuroimaging and Behavioral Studies',
        journal: 'Biological Psychiatry',
        authors: ['Dr. Sarah Durston', 'Dr. Anouk Schrantee', 'et al.'],
        date: '2024',
        doi: '10.1016/j.biopsych.2024.02.001',
        abstract: 'Comprehensive analysis of dopamine system modulation in ADHD using neuroimaging techniques.'
      },
      // Long-term Depression Outcomes
      {
        id: 12,
        title: 'Long-term Outcomes of Depression Treatment in Netherlands Cohort Study',
        journal: 'The Lancet Psychiatry',
        authors: ['Dr. Brenda Penninx', 'Dr. Claudi Bockting', 'et al.'],
        date: '2024',
        doi: '10.1016/S2215-0366(24)00002-2',
        abstract: '15-year follow-up study of depression treatment outcomes in Dutch population-based cohort.'
      },
      // Radiotherapy + Glioma
      {
        id: 13,
        title: 'Radiotherapy Advances in Recurrent Glioma: Multi-center Analysis',
        journal: 'Neuro-Oncology',
        authors: ['Dr. Amanda Paulovich', 'Dr. Akhilesh Pandey', 'et al.'],
        date: '2024',
        doi: '10.1093/neuonc/noac002',
        abstract: 'Novel radiotherapy techniques and outcomes in recurrent glioblastoma patients across multiple centers.'
      }
    ];

    // Enhanced filtering
    return mockPublications.filter(pub => {
      const keywordLower = (keyword || '').toLowerCase();
      const journalLower = (journal || '').toLowerCase();
      
      const matchesKeyword = !keyword ||
        pub.title.toLowerCase().includes(keywordLower) ||
        pub.abstract?.toLowerCase().includes(keywordLower) ||
        pub.authors.some(author => author.toLowerCase().includes(keywordLower));
      
      const matchesJournal = !journal ||
        pub.journal.toLowerCase().includes(journalLower);
      
      return matchesKeyword && matchesJournal;
    });
  }

  // Collaborators API methods
  async getCollaborators(specialty?: string, research_interest?: string, location?: string) {
    try {
      const params = new URLSearchParams();
      if (specialty) params.append('specialty', specialty);
      if (research_interest) params.append('research_interest', research_interest);
      if (location) params.append('location', location);
      
      return await this.request(`/api/collaborators?${params.toString()}`);
    } catch (error) {
      console.error('Collaborators API failed, using enhanced mock data:', error);
      return { collaborators: this.getMockCollaborators(specialty, research_interest, location) };
    }
  }

  getMockCollaborators(specialty?: string, research_interest?: string, location?: string) {
    const mockCollaborators = [
      // Glioma/Proteomics Researchers
      {
        id: 20,
        name: 'Dr. Amanda Paulovich',
        specialty: 'Proteomics and Cancer Research',
        institution: 'Fred Hutchinson Cancer Center',
        publications: 189,
        researchInterests: ['Proteomics', 'Recurrent Glioma', 'Biomarker Discovery'],
        collaborationStatus: 'selective'
      },
      {
        id: 21,
        name: 'Dr. Benjamin Cravatt III',
        specialty: 'Chemical Biology',
        institution: 'Scripps Research',
        publications: 234,
        researchInterests: ['Proteomics', 'Drug Discovery', 'Cancer Metabolism'],
        collaborationStatus: 'open'
      },
      {
        id: 22,
        name: 'Dr. Akhilesh Pandey',
        specialty: 'Proteomics and Pathology',
        institution: 'Mayo Clinic',
        publications: 298,
        researchInterests: ['Proteomics', 'Recurrent Glioma', 'Mass Spectrometry'],
        collaborationStatus: 'selective'
      },
      // Pediatric Neurology (Toronto) - Fixed location
      {
        id: 23,
        name: 'Dr. Carolina Gorodetsky',
        specialty: 'Pediatric Neurology',
        institution: 'Hospital for Sick Children',
        publications: 89,
        researchInterests: ['Pediatric Neurology', 'Movement Disorders', 'Epilepsy'],
        collaborationStatus: 'open'
      },
      {
        id: 24,
        name: 'Dr. George Ibrahim',
        specialty: 'Pediatric Neurosurgery',
        institution: 'Hospital for Sick Children',
        publications: 156,
        researchInterests: ['Pediatric Neurology', 'Epilepsy Surgery', 'Brain Tumors'],
        collaborationStatus: 'selective'
      },
      {
        id: 25,
        name: 'Dr. Asif Doja',
        specialty: 'Pediatric Neurology',
        institution: 'Children\'s Hospital of Eastern Ontario',
        publications: 67,
        researchInterests: ['Pediatric Neurology', 'Movement Disorders', 'Autism'],
        collaborationStatus: 'open'
      },
      // ADHD Researchers (Amsterdam)
      {
        id: 26,
        name: 'Dr. Sarah Durston',
        specialty: 'Developmental Neuroimaging',
        institution: 'University Medical Center Utrecht',
        publications: 145,
        researchInterests: ['Neuroimaging', 'ADHD', 'Brain Development'],
        collaborationStatus: 'open'
      },
      {
        id: 27,
        name: 'Dr. Catharina Hartman',
        specialty: 'Child and Adolescent Psychiatry',
        institution: 'University of Groningen',
        publications: 98,
        researchInterests: ['ADHD', 'Neurofeedback Training', 'Behavioral Interventions'],
        collaborationStatus: 'selective'
      },
      {
        id: 28,
        name: 'Dr. Anouk Schrantee',
        specialty: 'Neuroimaging',
        institution: 'Amsterdam UMC',
        publications: 76,
        researchInterests: ['Neuroimaging', 'ADHD', 'Methylphenidate Brain Connectivity'],
        collaborationStatus: 'open'
      },
      // Depression Researchers (Amsterdam/Netherlands)
      {
        id: 29,
        name: 'Dr. Guido van Wingen',
        specialty: 'Psychiatry and Neuroimaging',
        institution: 'Amsterdam UMC',
        publications: 134,
        researchInterests: ['Neuroimaging', 'Depression', 'Brain Stimulation'],
        collaborationStatus: 'open'
      },
      {
        id: 30,
        name: 'Dr. Claudi Bockting',
        specialty: 'Clinical Psychology',
        institution: 'University of Amsterdam',
        publications: 112,
        researchInterests: ['Depression', 'Cognitive Therapy', 'Long-term Outcomes'],
        collaborationStatus: 'selective'
      },
      {
        id: 31,
        name: 'Dr. Nic van der Wee',
        specialty: 'Psychiatry and Neuroimaging',
        institution: 'Leiden University Medical Center',
        publications: 156,
        researchInterests: ['Neuroimaging', 'Depression', 'Anxiety Disorders'],
        collaborationStatus: 'open'
      },
      {
        id: 32,
        name: 'Dr. Damiaan Denys',
        specialty: 'Psychiatry',
        institution: 'Amsterdam UMC',
        publications: 189,
        researchInterests: ['Depression', 'Deep Brain Stimulation', 'OCD'],
        collaborationStatus: 'selective'
      },
      // Movement Disorders Researchers (Toronto)
      {
        id: 33,
        name: 'Dr. Alfonso Fasano',
        specialty: 'Movement Disorders Neurology',
        institution: 'University Health Network',
        publications: 167,
        researchInterests: ['Movement Disorders', 'Parkinson\'s Disease', 'Deep Brain Stimulation'],
        collaborationStatus: 'open'
      },
      {
        id: 34,
        name: 'Dr. Renato Munhoz',
        specialty: 'Movement Disorders Neurology',
        institution: 'University of Toronto',
        publications: 134,
        researchInterests: ['Movement Disorders', 'Parkinson\'s Disease', 'Dystonia'],
        collaborationStatus: 'selective'
      },
      {
        id: 35,
        name: 'Dr. Anthony Lang',
        specialty: 'Movement Disorders Neurology',
        institution: 'Toronto Western Hospital',
        publications: 298,
        researchInterests: ['Movement Disorders', 'Parkinson\'s Disease', 'Neurodegeneration'],
        collaborationStatus: 'open'
      }

    ];

    // Very permissive filtering - show results for any partial match
    return mockCollaborators.filter(collab => {
      const specialtyLower = (specialty || '').toLowerCase();
      const searchLower = (research_interest || '').toLowerCase();
      
      // If no search terms, return all
      if (!specialty && !research_interest) return true;
      
      // Split search terms for better matching
      const searchTerms = searchLower.split(/[+\s]+/).filter(term => term.length > 0);
      
      // Check if any search term matches anywhere
      const allSearchTerms = [...(specialty ? [specialtyLower] : []), ...searchTerms];
      
      if (allSearchTerms.length === 0) return true;
      
      return allSearchTerms.some(term => 
        collab.name.toLowerCase().includes(term) ||
        collab.specialty.toLowerCase().includes(term) ||
        collab.institution.toLowerCase().includes(term) ||
        collab.researchInterests.some(interest => interest.toLowerCase().includes(term))
      );
    });
  }

  private getCollaboratorLocation(name: string): string {
    // Map collaborator names to their locations based on institutions
    const locationMap: {[key: string]: string} = {
      'Dr. Carolina Gorodetsky': 'Toronto, Canada',
      'Dr. George Ibrahim': 'Toronto, Canada', 
      'Dr. Asif Doja': 'Toronto, Canada',
      'Dr. Sarah Durston': 'Amsterdam, Netherlands',
      'Dr. Catharina Hartman': 'Amsterdam, Netherlands',
      'Dr. Anouk Schrantee': 'Amsterdam, Netherlands',
      'Dr. Guido van Wingen': 'Amsterdam, Netherlands',
      'Dr. Claudi Bockting': 'Amsterdam, Netherlands',
      'Dr. Nic van der Wee': 'Amsterdam, Netherlands',
      'Dr. Damiaan Denys': 'Amsterdam, Netherlands',
      'Dr. Amanda Paulovich': 'New York, USA',
      'Dr. Benjamin Cravatt III': 'New York, USA',
      'Dr. Akhilesh Pandey': 'New York, USA'
    };
    return locationMap[name] || 'Unknown';
  }

  // Meeting Requests API methods
  async createMeetingRequest(requestData: any) {
    return this.request('/api/meeting-requests', {
      method: 'POST',
      body: JSON.stringify(requestData),
    });
  }

  // ORCID sync method
  async syncORCIDData(orcidId: string) {
    return this.request('/api/orcid/sync', {
      method: 'POST',
      body: JSON.stringify({ orcid_id: orcidId }),
    });
  }

  async getMeetingRequests(researcherId: string) {
    return this.request(`/api/meeting-requests/${researcherId}`);
  }

  async updateMeetingRequest(requestId: number, status: string) {
    return this.request(`/api/meeting-requests/${requestId}`, {
      method: 'PUT',
      body: JSON.stringify({ status }),
    });
  }

  // AI-powered methods
  async analyzeCondition(conditionText: string) {
    try {
      return await this.request('/api/ai/analyze-condition', {
        method: 'POST',
        body: JSON.stringify({ text: conditionText, analysis_type: 'condition' }),
      });
    } catch (error) {
      console.error('AI analyze condition failed:', error);
      // Fallback response
      if (conditionText.includes('?') || conditionText.toLowerCase().startsWith('hi') || conditionText.toLowerCase().startsWith('hello')) {
        return {
          success: true,
          data: {
            primaryCondition: "I'm here to help with medical questions and finding researchers. What specific condition or research area interests you?",
            identifiedConditions: [conditionText]
          }
        };
      } else {
        return {
          success: true,
          data: {
            primaryCondition: conditionText,
            identifiedConditions: [conditionText]
          }
        };
      }
    }
  }

  async generateTrialSummary(trialData: any) {
    try {
      return await this.request('/api/ai/trial-summary', {
        method: 'POST',
        body: JSON.stringify(trialData),
      });
    } catch (error) {
      console.error('AI trial summary failed:', error);
      return {
        success: true,
        summary: `This trial studies ${trialData.title}. Contact the research team for more details.`
      };
    }
  }

  async getResearchSuggestions(researcherProfile: any) {
    try {
      return await this.request('/api/ai/research-suggestions', {
        method: 'POST',
        body: JSON.stringify(researcherProfile),
      });
    } catch (error) {
      console.error('AI research suggestions failed:', error);
      const specialties = researcherProfile?.specialties || [];
      if (researcherProfile?.question) {
        return {
          success: true,
          suggestions: specialties.length > 0 
            ? [`I can help with research in ${specialties.join(', ')}. What specific research challenge are you facing?`]
            : ["I can help with research collaboration and academic questions. What would you like to know?"]
        };
      } else {
        return {
          success: true,
          suggestions: ["Consider interdisciplinary collaborations", "Explore international partnerships", "Join research networks in your field"]
        };
      }
    }
  }

}

export const apiService = new ApiService();