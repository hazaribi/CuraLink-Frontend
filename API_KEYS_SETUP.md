# External API Keys Setup Guide

## Required API Keys for Production

### 1. NCBI/PubMed API Key
- **URL**: https://ncbiinsights.ncbi.nlm.nih.gov/2017/11/02/new-api-keys-for-the-e-utilities/
- **Free**: Yes (10 requests/second with key vs 3/second without)
- **Setup**: Register at NCBI, get API key
- **Env**: `NCBI_API_KEY=your_key_here`

### 2. ORCID API Credentials
- **URL**: https://orcid.org/developer-tools
- **Free**: Yes (public API)
- **Setup**: Register app, get client ID/secret
- **Env**: 
  ```
  ORCID_CLIENT_ID=your_client_id
  ORCID_CLIENT_SECRET=your_client_secret
  ```

### 3. SerpAPI (Google Scholar)
- **URL**: https://serpapi.com/
- **Free**: 100 searches/month
- **Paid**: $50/month for 5,000 searches
- **Setup**: Register, get API key
- **Env**: `SERPAPI_KEY=your_serpapi_key`

### 4. ClinicalTrials.gov
- **URL**: https://clinicaltrials.gov/api/
- **Free**: Yes (no key required, but rate limited)
- **Rate Limit**: 1,000 requests/hour

### 5. ResearchGate
- **Status**: No public API available
- **Alternative**: Web scraping (requires legal compliance)
- **Recommendation**: Partner with ResearchGate or use mock data

## Rate Limits & Costs

| Service | Free Tier | Rate Limit | Cost |
|---------|-----------|------------|------|
| PubMed | Unlimited | 10/sec with key | Free |
| ORCID | Unlimited | 24/sec | Free |
| SerpAPI | 100/month | No limit | $50/month |
| ClinicalTrials | Unlimited | 1000/hour | Free |
| ResearchGate | N/A | N/A | N/A |

## Setup Instructions

1. **Copy environment file**:
   ```bash
   cp .env.example .env
   ```

2. **Add your API keys to `.env`**:
   ```bash
   NCBI_API_KEY=your_actual_key
   ORCID_CLIENT_ID=your_actual_id
   SERPAPI_KEY=your_actual_key
   ```

3. **Restart backend server**:
   ```bash
   python main.py
   ```

## Production Recommendations

- **Start with free tiers** for MVP
- **Monitor usage** and upgrade as needed
- **Implement caching** to reduce API calls
- **Add retry logic** for failed requests
- **Consider rate limiting** on your own API