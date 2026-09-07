import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
dotenv.config({ path: path.join(__dirname, '.env') });

const CLIENT_ID = process.env.FATSECRET_CLIENT_ID;
const CLIENT_SECRET = process.env.FATSECRET_CLIENT_SECRET;

console.log('Testing FatSecret with ID:', CLIENT_ID);

async function test() {
  // Step 1: Token
  const credentials = Buffer.from(`${CLIENT_ID}:${CLIENT_SECRET}`).toString('base64');
  console.log('Requesting OAuth token...');
  const tokenRes = await fetch('https://oauth.fatsecret.com/connect/token', {
    method: 'POST',
    headers: {
      'Authorization': `Basic ${credentials}`,
      'Content-Type': 'application/x-www-form-urlencoded'
    },
    body: 'grant_type=client_credentials&scope=basic'
  });
  
  const tokenData = await tokenRes.json();
  console.log('Token response:', tokenData);
  if (!tokenData.access_token) {
    console.error('Failed to get access token');
    return;
  }

  const token = tokenData.access_token;

  // Step 2: Test basic foods.search for "elote dorado" without region
  console.log('\n--- Test 1: foods.search without region ---');
  await doSearch(token, {
    method: 'foods.search',
    search_expression: 'elote dorado',
    format: 'json'
  });

  // Step 3: Test foods.search with region: 'MX'
  console.log('\n--- Test 2: foods.search with region: "MX" ---');
  await doSearch(token, {
    method: 'foods.search',
    search_expression: 'elote dorado',
    region: 'MX',
    language: 'es',
    format: 'json'
  });

  // Step 4: Test foods.search for "la costeña"
  console.log('\n--- Test 3: foods.search for "la costeña" with region: "MX" ---');
  await doSearch(token, {
    method: 'foods.search',
    search_expression: 'la costeña',
    region: 'MX',
    language: 'es',
    format: 'json'
  });

  // Step 5: Test foods.search.v2 or foods.search.v3
  console.log('\n--- Test 4: foods.search.v2 ---');
  await doSearch(token, {
    method: 'foods.search.v2',
    search_expression: 'elote dorado',
    region: 'MX',
    language: 'es',
    format: 'json'
  });
}

async function doSearch(token, params) {
  const body = new URLSearchParams(params).toString();
  console.log('Query params:', body);
  const res = await fetch('https://platform.fatsecret.com/rest/server.api', {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${token}`,
      'Content-Type': 'application/x-www-form-urlencoded'
    },
    body
  });

  const text = await res.text();
  console.log('Status:', res.status);
  try {
    const json = JSON.parse(text);
    console.log('Response JSON:', JSON.stringify(json, null, 2).slice(0, 500));
  } catch {
    console.log('Raw response:', text.slice(0, 500));
  }
}

test();
