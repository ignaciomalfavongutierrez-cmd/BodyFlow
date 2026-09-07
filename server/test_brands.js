import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
dotenv.config({ path: path.join(__dirname, '.env') });

const CLIENT_ID = process.env.FATSECRET_CLIENT_ID;
const CLIENT_SECRET = process.env.FATSECRET_CLIENT_SECRET;

async function testQuery() {
  const credentials = Buffer.from(`${CLIENT_ID}:${CLIENT_SECRET}`).toString('base64');
  const tokenRes = await fetch('https://oauth.fatsecret.com/connect/token', {
    method: 'POST',
    headers: {
      'Authorization': `Basic ${credentials}`,
      'Content-Type': 'application/x-www-form-urlencoded'
    },
    body: 'grant_type=client_credentials&scope=basic'
  });
  const tokenData = await tokenRes.json();
  const token = tokenData.access_token;

  console.log('Testing foods.search with "La Costeña Elote Dorado"...');
  const queries = [
    'La Costeña',
    'Costeña',
    'Elote Dorado La Costeña',
    'Bimbo',
    'Sanissimo'
  ];

  for (const q of queries) {
    const body = new URLSearchParams({
      method: 'foods.search',
      search_expression: q,
      region: 'MX',
      language: 'es',
      format: 'json'
    }).toString();

    const res = await fetch('https://platform.fatsecret.com/rest/server.api', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/x-www-form-urlencoded'
      },
      body
    });

    const json = await res.json();
    const foods = json.foods?.food || [];
    const list = Array.isArray(foods) ? foods : [foods];
    console.log(`\nQuery: "${q}" -> Results: ${list.length}`);
    list.slice(0, 3).forEach(f => {
      console.log(`  - [${f.brand_name || 'Genérico'}] ${f.food_name} (${f.food_description})`);
    });
  }
}

testQuery();
