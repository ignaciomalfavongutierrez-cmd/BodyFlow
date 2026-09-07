import fs from 'fs';

async function testProductPage() {
  const url = 'https://www.fatsecret.com.mx/calor%C3%ADas-nutrici%C3%B3n/la-coste%C3%B1a/elote-dorado/100g';
  const res = await fetch(url, {
    headers: {
      'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
      'Accept-Language': 'es-MX,es;q=0.9'
    }
  });

  const html = await res.text();
  const factIndex = html.indexOf('factTitle');
  if (factIndex !== -1) {
    console.log(html.slice(factIndex - 300, factIndex + 1200));
  }
}

testProductPage().catch(console.error);
