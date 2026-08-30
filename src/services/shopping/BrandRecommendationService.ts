import type { PurchaseStrategy  } from '../../types/shoppingDiet';

export interface BrandSuggestion {
  name: string;
  tip?: string;
}

export interface CategoryBrandRecommendation {
  categorySlug: string;
  categoryName: string;
  emoji: string;
  headline: string;
  brands: BrandSuggestion[];
}

// ─────────────────────────────────────────────────────────────────────────────
// Brand tables per category and purchase strategy
// ─────────────────────────────────────────────────────────────────────────────

type StrategyMap = Record<PurchaseStrategy, CategoryBrandRecommendation>;

const BRAND_DATA: Record<string, StrategyMap> = {
  verduras: {
    economic: {
      categorySlug: 'verduras',
      categoryName: 'Verduras',
      emoji: '🥦',
      headline: '¡Mercado, tianguis o Bodega Aurrera!',
      brands: [
        { name: 'Mercado / Tianguis local', tip: 'Siempre más fresco y económico; compra por kilo' },
        { name: 'Bodega Aurrera (Martes de Frescura)', tip: 'Verdura básica (jitomate, cebolla, calabacita) en oferta' },
        { name: 'Marca Aurrera / Great Value', tip: 'Verduras mixtas congeladas muy económicas' },
        { name: 'Central de Abastos', tip: 'Precios al mayoreo, ideal para surtir la quincena' },
      ],
    },
    value: {
      categorySlug: 'verduras',
      categoryName: 'Verduras',
      emoji: '🥦',
      headline: 'Frescas de temporada o congeladas',
      brands: [
        { name: 'Mercado local / Bodega Aurrera', tip: 'Elige verdura de temporada para mayor frescura y rendimiento' },
        { name: 'Del Fuerte', tip: 'Jitomate, purés y chiles de calidad a buen precio' },
        { name: 'Herdez / McCormick', tip: 'Salsas y vegetales en conserva confiables' },
        { name: 'Birds Eye / Great Value', tip: 'Mezclas de verduras congeladas prácticas para la semana' },
      ],
    },
    premium: {
      categorySlug: 'verduras',
      categoryName: 'Verduras',
      emoji: '🥦',
      headline: 'Orgánicas y de alta calidad',
      brands: [
        { name: 'Orgánico en mercado de productores', tip: 'Sin agroquímicos, mayor densidad nutricional' },
        { name: 'Verdiver / Orgánica MX', tip: 'Bolsas de verdura orgánica certificada' },
        { name: 'Fresh Market / City Market', tip: 'Variedad orgánica importada y nacional' },
        { name: 'Herdez Guac fresco', tip: 'Para aderezos sin conservadores artificiales' },
      ],
    },
    neutral: {
      categorySlug: 'verduras',
      categoryName: 'Verduras',
      emoji: '🥦',
      headline: 'Frescas preferentemente',
      brands: [
        { name: 'Mercado local o Bodega Aurrera', tip: 'Primera opción: frescas y de temporada' },
        { name: 'Del Fuerte', tip: 'Jitomate y purés de tomate' },
        { name: 'Congeladas Aurrera / Great Value', tip: 'Práctica alternativa para días ocupados' },
      ],
    },
  },

  frutas: {
    economic: {
      categorySlug: 'frutas',
      categoryName: 'Frutas',
      emoji: '🍎',
      headline: '¡Frutería local o Bodega Aurrera!',
      brands: [
        { name: 'Tianguis / Mercado local', tip: 'Plátano, papaya y fruta de temporada mucho más barata' },
        { name: 'Bodega Aurrera (Frutería)', tip: 'Fruta de temporada en oferta semanal y excelente precio' },
        { name: 'Marca Aurrera / Great Value', tip: 'Fruta congelada o en conserva sin azúcar añadida' },
        { name: 'Del Monte', tip: 'Jugos 100% naturales sin azúcar añadida' },
      ],
    },
    value: {
      categorySlug: 'frutas',
      categoryName: 'Frutas',
      emoji: '🍎',
      headline: 'Frescas de temporada',
      brands: [
        { name: 'Mercado local / Bodega Aurrera', tip: 'Elige fruta de temporada para menor costo' },
        { name: 'Del Monte', tip: 'Fruta en conserva sin azúcar añadida' },
        { name: 'Jumex Único Fresco', tip: '100% fruta natural sin azúcar agregada' },
        { name: 'Dole', tip: 'Fruta deshidratada o enlatada práctica' },
      ],
    },
    premium: {
      categorySlug: 'frutas',
      categoryName: 'Frutas',
      emoji: '🍎',
      headline: 'Orgánicas y de temporada',
      brands: [
        { name: 'Orgánica local / Productores', tip: 'Sin pesticidas, máxima nutrición' },
        { name: 'Ciudad de México Orgánico', tip: 'Entrega a domicilio de productores' },
        { name: 'Whole Foods / City Market', tip: 'Variedad amplia de frutas exóticas y orgánicas' },
      ],
    },
    neutral: {
      categorySlug: 'frutas',
      categoryName: 'Frutas',
      emoji: '🍎',
      headline: 'Prefiere fruta fresca',
      brands: [
        { name: 'Tianguis o Bodega Aurrera', tip: 'Primera opción siempre' },
        { name: 'Del Monte', tip: 'Jugos 100% naturales' },
        { name: 'Jumex Natural', tip: 'Sin azúcar añadida' },
      ],
    },
  },

  proteina: {
    economic: {
      categorySlug: 'proteina',
      categoryName: 'Proteínas',
      emoji: '🥩',
      headline: 'Proteína fresca y económica (Pollería/Carnicería & Aurrera)',
      brands: [
        { name: 'Pollería local / Carnicería de confianza', tip: 'Pechuga de pollo entera a granel y bistec magro; rinde mucho más y cuesta menos por kilo que empaques de súper' },
        { name: 'Atún Dolores en agua', tip: 'Excelente relación calidad-precio; lomo limpio sin exceso de soya (búscalo en Bodega Aurrera)' },
        { name: 'Huevo San Juan / El Calvario / Aurrera', tip: 'Paquete de 30 huevos en Bodega Aurrera; la fuente de proteína más barata por gramo' },
        { name: 'Marca Aurrera / Great Value', tip: 'Atún en agua, claras pasteurizadas y sardinas a precio accesible' },
        { name: 'Pechuga de pavo Bafar / Fud (a granel)', tip: 'Pídela por gramos en la cremería de Bodega Aurrera o mercado' },
      ],
    },
    value: {
      categorySlug: 'proteina',
      categoryName: 'Proteínas',
      emoji: '🥩',
      headline: 'Balance perfecto calidad-precio',
      brands: [
        { name: 'Atún Dolores en agua (sólido o trozos)', tip: 'El referente de calidad-precio; lomo sólido y proteína limpia' },
        { name: 'Pollería local / Bachoco', tip: 'Pechuga de pollo fresca y cortes magros' },
        { name: 'Huevo San Juan / Bachoco', tip: 'Huevo fresco de calidad garantizada' },
        { name: 'San Rafael / Pechuga de pavo Fud', tip: 'Embutidos con alto porcentaje de pavo y menos sodio' },
        { name: 'Carnicería de barrio / Bodega Aurrera', tip: 'Cortes magros de res (bistec para asar, molida 90/10) a buen precio' },
      ],
    },
    premium: {
      categorySlug: 'proteina',
      categoryName: 'Proteínas',
      emoji: '🥩',
      headline: 'Alta calidad y proteína limpia',
      brands: [
        { name: 'Atún Dolores Premium / Mazatún Lomo Sólido', tip: 'Lomos seleccionados en agua de calidad superior' },
        { name: 'SuKarne Selecto / Carnes Maduradas', tip: 'Cortes de res magros y libres de grasa excesiva' },
        { name: 'Pescadería local (Salmón / Filete fresco)', tip: 'Omega-3 de primera frescura' },
        { name: 'Bachoco Orgánico / Pollo de libre pastoreo', tip: 'Pollo sin hormonas ni antibióticos añadidos' },
        { name: 'Huevo de libre pastoreo (San Juan / Rancho)', tip: 'Mayor densidad de nutrientes y yema más rica' },
      ],
    },
    neutral: {
      categorySlug: 'proteina',
      categoryName: 'Proteínas',
      emoji: '🥩',
      headline: 'Proteínas variadas y confiables',
      brands: [
        { name: 'Pollería local / Bachoco', tip: 'Pechuga de pollo fresca' },
        { name: 'Atún Dolores en agua', tip: 'Confiable, alto en proteína y accesible' },
        { name: 'Huevo San Juan / El Calvario', tip: 'Proteína completa indispensable' },
      ],
    },
  },

  cereales: {
    economic: {
      categorySlug: 'cereales',
      categoryName: 'Cereales',
      emoji: '🌾',
      headline: 'Carbohidratos accesibles (Bodega Aurrera & Granel)',
      brands: [
        { name: 'Marca Aurrera / Great Value (Bodega Aurrera)', tip: 'Avena en hojuelas, arroz y pastas de sémola muy económicas' },
        { name: 'Tortillería local', tip: 'Tortillas de maíz nixtamalizado al mejor precio y más nutritivas' },
        { name: 'La Moderna / Pasta Aurrera', tip: 'Pastas de trigo a precio muy accesible' },
        { name: 'Arroz SOS / Arroz a granel', tip: 'Arroz blanco o precocido económico' },
        { name: 'Tostadas horneadas Aurrera / Sanissimo', tip: 'Tostadas de maíz horneadas sin grasa' },
      ],
    },
    value: {
      categorySlug: 'cereales',
      categoryName: 'Cereales',
      emoji: '🌾',
      headline: 'Cereales de calidad equilibrada',
      brands: [
        { name: 'Quaker Avena en hojuelas', tip: 'Avena tradicional rica en beta-glucanos y fibra' },
        { name: 'Bimbo Integral / Cero Cero', tip: 'Pan integral sin jarabes ni azúcares añadidos' },
        { name: 'Maseca Nixtamasa', tip: 'Tortillas caseras con maíz nixtamalizado real' },
        { name: 'La Moderna Integral', tip: 'Pasta integral con alto contenido de fibra' },
        { name: 'Sanissimo Salmas', tip: 'Galletas de maíz horneadas bajas en calorías' },
      ],
    },
    premium: {
      categorySlug: 'cereales',
      categoryName: 'Cereales',
      emoji: '🌾',
      headline: 'Granos enteros y sin procesar',
      brands: [
        { name: "Bob's Red Mill / Quaker Old Fashioned", tip: 'Avena y granos enteros de primera calidad' },
        { name: 'Arroz integral a granel (mercado)', tip: 'Sin procesar, máximo aporte nutricional' },
        { name: 'Quinoa / Amaranto a granel', tip: 'Supergranos mexicanos altamente nutritivos' },
        { name: 'Pan Ezequiel / Integral artesanal', tip: 'Panadería local con harinas integrales reales' },
      ],
    },
    neutral: {
      categorySlug: 'cereales',
      categoryName: 'Cereales',
      emoji: '🌾',
      headline: 'Cereales variados',
      brands: [
        { name: 'Quaker Avena', tip: 'Clásico y confiable' },
        { name: 'Tortillería local', tip: 'Para tortillas de maíz frescas' },
        { name: 'Bimbo Integral', tip: 'Pan de caja con fibra' },
      ],
    },
  },

  lacteos: {
    economic: {
      categorySlug: 'lacteos',
      categoryName: 'Lácteos',
      emoji: '🥛',
      headline: 'Lácteos accesibles en Bodega Aurrera y Cremería',
      brands: [
        { name: 'Lala / Alpura (Bodega Aurrera)', tip: 'Leche entera o deslactosada a precio de bodega' },
        { name: 'Queso panela de cremería / mercado', tip: 'Fresco, bajo en grasa y más barato por kilo que empaques de marca' },
        { name: 'Marca Aurrera / Great Value', tip: 'Leche, queso fresco y crema económica en Bodega Aurrera' },
        { name: 'Yoplait Griego / Danone Natural', tip: 'Yogurt natural sin azúcar en presentaciones grandes' },
      ],
    },
    value: {
      categorySlug: 'lacteos',
      categoryName: 'Lácteos',
      emoji: '🥛',
      headline: 'Calidad comprobada y alta proteína',
      brands: [
        { name: 'Fud / Yoplait Griego sin azúcar', tip: 'Excelente opción de yogurt griego alto en proteína' },
        { name: 'Alpura / Lala Deslactosada', tip: 'Leche confiable de fácil digestión' },
        { name: 'Nochebuena / Lala Panela', tip: 'Queso panela de leche entera sin aditivos raros' },
        { name: 'Danone Oikos Natural', tip: 'Yogur griego auténtico sin azúcares' },
        { name: 'Queso cottage Lala / Lyncott', tip: 'Rico en caseína para cenas' },
      ],
    },
    premium: {
      categorySlug: 'lacteos',
      categoryName: 'Lácteos',
      emoji: '🥛',
      headline: 'Lácteos de alta calidad',
      brands: [
        { name: 'Chobani / Fage Griego', tip: 'Yogur griego auténtico de triple filtrado' },
        { name: 'Organic Valley / Bove Orgánica', tip: 'Leche orgánica de libre pastoreo' },
        { name: 'Quesos artesanales de rancho', tip: 'Quesos sin conservadores en mercado local' },
        { name: 'Kéfir artesanal', tip: 'Probióticos naturales de alta potencia' },
      ],
    },
    neutral: {
      categorySlug: 'lacteos',
      categoryName: 'Lácteos',
      emoji: '🥛',
      headline: 'Lácteos frescos y de calidad',
      brands: [
        { name: 'Lala / Alpura', tip: 'Leche entera o deslactosada' },
        { name: 'Yoplait Griego', tip: 'Yogur griego natural sin azúcar' },
        { name: 'Queso panela local', tip: 'Del mercado o cremería' },
      ],
    },
  },

  grasas: {
    economic: {
      categorySlug: 'grasas',
      categoryName: 'Grasas',
      emoji: '🥑',
      headline: 'Grasas saludables accesibles',
      brands: [
        { name: 'Aguacate Hass (Tianguis / Bodega Aurrera)', tip: 'Aguacate de temporada al mejor precio por kilo' },
        { name: 'Cacahuate tostado a granel (Mercado)', tip: 'Grasa saludable y proteína muy económica' },
        { name: 'Aceite 1-2-3 / Capullo / Aurrera', tip: 'Aceite vegetal económico para cocinar' },
        { name: 'Aceite de oliva Great Value / Aurrera', tip: 'Opción accesible de aceite de oliva para ensaladas' },
      ],
    },
    value: {
      categorySlug: 'grasas',
      categoryName: 'Grasas',
      emoji: '🥑',
      headline: 'Grasas de calidad equilibrada',
      brands: [
        { name: 'Nutrioli Oliva / Carbonell', tip: 'Aceite de oliva extra virgen accesible' },
        { name: 'Crema de cacahuate Aladino / Skippy (sin azúcar)', tip: '100% cacahuate sin aceite de palma' },
        { name: 'Almendras / Nuez a granel en mercado', tip: 'Buena relación precio-calidad por cuarto o medio kilo' },
        { name: 'Aguacate fresco local', tip: 'Grasa monoinsaturada indispensable' },
      ],
    },
    premium: {
      categorySlug: 'grasas',
      categoryName: 'Grasas',
      emoji: '🥑',
      headline: 'Grasas premium y sin procesar',
      brands: [
        { name: 'Aceite de oliva extra virgen primera prensada', tip: 'De importación española o de Ensenada' },
        { name: 'Crema de almendra 100% pura', tip: 'Sin azúcar, sal ni aceites hidrogenados' },
        { name: 'Nuez de castilla / pecana a granel', tip: 'Frescas de temporada' },
        { name: 'Aceite de aguacate prensado en frío', tip: 'Alto punto de humo para cocinar' },
      ],
    },
    neutral: {
      categorySlug: 'grasas',
      categoryName: 'Grasas',
      emoji: '🥑',
      headline: 'Grasas saludables',
      brands: [
        { name: 'Nutrioli / Capullo', tip: 'Aceites confiables' },
        { name: 'Aguacate de temporada', tip: 'Del mercado o Bodega Aurrera' },
        { name: 'Nuez o almendra natural', tip: 'Sin freír ni salar' },
      ],
    },
  },

  leguminosas: {
    economic: {
      categorySlug: 'leguminosas',
      categoryName: 'Leguminosas',
      emoji: '🫘',
      headline: 'Proteína vegetal súper económica (Granel & Aurrera)',
      brands: [
        { name: 'Frijol negro / pinto a granel (Mercado)', tip: 'El más barato y rinde mucho; compra por kilo' },
        { name: 'Frijol / Lenteja Marca Aurrera (1kg)', tip: 'Bolsas de leguminosas secas a bajo costo en Bodega Aurrera' },
        { name: 'La Costeña / Frijoles Aurrera en bolsa', tip: 'Frijoles enteros cocidos listos para calentar' },
        { name: 'Garbanzos a granel', tip: 'Económicos para guisos y ensaladas' },
      ],
    },
    value: {
      categorySlug: 'leguminosas',
      categoryName: 'Leguminosas',
      emoji: '🫘',
      headline: 'Leguminosas de confianza',
      brands: [
        { name: 'La Costeña', tip: 'Frijoles negros y bayos enteros cocidos' },
        { name: 'Del Fuerte / Verde Valle', tip: 'Lentejas y garbanzos de grano seleccionado' },
        { name: 'Frijol negro a granel', tip: 'Compra semanal en mercado local' },
      ],
    },
    premium: {
      categorySlug: 'leguminosas',
      categoryName: 'Leguminosas',
      emoji: '🫘',
      headline: 'Leguminosas sin aditivos',
      brands: [
        { name: 'Leguminosas orgánicas a granel', tip: 'Tiendas naturistas o mercados orgánicos' },
        { name: 'Eden Foods (lata BPA-free)', tip: 'Sin bisfenol A y sin sal añadida' },
        { name: 'Edamames / Soya orgánica', tip: 'Proteína vegetal completa' },
      ],
    },
    neutral: {
      categorySlug: 'leguminosas',
      categoryName: 'Leguminosas',
      emoji: '🫘',
      headline: 'Leguminosas variadas',
      brands: [
        { name: 'A granel en mercado local o Bodega Aurrera', tip: 'Siempre más fresco y económico' },
        { name: 'La Costeña', tip: 'Para cuando necesites rapidez y practicidad' },
      ],
    },
  },

  otros: {
    economic: {
      categorySlug: 'otros',
      categoryName: 'Otros',
      emoji: '🛒',
      headline: 'Condimentos y básicos en Bodega Aurrera y Mercado',
      brands: [
        { name: 'Marca Aurrera / Great Value', tip: 'Especias, vinagre, mostaza y café a bajo costo en Bodega Aurrera' },
        { name: 'Especias a granel en el mercado', tip: 'Ajo, orégano, pimienta y canela hasta 5x más baratas' },
        { name: 'La Costeña / Herdez', tip: 'Chiles, purés y salsas económicas' },
        { name: 'McCormick (presentaciones chicas)', tip: 'Especias básicas indispensables' },
      ],
    },
    value: {
      categorySlug: 'otros',
      categoryName: 'Otros',
      emoji: '🛒',
      headline: 'Condimentos de buena calidad',
      brands: [
        { name: 'McCormick', tip: 'Especias enteras con mayor aroma' },
        { name: 'Herdez', tip: 'Salsas y chiles sin conservadores excesivos' },
        { name: 'Knorr Suiza', tip: 'Sazonadores de cocina' },
        { name: 'Café soluble Nescafé / Legal', tip: 'Económico y rendidor' },
      ],
    },
    premium: {
      categorySlug: 'otros',
      categoryName: 'Otros',
      emoji: '🛒',
      headline: 'Especias y condimentos premium',
      brands: [
        { name: 'Especias a granel (mercado artesanal)', tip: 'Mayor aceite esencial = más sabor y propiedades' },
        { name: 'Vainilla natural mexicana de Papantla', tip: 'Extracto natural auténtico' },
        { name: 'Sal rosada del Himalaya / Sal de mar de Colima', tip: 'Rica en microminerales' },
        { name: 'Cúrcuma / Jengibre orgánicos', tip: 'Antiinflamatorios naturales de alta potencia' },
      ],
    },
    neutral: {
      categorySlug: 'otros',
      categoryName: 'Otros',
      emoji: '🛒',
      headline: 'Básicos de cocina',
      brands: [
        { name: 'McCormick / Bodega Aurrera', tip: 'Especias confiables' },
        { name: 'Herdez / La Costeña', tip: 'Salsas y chiles en lata' },
        { name: 'A granel en mercado', tip: 'Para especias como comino, orégano y canela' },
      ],
    },
  },
};

// ─────────────────────────────────────────────────────────────────────────────
// Strategy metadata (label, color, icon, tip)
// ─────────────────────────────────────────────────────────────────────────────

export interface StrategyMeta {
  label: string;
  description: string;
  emoji: string;
  color: string;
  bgColor: string;
  borderColor: string;
}

export const STRATEGY_META: Record<PurchaseStrategy, StrategyMeta> = {
  economic: {
    label: 'Dieta Económica',
    description: 'Marcas accesibles y compras en mercado/tianguis para máximo ahorro sin sacrificar nutrición.',
    emoji: '💚',
    color: '#14532d',
    bgColor: '#dcfce7',
    borderColor: '#86efac',
  },
  value: {
    label: 'Dieta Equilibrada',
    description: 'Marcas con buena relación precio-calidad, ampliamente disponibles en supermercados.',
    emoji: '💙',
    color: '#1e3a8a',
    bgColor: '#dbeafe',
    borderColor: '#93c5fd',
  },
  premium: {
    label: 'Dieta Premium',
    description: 'Productos orgánicos, sin aditivos y de alta calidad nutricional.',
    emoji: '💜',
    color: '#4c1d95',
    bgColor: '#ede9fe',
    borderColor: '#c4b5fd',
  },
  neutral: {
    label: 'Plan Nutricional',
    description: 'Sugerencias generales para una alimentación balanceada.',
    emoji: '🌿',
    color: '#374151',
    bgColor: '#f3f4f6',
    borderColor: '#d1d5db',
  },
};

// ─────────────────────────────────────────────────────────────────────────────
// Main service
// ─────────────────────────────────────────────────────────────────────────────

export class BrandRecommendationService {
  /**
   * Returns brand recommendations for all relevant categories given the strategy.
   * Only returns categories that are present in the shopping list result.
   */
  static getRecommendations(
    presentCategorySlugs: string[],
    strategy: PurchaseStrategy
  ): CategoryBrandRecommendation[] {
    // Canonical slug mapping (normalize from ShoppingItem category names)
    const slugMap: Record<string, string> = {
      proteinas: 'proteina',
      proteína: 'proteina',
      proteínas: 'proteina',
      proteina: 'proteina',
      cereales: 'cereales',
      cereal: 'cereales',
      verduras: 'verduras',
      verdura: 'verduras',
      frutas: 'frutas',
      fruta: 'frutas',
      lacteos: 'lacteos',
      lácteos: 'lacteos',
      grasas: 'grasas',
      grasa: 'grasas',
      leguminosas: 'leguminosas',
      leguminosa: 'leguminosas',
      otros: 'otros',
      otro: 'otros',
    };

    // Order to display
    const ORDER = ['proteina', 'cereales', 'verduras', 'frutas', 'lacteos', 'grasas', 'leguminosas', 'otros'];

    const seen = new Set<string>();
    for (const raw of presentCategorySlugs) {
      const canonical = slugMap[raw.toLowerCase()] ?? raw.toLowerCase();
      seen.add(canonical);
    }
    // Always include a base set even if categories didn't map perfectly
    if (seen.size === 0) {
      seen.add('proteina');
      seen.add('cereales');
      seen.add('verduras');
      seen.add('frutas');
    }

    const result: CategoryBrandRecommendation[] = [];
    for (const key of ORDER) {
      if (seen.has(key) && BRAND_DATA[key]) {
        result.push(BRAND_DATA[key][strategy]);
      }
    }
    return result;
  }

  static getStrategyMeta(strategy: PurchaseStrategy): StrategyMeta {
    return STRATEGY_META[strategy] ?? STRATEGY_META.neutral;
  }
}
