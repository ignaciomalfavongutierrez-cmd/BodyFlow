export async function searchFatSecretMexicoWeb(query) {
  const cleanQ = encodeURIComponent(query.trim());
  const url = `https://www.fatsecret.com.mx/calor%C3%ADas-nutrici%C3%B3n/search?q=${cleanQ}`;

  try {
    const res = await fetch(url, {
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
        'Accept-Language': 'es-MX,es;q=0.9',
        'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8'
      }
    });

    if (!res.ok) {
      console.warn('fatsecret.com.mx returned status', res.status);
      return [];
    }

    const html = await res.text();
    const results = [];

    const rowRegex = /<td[^>]*class="borderBottom"[^>]*>([\s\S]*?)<\/td>/g;
    let match;

    while ((match = rowRegex.exec(html)) !== null) {
      const cellHtml = match[1];

      // Food name & link
      const nameMatch = cellHtml.match(/<a class="prominent" href="([^"]+)">([^<]+)<\/a>/);
      if (!nameMatch) continue;

      const relativeUrl = nameMatch[1];
      const foodName = nameMatch[2].replace(/&#241;/g, 'ñ').replace(/&#237;/g, 'í').replace(/&#243;/g, 'ó').replace(/&#225;/g, 'á').replace(/&#233;/g, 'é').trim();

      // Brand name (if present)
      const brandMatch = cellHtml.match(/<a class="brand"[^>]*>\(([^<]+)\)<\/a>/);
      const brand = brandMatch ? brandMatch[1].replace(/&#241;/g, 'ñ').replace(/&#237;/g, 'í').replace(/&#243;/g, 'ó').replace(/&#225;/g, 'á').replace(/&#233;/g, 'é').trim() : '';

      // Nutrition smallText
      const detailMatch = cellHtml.match(/<div class="smallText[^"]*">([\s\S]*?)<\/div>/);
      let desc = '';
      let calories = 0;
      let fat = 0;
      let carbs = 0;
      let protein = 0;

      if (detailMatch) {
        const rawText = detailMatch[1]
          .replace(/<[^>]+>/g, '')
          .replace(/&#237;/g, 'í')
          .replace(/&#241;/g, 'ñ')
          .replace(/&#243;/g, 'ó')
          .replace(/&#225;/g, 'á')
          .replace(/&#233;/g, 'é')
          .replace(/&nbsp;/g, ' ')
          .replace(/\s+/g, ' ')
          .trim();

        const parts = rawText.split(' - ');
        desc = parts[0]?.replace(/^por\s+/i, '').trim() || '1 porción';

        const calMatch = rawText.match(/Calor[íi]as:\s*([\d,.]+)\s*kcal/i);
        const fatMatch = rawText.match(/Grasa:\s*([\d,.]+)\s*g/i);
        const carbMatch = rawText.match(/Carbh?:\s*([\d,.]+)\s*g/i);
        const protMatch = rawText.match(/Prot:\s*([\d,.]+)\s*g/i);

        const parseNum = (val) => val ? parseFloat(val.replace(',', '.')) : 0;
        calories = calMatch ? Math.round(parseNum(calMatch[1])) : 0;
        fat = fatMatch ? parseNum(fatMatch[1]) : 0;
        carbs = carbMatch ? parseNum(carbMatch[1]) : 0;
        protein = protMatch ? parseNum(protMatch[1]) : 0;
      }

      // Format unique id
      // e.g. /calorías-nutrición/la-costeña/elote-dorado/100g -> fsmx_la-costeña_elote-dorado_100g
      const cleanPath = relativeUrl.replace(/^\/calor%C3%ADas-nutrici%C3%B3n\//i, '').replace(/^\/calorías-nutrición\//i, '').replace(/\/$/, '');
      const pathParts = cleanPath.split('/').filter(Boolean);
      const id = 'fsmx_' + pathParts.map(p => decodeURIComponent(p)).join('_');

      const fullName = brand ? `${foodName} (${brand})` : foodName;

      results.push({
        id,
        name: fullName,
        description: desc,
        brand: brand || undefined,
        url: `https://www.fatsecret.com.mx${relativeUrl}`,
        fuente: 'fatsecret',
        macros: {
          calories,
          protein,
          carbs,
          fat,
          sugar: 0
        }
      });
    }

    return results;
  } catch (err) {
    console.error('Error in searchFatSecretMexicoWeb:', err);
    return [];
  }
}

async function runTests() {
  const queries = [
    'la costeña',
    'elote dorado la costeña',
    'atun dolores',
    'frijoles isadora',
    'leche lala 100',
    'sanissimo'
  ];

  for (const q of queries) {
    console.log(`\n🔍 Searching: "${q}"`);
    const res = await searchFatSecretMexicoWeb(q);
    console.log(`Found ${res.length} items. Top 3:`);
    res.slice(0, 3).forEach((item, idx) => {
      console.log(`  [${idx + 1}] ${item.name} | Porción: ${item.description} | ${item.macros.calories} kcal (P: ${item.macros.protein}g, C: ${item.macros.carbs}g, G: ${item.macros.fat}g)`);
      console.log(`      ID: ${item.id}`);
    });
  }
}

runTests().catch(console.error);
