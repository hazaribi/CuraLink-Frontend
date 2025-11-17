// City to country mapping
const cityToCountry: { [key: string]: string } = {
  // US Cities
  'new york': 'USA', 'los angeles': 'USA', 'chicago': 'USA', 'houston': 'USA', 'phoenix': 'USA', 'philadelphia': 'USA',
  'san antonio': 'USA', 'san diego': 'USA', 'dallas': 'USA', 'san jose': 'USA', 'austin': 'USA', 'jacksonville': 'USA',
  'fort worth': 'USA', 'columbus': 'USA', 'charlotte': 'USA', 'san francisco': 'USA', 'indianapolis': 'USA',
  'seattle': 'USA', 'denver': 'USA', 'washington': 'USA', 'boston': 'USA', 'nashville': 'USA', 'baltimore': 'USA',
  'oklahoma city': 'USA', 'louisville': 'USA', 'portland': 'USA', 'las vegas': 'USA', 'milwaukee': 'USA', 'albuquerque': 'USA',
  'tucson': 'USA', 'fresno': 'USA', 'sacramento': 'USA', 'mesa': 'USA', 'kansas city': 'USA', 'atlanta': 'USA', 'omaha': 'USA',
  'colorado springs': 'USA', 'raleigh': 'USA', 'miami': 'USA', 'oakland': 'USA', 'minneapolis': 'USA', 'tulsa': 'USA',
  'cleveland': 'USA', 'wichita': 'USA', 'arlington': 'USA', 'bakersfield': 'USA', 'tampa': 'USA', 'aurora': 'USA', 'honolulu': 'USA',
  
  // UK Cities
  'london': 'UK', 'manchester': 'UK', 'birmingham': 'UK', 'liverpool': 'UK', 'leeds': 'UK', 'glasgow': 'UK', 'edinburgh': 'UK',
  
  // European Cities
  'paris': 'France', 'berlin': 'Germany', 'madrid': 'Spain', 'rome': 'Italy', 'amsterdam': 'Netherlands', 'vienna': 'Austria', 'zurich': 'Switzerland',
  
  // Canadian Cities
  'toronto': 'Canada', 'vancouver': 'Canada', 'montreal': 'Canada', 'calgary': 'Canada', 'ottawa': 'Canada',
  
  // Australian Cities
  'sydney': 'Australia', 'melbourne': 'Australia', 'brisbane': 'Australia', 'perth': 'Australia', 'adelaide': 'Australia',
  
  // Asian Cities
  'tokyo': 'Japan', 'osaka': 'Japan', 'kyoto': 'Japan', 'seoul': 'South Korea', 'busan': 'South Korea',
  'beijing': 'China', 'shanghai': 'China', 'guangzhou': 'China', 'shenzhen': 'China',
  
  // Indian Cities
  'mumbai': 'India', 'delhi': 'India', 'bangalore': 'India', 'hyderabad': 'India', 'chennai': 'India', 'kolkata': 'India',
  'pune': 'India', 'ahmedabad': 'India', 'surat': 'India', 'jaipur': 'India', 'lucknow': 'India', 'kanpur': 'India',
  'nagpur': 'India', 'indore': 'India', 'thane': 'India', 'bhopal': 'India', 'visakhapatnam': 'India', 'pimpri-chinchwad': 'India',
  'patna': 'India', 'vadodara': 'India', 'ghaziabad': 'India', 'ludhiana': 'India', 'agra': 'India', 'nashik': 'India',
  'faridabad': 'India', 'meerut': 'India', 'rajkot': 'India', 'kalyan-dombivali': 'India', 'vasai-virar': 'India',
  'varanasi': 'India', 'srinagar': 'India', 'aurangabad': 'India', 'dhanbad': 'India', 'amritsar': 'India', 'navi mumbai': 'India',
  'allahabad': 'India', 'ranchi': 'India', 'howrah': 'India', 'coimbatore': 'India', 'jabalpur': 'India', 'gwalior': 'India',
  'vijayawada': 'India', 'madurai': 'India', 'raipur': 'India', 'kota': 'India', 'chandigarh': 'India', 'guwahati': 'India',
  'solapur': 'India', 'hubli-dharwad': 'India', 'tiruchirappalli': 'India', 'bareilly': 'India', 'mysore': 'India',
  'tiruppur': 'India', 'gurgaon': 'India', 'aligarh': 'India', 'moradabad': 'India', 'jalandhar': 'India', 'bhubaneswar': 'India',
  'salem': 'India', 'warangal': 'India', 'guntur': 'India', 'bhiwandi': 'India', 'saharanpur': 'India', 'gorakhpur': 'India',
  'bikaner': 'India', 'amravati': 'India', 'noida': 'India', 'jamshedpur': 'India', 'bhilai': 'India', 'cuttack': 'India',
  'firozabad': 'India', 'kochi': 'India', 'nellore': 'India', 'bhavnagar': 'India', 'dehradun': 'India', 'durgapur': 'India',
  'asansol': 'India', 'rourkela': 'India', 'nanded': 'India', 'kolhapur': 'India', 'ajmer': 'India', 'akola': 'India',
  'gulbarga': 'India', 'jamnagar': 'India', 'ujjain': 'India', 'loni': 'India', 'siliguri': 'India', 'jhansi': 'India',
  'ulhasnagar': 'India', 'jammu': 'India', 'sangli': 'India', 'mangalore': 'India', 'erode': 'India', 'belgaum': 'India',
  'ambattur': 'India', 'tirunelveli': 'India', 'malegaon': 'India', 'gaya': 'India', 'jalgaon': 'India', 'udaipur': 'India',
  'maheshtala': 'India', 'davanagere': 'India', 'kozhikode': 'India', 'kurnool': 'India', 'rajahmundry': 'India',
  'bokaro': 'India', 'bellary': 'India', 'patiala': 'India', 'gopalpur': 'India', 'agartala': 'India', 'bhagalpur': 'India',
  'muzaffarnagar': 'India', 'bhatpara': 'India', 'panihati': 'India', 'latur': 'India', 'dhule': 'India', 'rohtak': 'India',
  'korba': 'India', 'bhilwara': 'India', 'berhampur': 'India', 'muzaffarpur': 'India', 'ahmednagar': 'India',
  'mathura': 'India', 'kollam': 'India', 'avadi': 'India', 'kadapa': 'India', 'sambalpur': 'India', 'bilaspur': 'India',
  'shahjahanpur': 'India', 'satara': 'India', 'bijapur': 'India', 'rampur': 'India', 'shivamogga': 'India',
  'chandrapur': 'India', 'junagadh': 'India', 'thrissur': 'India', 'alwar': 'India', 'bardhaman': 'India',
  'kakinada': 'India', 'nizamabad': 'India', 'parbhani': 'India', 'tumkur': 'India', 'khammam': 'India',
  'bihar sharif': 'India', 'panipat': 'India', 'darbhanga': 'India', 'aizawl': 'India', 'dewas': 'India',
  'karnal': 'India', 'bathinda': 'India', 'jalna': 'India', 'eluru': 'India', 'barabanki': 'India', 'purnia': 'India',
  'satna': 'India', 'mau': 'India', 'sonipat': 'India', 'farrukhabad': 'India', 'sagar': 'India', 'durg': 'India',
  'imphal': 'India', 'ratlam': 'India', 'hapur': 'India', 'arrah': 'India', 'anantapur': 'India', 'karimnagar': 'India',
  'etawah': 'India', 'ambernath': 'India', 'bharatpur': 'India', 'begusarai': 'India', 'new delhi': 'India',
  'gandhidham': 'India', 'baranagar': 'India', 'tiruvottiyur': 'India', 'puducherry': 'India', 'sikar': 'India',
  'thoothukudi': 'India', 'rewa': 'India', 'mirzapur': 'India', 'raichur': 'India', 'pali': 'India',
  'ramagundam': 'India', 'haridwar': 'India', 'vijayanagaram': 'India', 'katihar': 'India', 'nagarcoil': 'India',
  'sri ganganagar': 'India', 'mango': 'India', 'thanjavur': 'India', 'bulandshahr': 'India', 'uluberia': 'India',
  'sambhal': 'India', 'singrauli': 'India', 'nadiad': 'India', 'secunderabad': 'India', 'naihati': 'India',
  'yamunanagar': 'India', 'pallavaram': 'India', 'bidar': 'India', 'munger': 'India', 'panchkula': 'India',
  'burhanpur': 'India', 'kharagpur': 'India', 'dindigul': 'India', 'gandhinagar': 'India', 'hospet': 'India',
  'malda': 'India', 'ongole': 'India', 'deoghar': 'India', 'chapra': 'India', 'haldia': 'India', 'khandwa': 'India',
  'nandyal': 'India', 'chittoor': 'India', 'morena': 'India', 'amroha': 'India', 'anand': 'India', 'bhind': 'India',
  'ambala': 'India', 'morbi': 'India', 'fatehpur': 'India', 'rae bareli': 'India', 'bhusawal': 'India', 'orai': 'India',
  'bahraich': 'India', 'vellore': 'India', 'mahesana': 'India', 'raiganj': 'India', 'sirsa': 'India', 'danapur': 'India',
  'serampore': 'India', 'guna': 'India', 'jaunpur': 'India', 'panvel': 'India', 'shivpuri': 'India', 'unnao': 'India',
  'alappuzha': 'India', 'kottayam': 'India', 'machilipatnam': 'India', 'shimla': 'India', 'adoni': 'India',
  'tenali': 'India', 'proddatur': 'India', 'saharsa': 'India', 'hindupur': 'India', 'sasaram': 'India', 'hajipur': 'India',
  'bhimavaram': 'India', 'dehri': 'India', 'madanapalle': 'India', 'siwan': 'India', 'bettiah': 'India',
  'guntakal': 'India', 'srikakulam': 'India', 'motihari': 'India', 'dharmavaram': 'India', 'gudivada': 'India',
  'narasaraopet': 'India', 'bagaha': 'India', 'miryalaguda': 'India', 'tadipatri': 'India', 'kishanganj': 'India',
  'karaikudi': 'India', 'suryapet': 'India', 'jamalpur': 'India', 'kavali': 'India', 'tadepalligudem': 'India',
  'amaravati': 'India', 'buxar': 'India', 'jehanabad': 'India'
};

// Get all cities for suggestions
const cities = Object.keys(cityToCountry);

const countries = [
  'usa', 'united states', 'america', 'us', 'canada', 'uk', 'united kingdom', 
  'england', 'scotland', 'wales', 'ireland', 'france', 'germany', 'italy', 
  'spain', 'netherlands', 'belgium', 'switzerland', 'austria', 'sweden', 
  'norway', 'denmark', 'finland', 'poland', 'czech republic', 'hungary',
  'australia', 'new zealand', 'japan', 'south korea', 'china', 'india', 
  'singapore', 'malaysia', 'thailand', 'philippines', 'indonesia', 'vietnam',
  'brazil', 'argentina', 'chile', 'colombia', 'mexico', 'peru', 'venezuela'
];

const stateAbbreviations: { [key: string]: string } = {
  'ny': 'New York', 'ca': 'California', 'tx': 'Texas', 'fl': 'Florida',
  'il': 'Illinois', 'pa': 'Pennsylvania', 'oh': 'Ohio', 'ga': 'Georgia',
  'nc': 'North Carolina', 'mi': 'Michigan', 'nj': 'New Jersey', 'va': 'Virginia',
  'wa': 'Washington', 'az': 'Arizona', 'ma': 'Massachusetts', 'tn': 'Tennessee',
  'in': 'Indiana', 'mo': 'Missouri', 'md': 'Maryland', 'wi': 'Wisconsin',
  'co': 'Colorado', 'mn': 'Minnesota', 'sc': 'South Carolina', 'al': 'Alabama'
};

export function processLocationInput(input: string): {
  originalInput: string;
  city: string;
  country: string;
  formattedLocation: string;
  confidence: number;
} {
  const normalizedInput = input.toLowerCase().trim();
  let city = '';
  let country = '';
  let confidence = 0.3;

  // Split by common separators
  const parts = normalizedInput.split(/[,;]/).map(p => p.trim());
  
  // Pattern matching for "City, Country" format
  if (parts.length >= 2) {
    const potentialCity = parts[0];
    const potentialCountry = parts[1];
    
    // Check if first part is a city
    const foundCity = cities.find(c => c === potentialCity || potentialCity.includes(c));
    if (foundCity) {
      city = foundCity;
      confidence += 0.3;
    }
    
    // Check if second part is a country
    const foundCountry = countries.find(c => c === potentialCountry || potentialCountry.includes(c));
    if (foundCountry) {
      country = foundCountry === 'usa' || foundCountry === 'us' || foundCountry === 'america' ? 'USA' : 
                foundCountry === 'uk' || foundCountry === 'united kingdom' ? 'UK' : foundCountry;
      confidence += 0.3;
    }
    
    // Handle state abbreviations for US
    if (!foundCountry && stateAbbreviations[potentialCountry]) {
      country = 'USA';
      confidence += 0.2;
    }
  }
  
  // Single input - try to identify
  if (parts.length === 1) {
    const singleInput = parts[0];
    
    // Check if it's a city
    const foundCity = cities.find(c => c === singleInput || singleInput.includes(c));
    if (foundCity) {
      city = foundCity;
      confidence += 0.2;
    }
    
    // Check if it's a country
    const foundCountry = countries.find(c => c === singleInput || singleInput.includes(c));
    if (foundCountry) {
      country = foundCountry === 'usa' || foundCountry === 'us' || foundCountry === 'america' ? 'USA' : foundCountry;
      confidence += 0.2;
    }
  }
  
  // Fallback - use original input
  if (!city && !country) {
    if (parts.length >= 2) {
      city = parts[0];
      country = parts[1];
    } else {
      city = normalizedInput;
      country = 'Unknown';
    }
  }
  
  // Format output
  const formattedCity = city.split(' ').map(word => 
    word.charAt(0).toUpperCase() + word.slice(1)
  ).join(' ');
  
  const formattedCountry = country.split(' ').map(word => 
    word.charAt(0).toUpperCase() + word.slice(1)
  ).join(' ');
  
  const formattedLocation = `${formattedCity}, ${formattedCountry}`;
  
  return {
    originalInput: input,
    city: formattedCity,
    country: formattedCountry,
    formattedLocation,
    confidence
  };
}

export function getLocationSuggestions(input: string): string[] {
  const normalizedInput = input.toLowerCase();
  
  const citySuggestions = cities
    .filter(city => city.includes(normalizedInput) || normalizedInput.includes(city))
    .slice(0, 3)
    .map(city => city.split(' ').map(word => word.charAt(0).toUpperCase() + word.slice(1)).join(' '));
  
  const countrySuggestions = countries
    .filter(country => country.includes(normalizedInput))
    .slice(0, 2)
    .map(country => country === 'usa' ? 'USA' : country.charAt(0).toUpperCase() + country.slice(1));
  
  return [...citySuggestions, ...countrySuggestions];
}

export function getCityCountry(cityName: string): string {
  const normalizedCity = cityName.toLowerCase();
  return cityToCountry[normalizedCity] || 'Unknown';
}