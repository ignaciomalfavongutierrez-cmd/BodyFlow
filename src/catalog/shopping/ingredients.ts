import type { IngredientCatalogItem  } from '../../types/shoppingDiet';

export const INGREDIENTS: IngredientCatalogItem[] = [
  // ─────────────────────────────────────────────────────────────────────────────
  // 1. Proteínas (cat-1)
  // ─────────────────────────────────────────────────────────────────────────────
  { id: 'ing-1', name: 'Pechuga de pollo', slug: 'pechuga-de-pollo', category_id: 'cat-1', base_unit: 'g', purchase_unit: 'kg', waste_percentage: 10, commercial_rounding_step: 0.5, commercial_unit: 'kg', active: true },
  { id: 'ing-2', name: 'Atún en agua', slug: 'atun-en-agua', category_id: 'cat-1', base_unit: 'lata', purchase_unit: 'latas', waste_percentage: 10, commercial_rounding_step: 1, commercial_unit: 'latas', active: true },
  { id: 'ing-3', name: 'Huevo entero', slug: 'huevo-entero', category_id: 'cat-1', base_unit: 'pieza', purchase_unit: 'piezas', waste_percentage: 10, commercial_rounding_step: 6, commercial_unit: 'piezas', active: true },
  { id: 'ing-4', name: 'Carne molida de res', slug: 'carne-molida-de-res', category_id: 'cat-1', base_unit: 'g', purchase_unit: 'kg', waste_percentage: 10, commercial_rounding_step: 0.5, commercial_unit: 'kg', active: true },
  { id: 'ing-5', name: 'Filete de pescado', slug: 'filete-de-pescado', category_id: 'cat-1', base_unit: 'g', purchase_unit: 'kg', waste_percentage: 10, commercial_rounding_step: 0.5, commercial_unit: 'kg', active: true },
  { id: 'ing-28', name: 'Pechuga de pavo', slug: 'pechuga-de-pavo', category_id: 'cat-1', base_unit: 'g', purchase_unit: 'kg', waste_percentage: 10, commercial_rounding_step: 0.25, commercial_unit: 'kg', active: true },
  { id: 'ing-29', name: 'Claras de huevo', slug: 'claras-de-huevo', category_id: 'cat-1', base_unit: 'ml', purchase_unit: 'L', waste_percentage: 10, commercial_rounding_step: 1000, commercial_unit: 'L', active: true },
  { id: 'ing-30', name: 'Salmón fresco', slug: 'salmon-fresco', category_id: 'cat-1', base_unit: 'g', purchase_unit: 'kg', waste_percentage: 10, commercial_rounding_step: 0.5, commercial_unit: 'kg', active: true },
  { id: 'ing-31', name: 'Camarón', slug: 'camaron', category_id: 'cat-1', base_unit: 'g', purchase_unit: 'kg', waste_percentage: 10, commercial_rounding_step: 0.5, commercial_unit: 'kg', active: true },
  { id: 'ing-32', name: 'Bistec de res magro', slug: 'bistec-de-res-magro', category_id: 'cat-1', base_unit: 'g', purchase_unit: 'kg', waste_percentage: 10, commercial_rounding_step: 0.5, commercial_unit: 'kg', active: true },
  { id: 'ing-33', name: 'Lomo de cerdo', slug: 'lomo-de-cerdo', category_id: 'cat-1', base_unit: 'g', purchase_unit: 'kg', waste_percentage: 10, commercial_rounding_step: 0.5, commercial_unit: 'kg', active: true },
  { id: 'ing-34', name: 'Proteína en polvo', slug: 'proteina-en-polvo', category_id: 'cat-1', base_unit: 'g', purchase_unit: 'bote', waste_percentage: 5, commercial_rounding_step: 900, commercial_unit: 'bote', active: true },

  // ─────────────────────────────────────────────────────────────────────────────
  // 2. Cereales (cat-2)
  // ─────────────────────────────────────────────────────────────────────────────
  { id: 'ing-6', name: 'Avena en hojuelas', slug: 'avena', category_id: 'cat-2', base_unit: 'g', purchase_unit: 'g', waste_percentage: 10, commercial_rounding_step: 500, commercial_unit: 'g', active: true },
  { id: 'ing-7', name: 'Arroz blanco', slug: 'arroz', category_id: 'cat-2', base_unit: 'g', purchase_unit: 'kg', waste_percentage: 10, commercial_rounding_step: 0.5, commercial_unit: 'kg', active: true },
  { id: 'ing-8', name: 'Tortillas de maíz', slug: 'tortillas-de-maiz', category_id: 'cat-2', base_unit: 'pieza', purchase_unit: 'piezas', waste_percentage: 10, commercial_rounding_step: 10, commercial_unit: 'piezas', active: true },
  { id: 'ing-9', name: 'Tostadas horneadas', slug: 'tostadas-horneadas', category_id: 'cat-2', base_unit: 'pieza', purchase_unit: 'paquete', waste_percentage: 10, commercial_rounding_step: 20, commercial_unit: 'paquete', active: true },
  { id: 'ing-10', name: 'Pan integral', slug: 'pan-integral', category_id: 'cat-2', base_unit: 'rebanada', purchase_unit: 'paquete', waste_percentage: 10, commercial_rounding_step: 20, commercial_unit: 'paquete', active: true },
  { id: 'ing-35', name: 'Quinoa', slug: 'quinoa', category_id: 'cat-2', base_unit: 'g', purchase_unit: 'g', waste_percentage: 10, commercial_rounding_step: 500, commercial_unit: 'g', active: true },
  { id: 'ing-36', name: 'Arroz integral', slug: 'arroz-integral', category_id: 'cat-2', base_unit: 'g', purchase_unit: 'kg', waste_percentage: 10, commercial_rounding_step: 0.5, commercial_unit: 'kg', active: true },
  { id: 'ing-37', name: 'Pasta integral', slug: 'pasta-integral', category_id: 'cat-2', base_unit: 'g', purchase_unit: 'paquete', waste_percentage: 10, commercial_rounding_step: 200, commercial_unit: 'paquete', active: true },
  { id: 'ing-38', name: 'Tortillas de nopal', slug: 'tortillas-de-nopal', category_id: 'cat-2', base_unit: 'pieza', purchase_unit: 'paquete', waste_percentage: 10, commercial_rounding_step: 20, commercial_unit: 'paquete', active: true },
  { id: 'ing-39', name: 'Galletas de arroz', slug: 'galletas-de-arroz', category_id: 'cat-2', base_unit: 'pieza', purchase_unit: 'paquete', waste_percentage: 10, commercial_rounding_step: 14, commercial_unit: 'paquete', active: true },
  { id: 'ing-40', name: 'Papa', slug: 'papa', category_id: 'cat-2', base_unit: 'g', purchase_unit: 'kg', waste_percentage: 10, commercial_rounding_step: 0.5, commercial_unit: 'kg', active: true },
  { id: 'ing-41', name: 'Camote', slug: 'camote', category_id: 'cat-2', base_unit: 'g', purchase_unit: 'kg', waste_percentage: 10, commercial_rounding_step: 0.5, commercial_unit: 'kg', active: true },

  // ─────────────────────────────────────────────────────────────────────────────
  // 3. Verduras (cat-3)
  // ─────────────────────────────────────────────────────────────────────────────
  { id: 'ing-11', name: 'Jitomate', slug: 'jitomate', category_id: 'cat-3', base_unit: 'g', purchase_unit: 'kg', waste_percentage: 10, commercial_rounding_step: 0.5, commercial_unit: 'kg', active: true },
  { id: 'ing-12', name: 'Cebolla', slug: 'cebolla', category_id: 'cat-3', base_unit: 'g', purchase_unit: 'kg', waste_percentage: 10, commercial_rounding_step: 0.5, commercial_unit: 'kg', active: true },
  { id: 'ing-13', name: 'Espinaca', slug: 'espinaca', category_id: 'cat-3', base_unit: 'g', purchase_unit: 'g', waste_percentage: 10, commercial_rounding_step: 250, commercial_unit: 'g', active: true },
  { id: 'ing-14', name: 'Zanahoria', slug: 'zanahoria', category_id: 'cat-3', base_unit: 'g', purchase_unit: 'kg', waste_percentage: 10, commercial_rounding_step: 0.5, commercial_unit: 'kg', active: true },
  { id: 'ing-42', name: 'Calabacita', slug: 'calabacita', category_id: 'cat-3', base_unit: 'g', purchase_unit: 'kg', waste_percentage: 10, commercial_rounding_step: 0.5, commercial_unit: 'kg', active: true },
  { id: 'ing-43', name: 'Brócoli', slug: 'brocoli', category_id: 'cat-3', base_unit: 'g', purchase_unit: 'kg', waste_percentage: 10, commercial_rounding_step: 0.5, commercial_unit: 'kg', active: true },
  { id: 'ing-44', name: 'Champiñones', slug: 'champinones', category_id: 'cat-3', base_unit: 'g', purchase_unit: 'g', waste_percentage: 10, commercial_rounding_step: 250, commercial_unit: 'g', active: true },
  { id: 'ing-45', name: 'Nopales', slug: 'nopales', category_id: 'cat-3', base_unit: 'g', purchase_unit: 'kg', waste_percentage: 10, commercial_rounding_step: 0.5, commercial_unit: 'kg', active: true },
  { id: 'ing-46', name: 'Lechuga', slug: 'lechuga', category_id: 'cat-3', base_unit: 'pieza', purchase_unit: 'piezas', waste_percentage: 10, commercial_rounding_step: 1, commercial_unit: 'piezas', active: true },
  { id: 'ing-47', name: 'Pepino', slug: 'pepino', category_id: 'cat-3', base_unit: 'g', purchase_unit: 'kg', waste_percentage: 10, commercial_rounding_step: 0.5, commercial_unit: 'kg', active: true },
  { id: 'ing-48', name: 'Apio', slug: 'apio', category_id: 'cat-3', base_unit: 'g', purchase_unit: 'pieza', waste_percentage: 10, commercial_rounding_step: 1, commercial_unit: 'pieza', active: true },
  { id: 'ing-49', name: 'Pimiento morrón', slug: 'pimiento-morron', category_id: 'cat-3', base_unit: 'g', purchase_unit: 'kg', waste_percentage: 10, commercial_rounding_step: 0.5, commercial_unit: 'kg', active: true },
  { id: 'ing-50', name: 'Ejotes', slug: 'ejotes', category_id: 'cat-3', base_unit: 'g', purchase_unit: 'kg', waste_percentage: 10, commercial_rounding_step: 0.5, commercial_unit: 'kg', active: true },
  { id: 'ing-51', name: 'Coliflor', slug: 'coliflor', category_id: 'cat-3', base_unit: 'g', purchase_unit: 'pieza', waste_percentage: 10, commercial_rounding_step: 1, commercial_unit: 'pieza', active: true },
  { id: 'ing-52', name: 'Espárragos', slug: 'esparragos', category_id: 'cat-3', base_unit: 'g', purchase_unit: 'manojo', waste_percentage: 10, commercial_rounding_step: 1, commercial_unit: 'manojo', active: true },
  { id: 'ing-53', name: 'Mix de verduras salteadas', slug: 'mix-verduras-salteadas', category_id: 'cat-3', base_unit: 'g', purchase_unit: 'kg', waste_percentage: 10, commercial_rounding_step: 0.5, commercial_unit: 'kg', active: true },
  { id: 'ing-54', name: 'Verduras al vapor', slug: 'verduras-al-vapor', category_id: 'cat-3', base_unit: 'g', purchase_unit: 'kg', waste_percentage: 10, commercial_rounding_step: 0.5, commercial_unit: 'kg', active: true },
  { id: 'ing-55', name: 'Ensalada verde mixta', slug: 'ensalada-verde-mixta', category_id: 'cat-3', base_unit: 'g', purchase_unit: 'bolsa', waste_percentage: 10, commercial_rounding_step: 1, commercial_unit: 'bolsa', active: true },
  { id: 'ing-91', name: 'Verduras mixtas / para guisar', slug: 'verduras-mixtas-guisar', category_id: 'cat-3', base_unit: 'g', purchase_unit: 'kg', waste_percentage: 10, commercial_rounding_step: 0.5, commercial_unit: 'kg', active: true },

  // ─────────────────────────────────────────────────────────────────────────────
  // 4. Frutas (cat-4)
  // ─────────────────────────────────────────────────────────────────────────────
  { id: 'ing-15', name: 'Plátano', slug: 'platano', category_id: 'cat-4', base_unit: 'pieza', purchase_unit: 'piezas', waste_percentage: 10, commercial_rounding_step: 1, commercial_unit: 'kg', active: true },
  { id: 'ing-16', name: 'Manzana', slug: 'manzana', category_id: 'cat-4', base_unit: 'pieza', purchase_unit: 'piezas', waste_percentage: 10, commercial_rounding_step: 1, commercial_unit: 'kg', active: true },
  { id: 'ing-17', name: 'Fresa', slug: 'fresa', category_id: 'cat-4', base_unit: 'g', purchase_unit: 'g', waste_percentage: 10, commercial_rounding_step: 500, commercial_unit: 'g', active: true },
  { id: 'ing-56', name: 'Frutos rojos mixtos', slug: 'frutos-rojos-mixtos', category_id: 'cat-4', base_unit: 'g', purchase_unit: 'g', waste_percentage: 10, commercial_rounding_step: 300, commercial_unit: 'g', active: true },
  { id: 'ing-57', name: 'Papaya', slug: 'papaya', category_id: 'cat-4', base_unit: 'g', purchase_unit: 'kg', waste_percentage: 10, commercial_rounding_step: 1, commercial_unit: 'kg', active: true },
  { id: 'ing-58', name: 'Melón', slug: 'melon', category_id: 'cat-4', base_unit: 'g', purchase_unit: 'pieza', waste_percentage: 10, commercial_rounding_step: 1, commercial_unit: 'pieza', active: true },
  { id: 'ing-59', name: 'Piña', slug: 'pina', category_id: 'cat-4', base_unit: 'g', purchase_unit: 'pieza', waste_percentage: 10, commercial_rounding_step: 1, commercial_unit: 'pieza', active: true },
  { id: 'ing-60', name: 'Arándanos frescos', slug: 'arandanos-frescos', category_id: 'cat-4', base_unit: 'g', purchase_unit: 'caja', waste_percentage: 10, commercial_rounding_step: 1, commercial_unit: 'caja', active: true },
  { id: 'ing-61', name: 'Naranja', slug: 'naranja', category_id: 'cat-4', base_unit: 'pieza', purchase_unit: 'kg', waste_percentage: 10, commercial_rounding_step: 1, commercial_unit: 'kg', active: true },
  { id: 'ing-62', name: 'Mango', slug: 'mango', category_id: 'cat-4', base_unit: 'pieza', purchase_unit: 'kg', waste_percentage: 10, commercial_rounding_step: 1, commercial_unit: 'kg', active: true },
  { id: 'ing-90', name: 'Fruta de temporada', slug: 'fruta-de-temporada', category_id: 'cat-4', base_unit: 'pieza', purchase_unit: 'piezas', waste_percentage: 10, commercial_rounding_step: 1, commercial_unit: 'kg', active: true },

  // ─────────────────────────────────────────────────────────────────────────────
  // 5. Grasas (cat-5)
  // ─────────────────────────────────────────────────────────────────────────────
  { id: 'ing-18', name: 'Crema de cacahuate', slug: 'crema-de-cacahuate', category_id: 'cat-5', base_unit: 'g', purchase_unit: 'frasco', waste_percentage: 10, commercial_rounding_step: 1, commercial_unit: 'frasco', active: true },
  { id: 'ing-19', name: 'Aguacate', slug: 'aguacate', category_id: 'cat-5', base_unit: 'g', purchase_unit: 'kg', waste_percentage: 10, commercial_rounding_step: 0.5, commercial_unit: 'kg', active: true },
  { id: 'ing-20', name: 'Aceite de oliva extra virgen', slug: 'aceite-de-oliva', category_id: 'cat-5', base_unit: 'ml', purchase_unit: 'L', waste_percentage: 10, commercial_rounding_step: 0.5, commercial_unit: 'L', active: true },
  { id: 'ing-63', name: 'Aceite en aerosol (spray)', slug: 'aceite-en-aerosol', category_id: 'cat-5', base_unit: 'pieza', purchase_unit: 'bote', waste_percentage: 5, commercial_rounding_step: 1, commercial_unit: 'bote', active: true },
  { id: 'ing-64', name: 'Almendras naturales', slug: 'almendras-naturales', category_id: 'cat-5', base_unit: 'g', purchase_unit: 'g', waste_percentage: 10, commercial_rounding_step: 250, commercial_unit: 'g', active: true },
  { id: 'ing-65', name: 'Nuez en mitades', slug: 'nuez-en-mitades', category_id: 'cat-5', base_unit: 'g', purchase_unit: 'g', waste_percentage: 10, commercial_rounding_step: 250, commercial_unit: 'g', active: true },
  { id: 'ing-66', name: 'Semillas de chía', slug: 'semillas-de-chia', category_id: 'cat-5', base_unit: 'g', purchase_unit: 'bolsa', waste_percentage: 10, commercial_rounding_step: 1, commercial_unit: 'bolsa', active: true },
  { id: 'ing-67', name: 'Cacahuates tostados sin sal', slug: 'cacahuates-tostados', category_id: 'cat-5', base_unit: 'g', purchase_unit: 'bolsa', waste_percentage: 10, commercial_rounding_step: 1, commercial_unit: 'bolsa', active: true },
  { id: 'ing-68', name: 'Aceite de coco', slug: 'aceite-de-coco', category_id: 'cat-5', base_unit: 'ml', purchase_unit: 'frasco', waste_percentage: 10, commercial_rounding_step: 1, commercial_unit: 'frasco', active: true },

  // ─────────────────────────────────────────────────────────────────────────────
  // 6. Leguminosas (cat-6)
  // ─────────────────────────────────────────────────────────────────────────────
  { id: 'ing-21', name: 'Frijol negro', slug: 'frijol-negro', category_id: 'cat-6', base_unit: 'g', purchase_unit: 'kg', waste_percentage: 10, commercial_rounding_step: 0.5, commercial_unit: 'kg', active: true },
  { id: 'ing-22', name: 'Lentejas', slug: 'lentejas', category_id: 'cat-6', base_unit: 'g', purchase_unit: 'kg', waste_percentage: 10, commercial_rounding_step: 0.5, commercial_unit: 'kg', active: true },
  { id: 'ing-69', name: 'Garbanzos', slug: 'garbanzos', category_id: 'cat-6', base_unit: 'g', purchase_unit: 'kg', waste_percentage: 10, commercial_rounding_step: 0.5, commercial_unit: 'kg', active: true },
  { id: 'ing-70', name: 'Frijol bayo o pinto', slug: 'frijol-bayo', category_id: 'cat-6', base_unit: 'g', purchase_unit: 'kg', waste_percentage: 10, commercial_rounding_step: 0.5, commercial_unit: 'kg', active: true },
  { id: 'ing-71', name: 'Habas secas', slug: 'habas-secas', category_id: 'cat-6', base_unit: 'g', purchase_unit: 'kg', waste_percentage: 10, commercial_rounding_step: 0.5, commercial_unit: 'kg', active: true },
  { id: 'ing-72', name: 'Edamames', slug: 'edamames', category_id: 'cat-6', base_unit: 'g', purchase_unit: 'bolsa', waste_percentage: 10, commercial_rounding_step: 1, commercial_unit: 'bolsa', active: true },

  // ─────────────────────────────────────────────────────────────────────────────
  // 7. Lácteos (cat-7)
  // ─────────────────────────────────────────────────────────────────────────────
  { id: 'ing-23', name: 'Leche entera', slug: 'leche-entera', category_id: 'cat-7', base_unit: 'ml', purchase_unit: 'L', waste_percentage: 10, commercial_rounding_step: 0.5, commercial_unit: 'L', active: true },
  { id: 'ing-24', name: 'Leche descremada', slug: 'leche-descremada', category_id: 'cat-7', base_unit: 'ml', purchase_unit: 'L', waste_percentage: 10, commercial_rounding_step: 0.5, commercial_unit: 'L', active: true },
  { id: 'ing-25', name: 'Yogurt griego', slug: 'yogurt-griego', category_id: 'cat-7', base_unit: 'g', purchase_unit: 'g', waste_percentage: 10, commercial_rounding_step: 500, commercial_unit: 'g', active: true },
  { id: 'ing-73', name: 'Yogurt natural sin azúcar', slug: 'yogurt-natural', category_id: 'cat-7', base_unit: 'g', purchase_unit: 'g', waste_percentage: 10, commercial_rounding_step: 500, commercial_unit: 'g', active: true },
  { id: 'ing-74', name: 'Queso panela', slug: 'queso-panela', category_id: 'cat-7', base_unit: 'g', purchase_unit: 'kg', waste_percentage: 10, commercial_rounding_step: 0.4, commercial_unit: 'kg', active: true },
  { id: 'ing-75', name: 'Queso cottage', slug: 'queso-cottage', category_id: 'cat-7', base_unit: 'g', purchase_unit: 'bote', waste_percentage: 10, commercial_rounding_step: 1, commercial_unit: 'bote', active: true },
  { id: 'ing-76', name: 'Queso Oaxaca / hebra', slug: 'queso-oaxaca', category_id: 'cat-7', base_unit: 'g', purchase_unit: 'kg', waste_percentage: 10, commercial_rounding_step: 0.5, commercial_unit: 'kg', active: true },
  { id: 'ing-77', name: 'Leche deslactosada light', slug: 'leche-deslactosada-light', category_id: 'cat-7', base_unit: 'ml', purchase_unit: 'L', waste_percentage: 10, commercial_rounding_step: 0.5, commercial_unit: 'L', active: true },
  { id: 'ing-78', name: 'Kéfir natural', slug: 'kefir-natural', category_id: 'cat-7', base_unit: 'ml', purchase_unit: 'L', waste_percentage: 10, commercial_rounding_step: 0.5, commercial_unit: 'L', active: true },

  // ─────────────────────────────────────────────────────────────────────────────
  // 8. Otros (cat-8)
  // ─────────────────────────────────────────────────────────────────────────────
  { id: 'ing-26', name: 'Canela en polvo', slug: 'canela', category_id: 'cat-8', base_unit: 'g', purchase_unit: 'frasco', waste_percentage: 10, commercial_rounding_step: 1, commercial_unit: 'frasco', active: true },
  { id: 'ing-27', name: 'Limón', slug: 'limon', category_id: 'cat-8', base_unit: 'pieza', purchase_unit: 'kg', waste_percentage: 10, commercial_rounding_step: 0.5, commercial_unit: 'kg', active: true },
  { id: 'ing-79', name: 'Sal de mesa / marina', slug: 'sal', category_id: 'cat-8', base_unit: 'g', purchase_unit: 'bote', waste_percentage: 5, commercial_rounding_step: 1, commercial_unit: 'bote', active: true },
  { id: 'ing-80', name: 'Pimienta negra molida', slug: 'pimienta-negra', category_id: 'cat-8', base_unit: 'g', purchase_unit: 'frasco', waste_percentage: 5, commercial_rounding_step: 1, commercial_unit: 'frasco', active: true },
  { id: 'ing-81', name: 'Ajo en polvo', slug: 'ajo-en-polvo', category_id: 'cat-8', base_unit: 'g', purchase_unit: 'frasco', waste_percentage: 5, commercial_rounding_step: 1, commercial_unit: 'frasco', active: true },
  { id: 'ing-82', name: 'Orégano seco', slug: 'oregano-seco', category_id: 'cat-8', base_unit: 'g', purchase_unit: 'frasco', waste_percentage: 5, commercial_rounding_step: 1, commercial_unit: 'frasco', active: true },
  { id: 'ing-83', name: 'Café de grano / soluble', slug: 'cafe', category_id: 'cat-8', base_unit: 'g', purchase_unit: 'frasco', waste_percentage: 5, commercial_rounding_step: 1, commercial_unit: 'frasco', active: true },
  { id: 'ing-84', name: 'Té verde / manzanilla', slug: 'te', category_id: 'cat-8', base_unit: 'bolsita', purchase_unit: 'caja', waste_percentage: 5, commercial_rounding_step: 1, commercial_unit: 'caja', active: true },
  { id: 'ing-85', name: 'Miel de abeja', slug: 'miel-de-abeja', category_id: 'cat-8', base_unit: 'g', purchase_unit: 'frasco', waste_percentage: 5, commercial_rounding_step: 1, commercial_unit: 'frasco', active: true },
  { id: 'ing-86', name: 'Mermelada natural', slug: 'mermelada-natural', category_id: 'cat-8', base_unit: 'g', purchase_unit: 'frasco', waste_percentage: 5, commercial_rounding_step: 1, commercial_unit: 'frasco', active: true },
  { id: 'ing-87', name: 'Mostaza', slug: 'mostaza', category_id: 'cat-8', base_unit: 'g', purchase_unit: 'frasco', waste_percentage: 5, commercial_rounding_step: 1, commercial_unit: 'frasco', active: true },
  { id: 'ing-88', name: 'Salsa de soya baja en sodio', slug: 'salsa-de-soya', category_id: 'cat-8', base_unit: 'ml', purchase_unit: 'frasco', waste_percentage: 5, commercial_rounding_step: 1, commercial_unit: 'frasco', active: true },
  { id: 'ing-89', name: 'Vinagre de manzana / blanco', slug: 'vinagre', category_id: 'cat-8', base_unit: 'ml', purchase_unit: 'botella', waste_percentage: 5, commercial_rounding_step: 1, commercial_unit: 'botella', active: true },
];

