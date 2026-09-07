const clientId = process.env.FATSECRET_CLIENT_ID;
const clientSecret = process.env.FATSECRET_CLIENT_SECRET;

async function getAccessToken() {
  const credentials = Buffer.from(`${clientId}:${clientSecret}`).toString('base64');
  const res = await fetch('https://oauth.fatsecret.com/connect/token', {
    method: 'POST',
    headers: {
      'Authorization': `Basic ${credentials}`,
      'Content-Type': 'application/x-www-form-urlencoded'
    },
    body: 'grant_type=client_credentials&scope=basic'
  });
  const data = await res.json();
  return data.access_token;
}

async function test(method, params) {
  const token = await getAccessToken();
  const body = new URLSearchParams({
    method,
    format: 'json',
    ...params
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
  console.log(`\nMethod ${method}:`, JSON.stringify(json).slice(0, 500));
}

async function main() {
  await test('foods.search.v2', { search_expression: 'elote dorado', region: 'MX' });
  await test('food_brands.get', { region: 'MX' });
  await test('food_brands.get.v2', { region: 'MX' });
}

main().catch(console.error);
