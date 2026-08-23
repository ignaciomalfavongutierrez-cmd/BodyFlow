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
      headline: '¡Cómpralas en el mercado o tianguis!',
      brands: [
        { name: 'Mercado/Tianguis local', tip: 'Siempre más fresco y económico que supermercado' },
        { name: 'Central de Abastos', tip: 'Precios al mayoreo, ideal para la semana' },
        { name: 'Chedraui / Soriana Básico', tip: 'Bolsas de verdura mixta a bajo costo' },
        { name: 'Great Value (Walmart)', tip: 'Verduras congeladas cuando no hay fresco' },
      ],
    },
    value: {
      categorySlug: 'verduras',
      categoryName: 'Verduras',
      emoji: '🥦',
      headline: 'Frescas de temporada o congeladas',
      brands: [
        { name: 'Mercado local', tip: 'Elige verdura de temporada para mayor frescura' },
        { name: 'Del Fuerte', tip: 'Jitomate, chiles y purés a buen precio' },
        { name: 'McCormick / Herdez', tip: 'Chiles, salsas y condimentos confiables' },
        { name: 'Birds Eye', tip: 'Mezclas de verduras congeladas prácticas' },
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
        { name: 'Mercado local o tianguis', tip: 'Primera opción: frescas y de temporada' },
        { name: 'Del Fuerte', tip: 'Jitomate y purés de tomate' },
        { name: "Congeladas Bird's Eye", tip: 'Práctica alternativa para días ocupados' },
      ],
    },
  },

  frutas: {
    economic: {
      categorySlug: 'frutas',
      categoryName: 'Frutas',
      emoji: '🍎',
      headline: '¡En el mercado o tianguis!',
      brands: [
        { name: 'Tianguis / Mercado local', tip: 'Fruta de temporada mucho más barata y fresca' },
        { name: 'Chedraui / Bodega Aurrerá', tip: 'Fruta de temporada en oferta semanal' },
        { name: 'Great Value', tip: 'Fruta en almíbar o congelada como alternativa' },
        { name: 'Del Monte', tip: 'Jugos 100% naturales sin azúcar añadida' },
      ],
    },
    value: {
      categorySlug: 'frutas',
      categoryName: 'Frutas',
      emoji: '🍎',
      headline: 'Frescas de temporada',
      brands: [
        { name: 'Mercado local', tip: 'Elige fruta de temporada para menor costo' },
        { name: 'Del Monte', tip: 'Jugos naturales y fruta en conserva sin azúcar' },
        { name: 'Jumex Natural', tip: '100% jugo de fruta sin azúcar añadida' },
        { name: 'Dole', tip: 'Fruta enlatada o deshidratada' },
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
        { name: 'Tianguis o mercado local', tip: 'Primera opción siempre' },
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
      headline: 'Proteínas de calidad al menor costo',
      brands: [
        { name: 'Great Value (Walmart)', tip: 'Atún, sardinas y pollo a precio accesible' },
        { name: 'Seasons / El Rancho', tip: 'Pechuga y pierna de pollo congelada económica' },
        { name: 'Del Fuerte Atún', tip: 'Atún en agua, alta proteína y bajo costo' },
        { name: 'Huevo San Juan / Bachoco', tip: 'Huevo blanco o rojo, excelente precio proteína' },
        { name: 'Frijol negro / pinto a granel', tip: 'Proteína vegetal muy económica en mercado' },
      ],
    },
    value: {
      categorySlug: 'proteina',
      categoryName: 'Proteínas',
      emoji: '🥩',
      headline: 'Balance calidad-precio',
      brands: [
        { name: 'Bachoco', tip: 'Pechuga y muslos de pollo de confianza' },
        { name: 'Comercial Mexicana / Chedraui', tip: 'Cortes de res y cerdo a buen precio' },
        { name: 'Del Fuerte / Herdez Atún', tip: 'Atún en agua de calidad' },
        { name: 'La Villita / San Rafael', tip: 'Embutidos y jamones sin tanto conservador' },
        { name: 'Huevo Bachoco', tip: 'Huevo orgánico o naturales a precio accesible' },
      ],
    },
    premium: {
      categorySlug: 'proteina',
      categoryName: 'Proteínas',
      emoji: '🥩',
      headline: 'Alta calidad y proteína limpia',
      brands: [
        { name: 'SuKarne Premium', tip: 'Cortes de res madurados y de calidad' },
        { name: 'Salmón y atún fresco (pescaderías)', tip: 'Omega-3 y proteína de alta calidad' },
        { name: 'Bachoco Orgánico', tip: 'Pollo sin hormonas ni antibióticos' },
        { name: 'Huevo de gallinas libres (mercado)', tip: 'Mayor calidad nutricional' },
        { name: 'Tofu / Tempeh (tiendas naturistas)', tip: 'Proteína vegetal de alta calidad' },
      ],
    },
    neutral: {
      categorySlug: 'proteina',
      categoryName: 'Proteínas',
      emoji: '🥩',
      headline: 'Proteínas variadas y confiables',
      brands: [
        { name: 'Bachoco', tip: 'Pollo en todas sus presentaciones' },
        { name: 'Del Fuerte Atún en agua', tip: 'Económico y alto en proteína' },
        { name: 'Huevo Bachoco / San Juan', tip: 'Fuente económica de proteína completa' },
      ],
    },
  },

  cereales: {
    economic: {
      categorySlug: 'cereales',
      categoryName: 'Cereales',
      emoji: '🌾',
      headline: 'Carbohidratos de bajo costo',
      brands: [
        { name: 'Great Value (Walmart)', tip: 'Avena, arroz y pastas muy económicas' },
        { name: 'Maseca', tip: 'Masa de maíz nixtamalizado, pilar de la dieta mexicana' },
        { name: 'La Moderna', tip: 'Pasta de sémola a excelente precio' },
        { name: 'Arroz SOS / Arroz granel', tip: 'Compra a granel en mercado para ahorrar' },
        { name: 'Quaker', tip: 'Avena instantánea económica' },
      ],
    },
    value: {
      categorySlug: 'cereales',
      categoryName: 'Cereales',
      emoji: '🌾',
      headline: 'Cereales de calidad equilibrada',
      brands: [
        { name: 'Quaker', tip: 'Avena en hojuela, alta fibra' },
        { name: 'Bimbo', tip: 'Pan integral con fibra real' },
        { name: 'Maseca Integral', tip: 'Tortillas de maíz más nutritivas' },
        { name: 'La Moderna Integral', tip: 'Pasta con más fibra que la regular' },
        { name: 'Tía Rosa Tostadas', tip: 'Tostadas horneadas sin grasa agregada' },
      ],
    },
    premium: {
      categorySlug: 'cereales',
      categoryName: 'Cereales',
      emoji: '🌾',
      headline: 'Granos enteros y sin procesar',
      brands: [
        { name: "Bob's Red Mill", tip: 'Avena y granos enteros de primera calidad' },
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
        { name: 'Maseca', tip: 'Para tortillas de maíz caseras' },
        { name: 'Bimbo Integral', tip: 'Pan de caja con fibra' },
      ],
    },
  },

  lacteos: {
    economic: {
      categorySlug: 'lacteos',
      categoryName: 'Lácteos',
      emoji: '🥛',
      headline: 'Lácteos accesibles y nutritivos',
      brands: [
        { name: 'Lala', tip: 'Leche y yogur a precio accesible en todas las tiendas' },
        { name: 'Great Value (Walmart)', tip: 'Leche entera y queso fresco económico' },
        { name: 'Alpura Básico', tip: 'Leche de larga vida útil, ideal para la semana' },
        { name: 'Yoplait (presentación pequeña)', tip: 'Yogur natural sin azúcar a buen precio' },
      ],
    },
    value: {
      categorySlug: 'lacteos',
      categoryName: 'Lácteos',
      emoji: '🥛',
      headline: 'Calidad comprobada',
      brands: [
        { name: 'Alpura', tip: 'Leche y quesos de calidad confiable' },
        { name: 'Lala', tip: 'Amplia variedad de lácteos accesibles' },
        { name: 'Danone Oikos', tip: 'Yogur griego rico en proteína' },
        { name: 'Philadelphia', tip: 'Queso crema sin tanto aditivo' },
        { name: 'Sigma / Nochebuena', tip: 'Quesos blancos frescos sin conservadores' },
      ],
    },
    premium: {
      categorySlug: 'lacteos',
      categoryName: 'Lácteos',
      emoji: '🥛',
      headline: 'Lácteos de alta calidad',
      brands: [
        { name: 'Organic Valley', tip: 'Leche orgánica de libre pastoreo' },
        { name: 'Danone Activia Premium', tip: 'Yogur con probióticos activos' },
        { name: 'Quesos artesanales (mercado)', tip: 'Quesos de rancho sin conservadores' },
        { name: 'Kefir artesanal', tip: 'Probióticos naturales de alta potencia' },
      ],
    },
    neutral: {
      categorySlug: 'lacteos',
      categoryName: 'Lácteos',
      emoji: '🥛',
      headline: 'Lácteos frescos y de calidad',
      brands: [
        { name: 'Lala / Alpura', tip: 'Leche entera o light' },
        { name: 'Danone', tip: 'Yogur natural sin azúcar' },
        { name: 'Queso fresco local', tip: 'Del mercado, más fresco y económico' },
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
        { name: 'Aguacate (tianguis / mercado)', tip: 'Aguacate Hass de temporada al mejor precio' },
        { name: 'Aceite Capullo / 1-2-3', tip: 'Aceite de girasol a bajo costo' },
        { name: 'Great Value Aceite de Oliva', tip: 'Opción accesible de aceite de oliva' },
        { name: 'Maní tostado a granel', tip: 'Proteína y grasa saludable muy económica' },
      ],
    },
    value: {
      categorySlug: 'grasas',
      categoryName: 'Grasas',
      emoji: '🥑',
      headline: 'Grasas de calidad equilibrada',
      brands: [
        { name: 'Nutrioli Oliva', tip: 'Aceite de oliva extra virgen accesible' },
        { name: 'Barcel Cacahuate', tip: 'Cacahuate natural sin sal añadida' },
        { name: 'Herdez Guacamole', tip: 'Aguacate listo práctico' },
        { name: 'Almendras / Nuez Kirkland', tip: 'Buena relación precio-calidad en Costco' },
      ],
    },
    premium: {
      categorySlug: 'grasas',
      categoryName: 'Grasas',
      emoji: '🥑',
      headline: 'Grasas premium y sin procesar',
      brands: [
        { name: 'Aceite de coco orgánico', tip: 'Para cocinar a altas temperaturas' },
        { name: 'Olivares Monterrey / Gourmet', tip: 'Aceite de oliva extra virgen de primera prensada' },
        { name: 'Mantequilla de almendra natural', tip: 'Sin azúcar ni aceites hidrogenados' },
        { name: 'Nuez / semillas crudas (mercado)', tip: 'Sin tostar ni sazonar para máximo beneficio' },
      ],
    },
    neutral: {
      categorySlug: 'grasas',
      categoryName: 'Grasas',
      emoji: '🥑',
      headline: 'Grasas saludables',
      brands: [
        { name: 'Nutrioli / Capullo', tip: 'Aceites vegetales confiables' },
        { name: 'Aguacate de temporada', tip: 'Del mercado cuando esté en temporada' },
        { name: 'Nuez o almendra (Kirkland)', tip: 'Buena relación precio/calidad' },
      ],
    },
  },

  leguminosas: {
    economic: {
      categorySlug: 'leguminosas',
      categoryName: 'Leguminosas',
      emoji: '🫘',
      headline: 'Proteína vegetal muy económica',
      brands: [
        { name: 'Frijol / Lenteja a granel (mercado)', tip: 'El más barato y fresco; compra por kilo' },
        { name: 'La Costeña', tip: 'Frijoles y garbanzos en lata muy económicos' },
        { name: 'San Marcos Frijoles', tip: 'Frijoles negros y bayos a buen precio' },
        { name: 'Great Value (Walmart)', tip: 'Lentejas y garbanzos secos económicos' },
      ],
    },
    value: {
      categorySlug: 'leguminosas',
      categoryName: 'Leguminosas',
      emoji: '🫘',
      headline: 'Leguminosas de confianza',
      brands: [
        { name: 'La Costeña', tip: 'Amplia variedad de leguminosas en conserva' },
        { name: 'Del Fuerte', tip: 'Frijoles bayos y negros de calidad' },
        { name: 'Pepe\'s Picante', tip: 'Habas y garbanzos sazonados prácticos' },
        { name: 'Lenteja a granel', tip: 'Compra semanal en mercado local' },
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
        { name: 'Amaranto nixtamalizado', tip: 'Súper nutritivo, ancestral y mexicano' },
      ],
    },
    neutral: {
      categorySlug: 'leguminosas',
      categoryName: 'Leguminosas',
      emoji: '🫘',
      headline: 'Leguminosas variadas',
      brands: [
        { name: 'A granel en mercado local', tip: 'Siempre más fresco y económico' },
        { name: 'La Costeña', tip: 'Para cuando necesites rapidez y practicidad' },
      ],
    },
  },

  otros: {
    economic: {
      categorySlug: 'otros',
      categoryName: 'Otros',
      emoji: '🛒',
      headline: 'Condimentos y básicos de cocina',
      brands: [
        { name: 'Great Value (Walmart)', tip: 'Especias, salsas y condimentos a bajo precio' },
        { name: 'McCormick', tip: 'Especias confiables, busca presentaciones chicas' },
        { name: 'La Costeña / Herdez', tip: 'Chiles, salsas y jitomate en conserva' },
        { name: 'Canela, comino, ajo (mercado)', tip: 'A granel sale hasta 5x más económico' },
      ],
    },
    value: {
      categorySlug: 'otros',
      categoryName: 'Otros',
      emoji: '🛒',
      headline: 'Condimentos de buena calidad',
      brands: [
        { name: 'McCormick', tip: 'Especias enteras de mejor aroma que molidas' },
        { name: 'Herdez', tip: 'Salsas y chiles sin conservadores innecesarios' },
        { name: 'Knorr Suiza', tip: 'Caldos y sazonadores de uso común' },
        { name: 'Vidrio de especias Costco', tip: 'Ahorra comprando presentaciones grandes' },
      ],
    },
    premium: {
      categorySlug: 'otros',
      categoryName: 'Otros',
      emoji: '🛒',
      headline: 'Especias y condimentos premium',
      brands: [
        { name: 'Especias a granel (mercado artesanal)', tip: 'Mayor aceite esencial = más sabor y propiedades' },
        { name: 'Vanilla Premium / Gourmet', tip: 'Vainilla natural mexicana de Papantla' },
        { name: 'Sal rosada del Himalaya', tip: 'Con microminerales, alternativa a la sal de mesa' },
        { name: 'Cúrcuma / Jengibre orgánicos', tip: 'Antiinflamatorios naturales de alta potencia' },
      ],
    },
    neutral: {
      categorySlug: 'otros',
      categoryName: 'Otros',
      emoji: '🛒',
      headline: 'Básicos de cocina',
      brands: [
        { name: 'McCormick', tip: 'Especias confiables' },
        { name: 'Herdez / La Costeña', tip: 'Salsas y chiles en lata' },
        { name: 'A granel en mercado', tip: 'Para especias básicas como comino, orégano y canela' },
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
