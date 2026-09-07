async function dumpHtml() {
  const url = 'https://www.fatsecret.com.mx/calor%C3%ADas-nutrici%C3%B3n/search?q=elote+dorado+la+coste%C3%B1a';
  const res = await fetch(url, {
    headers: {
      'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
      'Accept-Language': 'es-MX,es;q=0.9'
    }
  });
  const text = await res.text();
  // Find where search results or "searchResult" or "Costeña" appear
  const idx = text.indexOf('Coste');
  if (idx !== -1) {
    console.log('Found Coste at index:', idx);
    console.log(text.slice(idx - 200, idx + 400));
  } else {
    console.log('Coste not found directly, looking for search table or forms:');
    const tableIdx = text.indexOf('<table');
    console.log(text.slice(tableIdx, tableIdx + 600));
  }
}
dumpHtml();
