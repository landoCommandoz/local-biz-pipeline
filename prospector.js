require('dotenv').config();
const fetch = require('node-fetch');
const fs = require('fs');
const { createObjectCsvWriter } = require('csv-writer');

const API_KEY = process.env.GOOGLE_PLACES_API_KEY;
if (!API_KEY) {
  console.error('Missing GOOGLE_PLACES_API_KEY in .env');
  process.exit(1);
}

const TRADES = ['HVAC', 'plumbing', 'electrical'];
const CITIES = [
  'Phoenix', 'Scottsdale', 'Mesa', 'Chandler',
  'Gilbert', 'Tempe', 'Surprise'
];

const MIN_RATING = 2.5;
const MAX_RATING = 4.2;
const MIN_REVIEWS = 5;

const BASE_URL = 'https://maps.googleapis.com/maps/api/place';

async function textSearch(query, pageToken) {
  const params = new URLSearchParams({
    query,
    key: API_KEY
  });
  if (pageToken) params.set('pagetoken', pageToken);

  const res = await fetch(`${BASE_URL}/textsearch/json?${params}`);
  const data = await res.json();

  if (data.status !== 'OK' && data.status !== 'ZERO_RESULTS') {
    console.error(`  API error (${data.status}): ${data.error_message || 'unknown'}`);
  }
  return data;
}

async function getPlaceDetails(placeId) {
  const fields = 'name,formatted_phone_number,website,rating,user_ratings_total,formatted_address';
  const params = new URLSearchParams({
    place_id: placeId,
    fields,
    key: API_KEY
  });

  const res = await fetch(`${BASE_URL}/details/json?${params}`);
  const data = await res.json();

  if (data.status !== 'OK') {
    return null;
  }
  return data.result;
}

function sleep(ms) {
  return new Promise(resolve => setTimeout(resolve, ms));
}

async function scrapeAll() {
  const seen = new Set();
  const allResults = [];

  for (const trade of TRADES) {
    for (const city of CITIES) {
      const query = `${trade} companies in ${city}, Arizona`;
      console.log(`Searching: ${query}`);

      let pageToken = null;
      let page = 1;

      do {
        const data = await textSearch(query, pageToken);
        const results = data.results || [];

        for (const place of results) {
          if (seen.has(place.place_id)) continue;
          seen.add(place.place_id);

          const details = await getPlaceDetails(place.place_id);
          if (!details) continue;

          allResults.push({
            name: details.name || '',
            phone: details.formatted_phone_number || '',
            website: details.website || '',
            rating: details.rating || 0,
            reviews: details.user_ratings_total || 0,
            address: details.formatted_address || '',
            trade,
            city
          });
        }

        pageToken = data.next_page_token || null;
        if (pageToken) {
          // Google requires a short delay before using next_page_token
          await sleep(2000);
        }
        page++;
      } while (pageToken && page <= 3);
    }
  }

  return allResults;
}

function filterProspects(results) {
  return results.filter(b =>
    b.rating >= MIN_RATING &&
    b.rating <= MAX_RATING &&
    b.reviews >= MIN_REVIEWS
  );
}

async function saveResults(all, filtered) {
  // Save JSON
  fs.writeFileSync('prospects.json', JSON.stringify(filtered, null, 2));
  console.log(`\nSaved ${filtered.length} prospects to prospects.json`);

  // Save CSV
  const csvWriter = createObjectCsvWriter({
    path: 'prospects.csv',
    header: [
      { id: 'name', title: 'Business Name' },
      { id: 'phone', title: 'Phone' },
      { id: 'website', title: 'Website' },
      { id: 'rating', title: 'Rating' },
      { id: 'reviews', title: 'Reviews' },
      { id: 'address', title: 'Address' },
      { id: 'trade', title: 'Trade' },
      { id: 'city', title: 'City' }
    ]
  });
  await csvWriter.writeRecords(filtered);
  console.log(`Saved ${filtered.length} prospects to prospects.csv`);
}

function printSummary(all, filtered) {
  console.log('\n=== PROSPECTOR SUMMARY ===');
  console.log(`Total businesses found:    ${all.length}`);
  console.log(`After filtering:           ${filtered.length}`);
  console.log(`Filter: rating ${MIN_RATING}–${MAX_RATING}, reviews >= ${MIN_REVIEWS}`);
  console.log('\nFirst 5 prospects:');
  console.log('-'.repeat(80));

  filtered.slice(0, 5).forEach((b, i) => {
    console.log(`${i + 1}. ${b.name}`);
    console.log(`   Phone: ${b.phone || 'N/A'}  |  Rating: ${b.rating} (${b.reviews} reviews)`);
    console.log(`   Website: ${b.website || 'N/A'}`);
    console.log(`   Address: ${b.address}`);
    console.log(`   Trade: ${b.trade}  |  City: ${b.city}`);
    console.log('');
  });
}

async function main() {
  console.log('Starting prospector...\n');
  const all = await scrapeAll();
  const filtered = filterProspects(all);
  await saveResults(all, filtered);
  printSummary(all, filtered);
}

main().catch(err => {
  console.error('Fatal error:', err);
  process.exit(1);
});
