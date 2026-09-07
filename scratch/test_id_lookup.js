function decodeHtmlEntities(str = '') {
  return str
    .replace(/&#241;/gi, 'ñ')
    .replace(/&#209;/gi, 'Ñ')
    .replace(/&#225;/gi, 'á')
    .replace(/&#193;/gi, 'Á')
    .replace(/&#233;/gi, 'é')
    .replace(/&#201;/gi, 'É')
    .replace(/&#237;/gi, 'í')
    .replace(/&#205;/gi, 'Í')
    .replace(/&#243;/gi, 'ó')
    .replace(/&#211;/gi, 'Ó')
    .replace(/&#250;/gi, 'ú')
    .replace(/&#218;/gi, 'Ú')
    .replace(/&amp;/gi, '&')
    .replace(/&quot;/gi, '"')
    .replace(/&#39;/gi, "'")
    .replace(/&nbsp;|&#160;/gi, ' ')
    .trim();
}

async function getFoodByMexicoId(id) {
  const parts = id.replace(/^fsmx_/, '').split('_');
  const path = parts.map(p => encodeURIComponent(p)).join('/');
  const url = `https://www.fatsecret.com.mx/calor%C3%ADas-nutrici%C3%B3n/${path}`;

  const res = await fetch(url, {
    headers: {
      'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
      'Accept-Language': 'es-MX,es;q=0.9'
    }
  });

  if (!res.ok) return null;

  const html = await res.text();
  const titleMatch = html.match(/<h1[^>]*>([\s\S]*?)<\/h1>/i);
  const name = titleMatch ? decodeHtmlEntities(titleMatch[1].replace(/<[^>]+>/g, '').trim()) : parts[1] || 'Alimento';

  // Nutrient numbers
  const calsMatch = html.match(/<div class="factTitle">Cals<\/div>\s*<div class="factValue">([\d,.]+)<\/div>/i);
  const fatMatch = html.match(/<div class="factTitle">Grasa<\/div>\s*<div class="factValue">([\d,.]+)g?<\/div>/i);
  const carbMatch = html.match(/<div class="factTitle">Carbh<\/div>\s*<div class="factValue">([\d,.]+)g?<\/div>/i);
  const protMatch = html.match(/<div class="factTitle">Prot<\/div>\s*<div class="factValue">([\d,.]+)g?<\/div>/i);
  const portionMatch = html.match(/Hay\s+[\d,.]+\s+calor[íi]as\s+en\s+([^.<]+)\./i);

  const parseNum = (m) => m ? parseFloat(m[1].replace(',', '.')) : 0;

  return {
    id,
    name,
    description: portionMatch ? decodeHtmlEntities(portionMatch[1].trim()) : (parts[2] || '1 porción'),
    fuente: 'fatsecret',
    macros: {
      calories: Math.round(parseNum(calsMatch)),
      fat: parseNum(fatMatch),
      carbs: parseNum(carbMatch),
      protein: parseNum(protMatch),
      sugar: 0
    }
  };
}

async function test() {
  const item = await getFoodByMexicoId('fsmx_la-costeña_elote-dorado_100g');
  console.log('Result for fsmx_la-costeña_elote-dorado_100g:');
  console.log(JSON.stringify(item, null, 2));
}

test().catch(console.error);
