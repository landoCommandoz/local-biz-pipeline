require('dotenv').config({ path: __dirname + '/.env' });

const { writeCSV, readCSV } = require('./csv-utils');

const API_KEY = process.env.GOOGLE_PLACES_API_KEY;
const MAX_LEADS = 20;

async function textSearch(query) {
  const url = new URL('https://maps.googleapis.com/maps/api/place/textsearch/json');
  url.searchParams.set('query', query);
  url.searchParams.set('key', API_KEY);

  const res = await fetch(url.toString());
  if (!res.ok) throw new Error(`Text Search failed: ${res.status} ${res.statusText}`);
  const data = await res.json();

  if (data.status !== 'OK' && data.status !== 'ZERO_RESULTS') {
    throw new Error(`Places API error: ${data.status} — ${data.error_message || ''}`);
  }
  return data.results || [];
}

async function getPlaceDetails(placeId) {
  const url = new URL('https://maps.googleapis.com/maps/api/place/details/json');
  url.searchParams.set('place_id', placeId);
  url.searchParams.set('fields', 'website,formatted_phone_number,formatted_address,name,types,rating,user_ratings_total,photos,reviews,opening_hours');
  url.searchParams.set('key', API_KEY);

  const res = await fetch(url.toString());
  if (!res.ok) throw new Error(`Details failed: ${res.status}`);
  const data = await res.json();

  if (data.status !== 'OK') {
    throw new Error(`Details error: ${data.status}`);
  }
  return data.result;
}

async function main() {
  const searchTerm = process.argv[2];
  const city = process.argv[3];

  if (!searchTerm || !city) {
    console.error('Usage: node scraper.js "<search term>" "<city state>"');
    console.error('Example: node scraper.js "plumber" "Salt Lake City UT"');
    process.exit(1);
  }

  if (!API_KEY) {
    console.error('Error: GOOGLE_PLACES_API_KEY not set. Add it to pipeline/local-biz/.env');
    process.exit(1);
  }

  const query = `${searchTerm} in ${city}`;
  console.log(`Searching: "${query}"...`);

  let results;
  try {
    results = await textSearch(query);
  } catch (err) {
    console.error(`Search failed: ${err.message}`);
    process.exit(1);
  }

  console.log(`Found ${results.length} results. Fetching details...`);

  const leads = [];

  for (const place of results) {
    if (leads.length >= MAX_LEADS) break;

    try {
      const details = await getPlaceDetails(place.place_id);

      const category = (details.types || place.types || [])
        .filter(t => !['point_of_interest', 'establishment'].includes(t))
        .map(t => t.replace(/_/g, ' '))
        .slice(0, 2)
        .join(', ') || searchTerm;

      // Build photo URLs from photo_reference (up to 3)
      const photoUrls = (details.photos || []).slice(0, 3).map(p =>
        `https://maps.googleapis.com/maps/api/place/photo?maxwidth=800&photo_reference=${p.photo_reference}&key=${API_KEY}`
      );

      // Extract up to 3 reviews (author, rating, text)
      const reviews = (details.reviews || []).slice(0, 3).map(r => ({
        author: r.author_name || 'Customer',
        rating: r.rating || 5,
        text: (r.text || '').slice(0, 200)
      }));

      // Extract opening hours weekday text
      const hours = (details.opening_hours && details.opening_hours.weekday_text)
        ? details.opening_hours.weekday_text
        : [];

      leads.push({
        business_name: details.name || place.name,
        address: details.formatted_address || place.formatted_address || '',
        phone: details.formatted_phone_number || '',
        category: category,
        place_id: place.place_id,
        rating: String(details.rating || ''),
        review_count: String(details.user_ratings_total || ''),
        photos: photoUrls.length > 0 ? JSON.stringify(photoUrls) : '',
        reviews_json: reviews.length > 0 ? JSON.stringify(reviews) : '',
        hours_json: hours.length > 0 ? JSON.stringify(hours) : '',
        website: details.website || ''
      });

      console.log(`  LEAD: ${details.name || place.name}`);
    } catch (err) {
      console.warn(`  ERROR on ${place.name}: ${err.message} — skipping`);
    }
  }

  if (leads.length === 0) {
    console.log('No leads found.');
    return;
  }

  const columns = ['business_name', 'address', 'phone', 'category', 'place_id', 'rating', 'review_count', 'photos', 'reviews_json', 'hours_json', 'website'];

  // Preserve existing rows from previous runs
  const existing = readCSV('leads.csv');
  const existingIds = new Set(existing.map(r => r.place_id));
  const newLeads = leads.filter(l => !existingIds.has(l.place_id));
  const allRows = [...existing, ...newLeads];

  // Use all columns that exist (preserve local_file, live_url from prior runs)
  const allColumns = [...new Set([...columns, ...Object.keys(allRows[0] || {})])];
  writeCSV('leads.csv', allRows, allColumns);

  console.log(`\nWrote ${newLeads.length} new leads (${allRows.length} total) to leads.csv`);
}

main().catch(err => {
  console.error(`Fatal: ${err.message}`);
  process.exit(1);
});
