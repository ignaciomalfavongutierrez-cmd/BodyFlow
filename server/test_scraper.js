async function searchFatSecretMexicoWeb(query) {
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

    // FatSecret search results format:
    // <a class="prominent" href="...">Food Name</a>&nbsp;&nbsp;<a class="brand" href="...">(Brand Name)</a>
    // <div class="smallText greyText greyLink">
    //   por 1 porción (50g) - Calorías: 33kcal | Grasa: 0,50g | Carbh: 6,00g | Prot: 1,00g
    // </div>
    const rowRegex = /<td[^>]*class="borderBottom"[^>]*>([\s\S]*?)<\/td>/g;
    let match;

    while ((match = rowRegex.exec(html)) !== null) {
      const cellHtml = match[1];

      // Food name & link
      const nameMatch = cellHtml.match(/<a class="prominent" href="([^"]+)">([^<]+)<\/a>/);
      if (!nameMatch) continue;

      const relativeUrl = nameMatch[1];
      const foodName = nameMatch[2].trim();

      // Brand name (if present)
      const brandMatch = cellHtml.match(/<a class="brand"[^>]*>\(([^<]+)\)<\/a>/);
      const brand = brandMatch ? brandMatch[1].replace(/&#241;/g, 'ñ').trim() : '';

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
          .replace(/&nbsp;/g, ' ')
          .replace(/\s+/g, ' ')
          .trim();

        // Format is: "por 1 porción (50g) - Calorías: 33kcal | Grasa: 0,50g | Carbh: 6,00g | Prot: 1,00g"
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

      // Generate unique ID from URL
      const idMatch = relativeUrl.match(/\/([^\/]+)\/([^\/]+)\/?$/);
      const id = idMatch ? `fsmx_${idMatch[1]}_${idMatch[2]}` : `fsmx_${Date.now()}_${results.length}`;

      const fullName = brand ? `${foodName} (${brand})` : foodName;

      results.push({
        id,
        name: fullName,
        description: desc,
        brand: brand || undefined,
        url: `https://www.fatsecret.com.mx${relativeUrl}`,
        fuente: 'fatsecret_mx',
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

async function test() {
  console.log('--- Testing searchFatSecretMexicoWeb for "elote dorado" ---');
  const r1 = await searchFatSecretMexicoWeb('elote dorado la costeña');
  console.log(`Found ${r1.length} items:`);
  r1.forEach(item => {
    console.log(`- ${item.name}`);
    console.log(`  Porción: ${item.description}`);
    console.log(`  Macros: ${item.macros.calories} kcal | P: ${item.macros.protein}g | C: ${item.macros.carbs}g | G: ${item.macros.fat}g`);
    console.log(`  URL: ${item.url}`);
  });

  console.log('\n--- Testing searchFatSecretMexicoWeb for "bimbo pan cero" ---');
  const r2 = await searchFatSecretMexicoWeb('bimbo pan cero');
  console.log(`Found ${r2.length} items:`);
  r2.slice(0, 3).forEach(item => {
    console.log(`- ${item.name} (${item.description}) -> ${item.macros.calories} kcal`);
  });

  console.log('\n--- Testing searchFatSecretMexicoWeb for "sanissimo salmas" ---');
  const r3 = await searchFatSecretMexicoWeb('sanissimo salmas');
  console.log(`Found ${r3.length} items:`);
  r3.slice(0, 3).forEach(item => {
    console.log(`- ${item.name} (${item.description}) -> ${item.macros.calories} kcal`);
  });
}

test();
