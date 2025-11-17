// Medical condition processing and identification
const medicalConditions = [
  // Cancer types
  'Brain Cancer', 'Lung Cancer', 'Breast Cancer', 'Prostate Cancer', 'Colon Cancer',
  'Glioblastoma', 'Glioma', 'Melanoma', 'Leukemia', 'Lymphoma', 'Sarcoma',
  
  // Neurological
  'Alzheimer Disease', 'Parkinson Disease', 'Epilepsy', 'Multiple Sclerosis', 'Stroke', 'Migraine',
  'ADHD', 'Attention-Deficit/Hyperactivity Disorder (ADHD)', 'Attention Deficit Hyperactivity Disorder',
  'Multiple System Atrophy', 'Ductal Carcinoma in Situ', 'DCIS',
  
  // Cardiovascular
  'Heart Disease', 'Hypertension', 'Diabetes', 'High Blood Pressure', 'Cardiac Disease',
  
  // Other common conditions
  'Arthritis', 'Asthma', 'Depression', 'Anxiety', 'Obesity', 'Kidney Disease',
  'Liver Disease', 'Autoimmune Disease', 'Fibromyalgia', 'Chronic Pain',
  'Major Depressive Disorder', 'Major Depressive Disorder (Depression)', 'Treatment-Resistant Depression'
];

const conditionSynonyms: { [key: string]: string } = {
  // Cancer synonyms
  'tumor': 'Brain Cancer',
  'tumour': 'Brain Cancer',
  'malignancy': 'Brain Cancer',
  'carcinoma': 'Brain Cancer',
  'oncology': 'Brain Cancer',
  
  // Brain conditions
  'brain tumor': 'Brain Cancer',
  'brain tumour': 'Brain Cancer',
  'gbm': 'Glioblastoma',
  
  // Heart conditions
  'heart attack': 'Heart Disease',
  'cardiovascular': 'Heart Disease',
  'high bp': 'Hypertension',
  
  // Mental health
  'mental health': 'Depression',
  'ptsd': 'Anxiety',
  'adhd': 'ADHD',
  'attention deficit': 'ADHD',
  'hyperactivity': 'ADHD',
  'add': 'ADHD',
  'major depression': 'Major Depressive Disorder',
  'mdd': 'Major Depressive Disorder',
  'clinical depression': 'Depression',
  'depressive disorder': 'Major Depressive Disorder',
  
  // Diabetes
  'type 1 diabetes': 'Diabetes',
  'type 2 diabetes': 'Diabetes',
  'diabetic': 'Diabetes'
};

export function processConditionInput(input: string): {
  originalInput: string;
  identifiedConditions: string[];
  primaryCondition: string;
  confidence: number;
} {
  const normalizedInput = input.toLowerCase().trim();
  const identifiedConditions: string[] = [];
  
  // Direct condition matching
  medicalConditions.forEach(condition => {
    if (normalizedInput.includes(condition)) {
      identifiedConditions.push(condition);
    }
  });
  
  // Synonym matching
  Object.entries(conditionSynonyms).forEach(([synonym, standardCondition]) => {
    if (normalizedInput.includes(synonym) && !identifiedConditions.includes(standardCondition)) {
      identifiedConditions.push(standardCondition);
    }
  });
  
  // Pattern matching for common phrases
  const patterns = [
    { pattern: /diagnosed with (.+?)(?:\s|$|,|\.)/i, extract: 1 },
    { pattern: /have (.+?)(?:\s|$|,|\.)/i, extract: 1 },
    { pattern: /suffering from (.+?)(?:\s|$|,|\.)/i, extract: 1 },
    { pattern: /treatment for (.+?)(?:\s|$|,|\.)/i, extract: 1 }
  ];
  
  patterns.forEach(({ pattern, extract }) => {
    const match = normalizedInput.match(pattern);
    if (match && match[extract]) {
      const extractedCondition = match[extract].trim();
      medicalConditions.forEach(condition => {
        if (extractedCondition.includes(condition) && !identifiedConditions.includes(condition)) {
          identifiedConditions.push(condition);
        }
      });
    }
  });
  
  // Determine primary condition and confidence
  let primaryCondition = identifiedConditions[0];
  
  // If no conditions identified, try to extract from common patterns
  if (!primaryCondition) {
    const extractPatterns = [
      /(?:diagnosed with|have|suffering from|treatment for)\s+(.+?)(?:\s*[,.]|$)/i,
      /(.+?)\s*(?:cancer|disease|disorder|condition)/i,
      /^(.+?)$/i // fallback to full input
    ];
    
    for (const pattern of extractPatterns) {
      const match = input.match(pattern);
      if (match && match[1]) {
        primaryCondition = match[1].trim();
        // Capitalize first letter of each word
        primaryCondition = primaryCondition.split(' ').map(word => 
          word.charAt(0).toUpperCase() + word.slice(1).toLowerCase()
        ).join(' ');
        break;
      }
    }
  }
  
  const confidence = identifiedConditions.length > 0 ? 0.8 : 0.3;
  
  return {
    originalInput: input,
    identifiedConditions,
    primaryCondition,
    confidence
  };
}

export function getConditionSuggestions(input: string): string[] {
  const normalizedInput = input.toLowerCase();
  
  return medicalConditions
    .filter(condition => condition.toLowerCase().includes(normalizedInput) || normalizedInput.includes(condition.toLowerCase()))
    .slice(0, 5);
}