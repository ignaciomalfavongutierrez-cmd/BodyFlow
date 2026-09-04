import type { DishItem } from '../../types/dietMenu';

export const HEALTHY_DISHES_CATALOG: DishItem[] = [
  // ==========================================
  // DESAYUNOS
  // ==========================================
  {
    id: 'dish-des-1',
    nombre: 'Huevos a la Mexicana con Aguacate y Tostadas Horneadas',
    descripcion: '2 huevos enteros revueltos con jitomate, cebolla y chile serrano, 1/3 de aguacate hass y 2 tostadas de maíz horneadas.',
    porcion: '1 plato completo',
    categoria: 'desayuno',
    ingredientes: ['2 huevos enteros', '1 jitomate picado', '1/4 cebolla', '1/3 aguacate', '2 tostadas horneadas Sanissimo'],
    macros: {
      calories: 360,
      protein: 22,
      carbs: 30,
      fat: 16
    }
  },
  {
    id: 'dish-des-2',
    nombre: 'Omelette de Claras con Espinacas, Champiñones y Queso Panela',
    descripcion: '4 claras de huevo con espinacas baby, champiñones frescos y 40g de queso panela bajo en grasa, acompañado de 1 rebanada de pan integral.',
    porcion: '1 porción grande',
    categoria: 'desayuno',
    ingredientes: ['4 claras de huevo', '1 taza de espinacas', '1/2 taza de champiñones', '40g queso panela', '1 rebanada pan integral'],
    macros: {
      calories: 280,
      protein: 28,
      carbs: 18,
      fat: 10
    }
  },
  {
    id: 'dish-des-3',
    nombre: 'Avena Cocida con Frutos Rojos, Chía y Proteína en Polvo',
    descripcion: '40g de avena en hojuelas cocida con agua y canela, 1 scoop de proteína aislada de suero o vegetal, 1/2 taza de fresas y 1 cucharadita de chía.',
    porcion: '1 bowl',
    categoria: 'desayuno',
    ingredientes: ['40g avena en hojuelas', '1 scoop proteína en polvo (25g)', '1/2 taza fresas/arándanos', '1 cdta chía', 'Canela en polvo'],
    macros: {
      calories: 380,
      protein: 32,
      carbs: 48,
      fat: 6
    }
  },
  {
    id: 'dish-des-4',
    nombre: 'Chilaquiles Ligeros con Pollo Deshebrado y Salsa Verde',
    descripcion: '3 tortillas de maíz cortadas y horneadas en freidora de aire bañadas en salsa verde casera sin freír, 100g de pechuga de pollo deshebrada y 30g queso panela.',
    porcion: '1 plato mediano',
    categoria: 'desayuno',
    ingredientes: ['3 tortillas de maíz', '100g pechuga de pollo', 'Salsa verde de tomatillo hervido', '30g queso panela', 'Cilantro y cebolla morada'],
    macros: {
      calories: 420,
      protein: 38,
      carbs: 42,
      fat: 10
    }
  },
  {
    id: 'dish-des-5',
    nombre: 'Molletes Integrales con Frijoles de la Olla y Queso Panela',
    descripcion: '1 pan birote o bolillo integral sin migajón con frijoles bayos enteros machacados sin manteca, 50g de queso panela gratinado y pico de gallo fresco.',
    porcion: '2 mitades',
    categoria: 'desayuno',
    ingredientes: ['1 bolillo/telera integral sin migajón', '1/2 taza frijoles de la olla machacados', '50g queso panela', 'Pico de gallo al gusto'],
    macros: {
      calories: 340,
      protein: 20,
      carbs: 46,
      fat: 8
    }
  },

  // ==========================================
  // COMIDAS
  // ==========================================
  {
    id: 'dish-com-1',
    nombre: 'Pechuga a la Plancha con Arroz Jazmín, Aguacate y Ensalada Verde',
    descripcion: '140g de pechuga de pollo marinada con hierbas finas a la plancha, 1 taza de arroz blanco o jazmín al vapor, 1/3 aguacate y ensalada mixta de lechuga y pepino con limón.',
    porcion: '1 plato fuerte',
    categoria: 'comida',
    ingredientes: ['140g pechuga de pollo', '1 taza arroz al vapor (150g cocido)', '1/3 aguacate hass', '2 tazas lechuga y pepino', 'Limón y sal de mar'],
    macros: {
      calories: 490,
      protein: 46,
      carbs: 48,
      fat: 12
    }
  },
  {
    id: 'dish-com-2',
    nombre: 'Salmón al Limón con Quinoa Cocida y Espárragos al Vapor',
    descripcion: '130g de filete de salmón fresco a la plancha con limón y romero, 3/4 taza de quinoa cocida y 6 espárragos salteados en 1 cucharadita de aceite de oliva.',
    porcion: '1 plato fuerte',
    categoria: 'comida',
    ingredientes: ['130g filete de salmón', '3/4 taza quinoa cocida', '6 espárragos verdes', '1 cdta aceite de oliva extra virgen', 'Limón'],
    macros: {
      calories: 510,
      protein: 40,
      carbs: 36,
      fat: 22
    }
  },
  {
    id: 'dish-com-3',
    nombre: 'Fajitas de Res Magra con Pimientos, Nopales y Tortillas',
    descripcion: '130g de pulpa o filete de res magra en tiras salteada con pimientos verde y rojo, cebolla y nopales asados, acompañado de 3 tortillas de maíz.',
    porcion: '1 plato fuerte',
    categoria: 'comida',
    ingredientes: ['130g res magra (bistec de pulpa)', '1 pimiento morrón', '1 nopal grande en tiras', '1/4 cebolla', '3 tortillas de maíz'],
    macros: {
      calories: 450,
      protein: 42,
      carbs: 40,
      fat: 13
    }
  },
  {
    id: 'dish-com-4',
    nombre: 'Filete de Pescado Blanco al Ajillo con Puré de Papa y Brócoli',
    descripcion: '160g de filete de tilapia o lubina al ajo con chile guajillo, puré de papa natural sin mantequilla (1 papa mediana) y 1 taza de brócoli al vapor.',
    porcion: '1 plato fuerte',
    categoria: 'comida',
    ingredientes: ['160g filete tilapia/basa blanco', '1 papa mediana hervida en puré', '1 taza brócoli al vapor', '1 diente de ajo y guajillo', '1 cdta aceite de oliva'],
    macros: {
      calories: 410,
      protein: 38,
      carbs: 42,
      fat: 9
    }
  },
  {
    id: 'dish-com-5',
    nombre: 'Atún Fresco Sellado en Ajonjolí con Ensalada y Tostadas',
    descripcion: '140g de medallón de atún fresco sellado con ajonjolí negro, ensalada de pepino, zanahoria y aguacate (1/4 pza), con 3 tostadas horneadas.',
    porcion: '1 plato fuerte',
    categoria: 'comida',
    ingredientes: ['140g medallón de atún fresco', '1 cdta ajonjolí', '1/4 aguacate', 'Pepino y zanahoria rallada', '3 tostadas horneadas'],
    macros: {
      calories: 430,
      protein: 44,
      carbs: 32,
      fat: 13
    }
  },

  // ==========================================
  // CENAS
  // ==========================================
  {
    id: 'dish-cen-1',
    nombre: 'Tacos de Lechuga con Pollo Deshebrado y Aguacate',
    descripcion: '3 hojas grandes de lechuga orejona rellenas con 110g de pechuga de pollo deshebrada, pico de gallo, salsa casera y 1/3 de aguacate.',
    porcion: '3 tacos',
    categoria: 'cena',
    ingredientes: ['3 hojas grandes lechuga orejona', '110g pechuga de pollo cocida', 'Pico de gallo', '1/3 aguacate hass', 'Salsa taquera'],
    macros: {
      calories: 310,
      protein: 34,
      carbs: 12,
      fat: 14
    }
  },
  {
    id: 'dish-cen-2',
    nombre: 'Quesadillas en Comal de Queso Panela y Nopales Asados',
    descripcion: '2 tortillas de maíz con 60g de queso panela fresco derretido en comal con nopales asados y salsa verde al gusto.',
    porcion: '2 quesadillas',
    categoria: 'cena',
    ingredientes: ['2 tortillas de maíz', '60g queso panela oaxaca light', '2 nopales asados enteros', 'Salsa casera al gusto'],
    macros: {
      calories: 320,
      protein: 22,
      carbs: 32,
      fat: 11
    }
  },
  {
    id: 'dish-cen-3',
    nombre: 'Ensalada Ligera con Atún en Agua y Tostadas Horneadas',
    descripcion: '1 lata de atún en agua (120g drenado) mezclada con apio picado, jitomate, lechuga romana, 1 cucharadita de mayonesa de aguacate o aceite de oliva y 2 tostadas.',
    porcion: '1 ensalada completa',
    categoria: 'cena',
    ingredientes: ['1 lata atún en agua (120g)', 'Apio y jitomate picado', '2 tazas lechuga mixta', '1 cdta aceite de oliva', '2 tostadas horneadas'],
    macros: {
      calories: 290,
      protein: 32,
      carbs: 22,
      fat: 7
    }
  },
  {
    id: 'dish-cen-4',
    nombre: 'Bowl de Claras Revueltas con Calabacitas y Tortilla',
    descripcion: '4 claras de huevo revueltas con calabacita picada en cubos y cebolla, acompañado de 1 tortilla de maíz caliente y frijoles de la olla.',
    porcion: '1 bowl',
    categoria: 'cena',
    ingredientes: ['4 claras de huevo', '1 calabacita mediana', '1/3 taza frijoles de la olla', '1 tortilla de maíz'],
    macros: {
      calories: 260,
      protein: 24,
      carbs: 28,
      fat: 4
    }
  },

  // ==========================================
  // COLACIONES / SNACKS
  // ==========================================
  {
    id: 'dish-col-1',
    nombre: 'Yogur Griego con Almendras Fileteadas y Canela',
    descripcion: '150g de yogur griego sin azúcar ni grasa (Fage / Chobani zero) con 12 almendras fileteadas y canela en polvo.',
    porcion: '1 taza',
    categoria: 'colacion_1',
    ingredientes: ['150g yogur griego sin azúcar', '12 almendras (15g)', 'Canela en polvo'],
    macros: {
      calories: 190,
      protein: 18,
      carbs: 9,
      fat: 9
    }
  },
  {
    id: 'dish-col-2',
    nombre: 'Manzana en Rebanadas con Crema de Cacahuate Natural',
    descripcion: '1 manzana mediana en rebanadas con 1 cucharada sopera (15g) de crema de cacahuate 100% natural sin azúcar añadido.',
    porcion: '1 porción',
    categoria: 'colacion_2',
    ingredientes: ['1 manzana mediana (gala/verde)', '1 cda crema de cacahuate natural (15g)'],
    macros: {
      calories: 180,
      protein: 5,
      carbs: 26,
      fat: 8
    }
  },
  {
    id: 'dish-col-3',
    nombre: 'Jícama y Pepino con Limón y Chile Piquín',
    descripcion: '1 taza de jícama y 1 taza de pepino con cáscara en bastones con jugo de limón y chile en polvo sin sodio tipo Tajín bajo en sal.',
    porcion: '2 tazas',
    categoria: 'colacion_1',
    ingredientes: ['1 taza jícama en bastones', '1 taza pepino rebanado', 'Jugo de 1 limón', 'Chile piquín sin sodio'],
    macros: {
      calories: 75,
      protein: 2,
      carbs: 18,
      fat: 0
    }
  },
  {
    id: 'dish-col-4',
    nombre: 'Licuado Proteico de Fresas con Leche de Almendras',
    descripcion: '1 taza de leche de almendras sin azúcar, 1 scoop de proteína aislada de suero y 1 taza de fresas congeladas licuadas con hielo.',
    porcion: '1 vaso grande (400ml)',
    categoria: 'colacion_2',
    ingredientes: ['1 taza leche de almendras sin azúcar', '1 scoop proteína (25g)', '1 taza fresas congeladas', 'Hielo al gusto'],
    macros: {
      calories: 200,
      protein: 26,
      carbs: 16,
      fat: 3
    }
  },
  {
    id: 'dish-col-5',
    nombre: 'Rollitos de Jamón de Pavo con Queso Panela',
    descripcion: '3 rebanadas de jamón de pechuga de pavo bajo en sodio rellenas de tiras de queso panela fresco (40g) y germinado de alfalfa.',
    porcion: '3 rollitos',
    categoria: 'snack',
    ingredientes: ['3 rebanadas jamón de pavo bajo en sodio', '40g queso panela fresco', 'Germen de alfalfa'],
    macros: {
      calories: 160,
      protein: 20,
      carbs: 4,
      fat: 7
    }
  }
];
