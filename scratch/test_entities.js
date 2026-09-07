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

console.log(decodeHtmlEntities('La Coste&#241;a Elote Dorado &amp; Ma&#237;z'));
