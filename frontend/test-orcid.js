// Test ORCID sync specifically
const BACKEND_URL = 'https://curalink-backend-42qr.onrender.com';

async function testORCIDSync() {
  console.log('Testing ORCID sync...');
  
  try {
    const response = await fetch(`${BACKEND_URL}/api/orcid/sync`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        orcid_id: '0000-0002-1825-0097'  // Josiah Carberry test ORCID
      })
    });
    
    console.log(`Status: ${response.status}`);
    console.log(`Headers:`, Object.fromEntries(response.headers.entries()));
    
    if (response.ok) {
      const data = await response.json();
      console.log('Success:', data);
    } else {
      const errorText = await response.text();
      console.log('Error:', errorText);
    }
    
  } catch (error) {
    console.error('Request failed:', error);
  }
}

testORCIDSync();