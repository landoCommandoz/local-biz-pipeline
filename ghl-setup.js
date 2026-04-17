require('dotenv').config();

const BASE_URL = 'https://services.leadconnectorhq.com';
const API_KEY = process.env.GHL_API_KEY;
const HEADERS = {
  'Authorization': `Bearer ${API_KEY}`,
  'Version': '2021-07-28',
  'Content-Type': 'application/json',
};

async function listSubAccounts() {
  // Try the company locations search endpoint first
  const searchRes = await fetch(`${BASE_URL}/locations/search?skip=0&limit=100`, {
    method: 'GET',
    headers: HEADERS,
  });
  if (searchRes.ok) {
    const data = await searchRes.json();
    return data.locations || [];
  }

  // Fallback: try the /locations endpoint
  const res = await fetch(`${BASE_URL}/locations/?skip=0&limit=100`, {
    method: 'GET',
    headers: HEADERS,
  });
  if (!res.ok) {
    const text = await res.text();
    throw new Error(`Failed to list sub-accounts: ${res.status} ${text}`);
  }
  const data = await res.json();
  return data.locations || [];
}

async function updatePhone(locationId, phone) {
  const res = await fetch(`${BASE_URL}/locations/${locationId}`, {
    method: 'PUT',
    headers: HEADERS,
    body: JSON.stringify({ phone }),
  });
  if (!res.ok) {
    const text = await res.text();
    throw new Error(`Failed to update phone: ${res.status} ${text}`);
  }
  return res.json();
}

async function main() {
  console.log('Fetching sub-accounts...\n');
  const locations = await listSubAccounts();

  console.log(`Found ${locations.length} sub-account(s):\n`);
  for (const loc of locations) {
    console.log(`  ID: ${loc.id}`);
    console.log(`  Name: ${loc.name}`);
    console.log(`  Phone: ${loc.phone || '(none)'}`);
    console.log('');
  }

  const target = locations.find((loc) => loc.name === 'HVAC Template Account');
  if (!target) {
    console.error('Could not find sub-account named "HVAC Template Account"');
    process.exit(1);
  }

  const newPhone = '+16026094756';
  console.log(`Updating "${target.name}" (${target.id}) phone to ${newPhone}...`);
  const result = await updatePhone(target.id, newPhone);
  console.log('Update successful:', JSON.stringify(result, null, 2));
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
