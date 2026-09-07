import type { EquivalenceGroup } from '../../types/equivalences';

/**
 * Catálogo Oficial del Sistema Mexicano de Alimentos Equivalentes (SMAE)
 * Adaptado para Nutrición Clínica Lic. Talia Tinoco y el módulo de Tracking BodyFlow.
 * 
 * Incluye los 8 grupos oficiales con macros promedio por equivalente,
 * porciones estandarizadas, gramajes aproximados y doble tema de color:
 * 1) Tema clínico oficial (verde salvia / corporativo) para la Hoja de la Nutrióloga.
 * 2) Tema Tracking App (neón / dark glass / modern) para la app del paciente.
 */
export const SMAE_EQUIVALENCE_GROUPS: EquivalenceGroup[] = [
  // ========================================================
  // 1. VERDURAS
  // ========================================================
  {
    key: 'verduras',
    nombre: 'Verduras y Hortalizas',
    descripcionCorta: 'Fibra dietética, agua biológica, antioxidantes y micronutrientes.',
    icon: '🥦',
    colorTheme: {
      badgeBg: '#eef6ea',
      badgeText: '#3b5e28',
      badgeBorder: '#c4ddb6',
      headerBg: '#f2f8ed',
      headerText: '#2e4c1f',
      dotColor: '#4f8a32',
      trackingBg: 'rgba(74, 222, 128, 0.12)',
      trackingBorder: 'rgba(74, 222, 128, 0.3)',
      trackingText: '#4ade80',
      trackingGlow: 'rgba(74, 222, 128, 0.4)'
    },
    macrosPromedio: {
      calories: 25,
      protein: 2,
      carbs: 4,
      fat: 0
    },
    reglaIntercambio: '1 equivalente = 1 taza de verdura cruda o 1/2 taza de verdura cocida/al vapor.',
    alimentos: [
      { id: 'v-espinaca-cruda', nombre: 'Espinacas frescas crudas', porcion: '2 tazas', gramosAprox: 60, medidaCasera: '2 tazas crudas', nota: 'Rica en hierro y ácido fólico' },
      { id: 'v-espinaca-cocida', nombre: 'Espinacas cocidas', porcion: '1/2 taza', gramosAprox: 90, medidaCasera: '1/2 taza', nota: 'Medir ya escurrida' },
      { id: 'v-nopales-cocidos', nombre: 'Nopales picados cocidos', porcion: '1 taza', gramosAprox: 150, medidaCasera: '1 taza', nota: 'Excelente aporte de fibra soluble' },
      { id: 'v-nopales-asados', nombre: 'Nopal entero asado', porcion: '2 piezas medianas', gramosAprox: 140, medidaCasera: '2 piezas', nota: 'A la plancha sin grasa' },
      { id: 'v-pepino', nombre: 'Pepino en rodajas con cáscara', porcion: '1 taza', gramosAprox: 130, medidaCasera: '1 taza rebanada', nota: 'Consumir con cáscara para fibra' },
      { id: 'v-jitomate', nombre: 'Jitomate / Tomate bola o saladette', porcion: '1 pieza mediana', gramosAprox: 120, medidaCasera: '1 pieza', nota: 'Rico en licopeno' },
      { id: 'v-jitomate-cherry', nombre: 'Jitomates cherry', porcion: '4 a 5 piezas', gramosAprox: 90, medidaCasera: '4-5 piezas', nota: 'Ideal para snacks frescos' },
      { id: 'v-calabacita', nombre: 'Calabacita italiana cocida', porcion: '1/2 taza en cubos', gramosAprox: 110, medidaCasera: '1/2 taza o 1 pieza chica', nota: 'Al vapor o asada' },
      { id: 'v-brocoli', nombre: 'Brócoli al vapor', porcion: '1 taza floretes', gramosAprox: 150, medidaCasera: '1 taza', nota: 'Crucífera rica en sulforafano' },
      { id: 'v-coliflor', nombre: 'Coliflor al vapor o rallada', porcion: '1 taza', gramosAprox: 140, medidaCasera: '1 taza', nota: 'Excelente como arroz de coliflor' },
      { id: 'v-champiñon', nombre: 'Champiñones rebanados cocidos', porcion: '1/2 taza', gramosAprox: 80, medidaCasera: '1/2 taza (o 1 taza crudos)', nota: 'Bajo en calorías' },
      { id: 'v-lechuga', nombre: 'Lechuga orejona / romana / italiana', porcion: '3 tazas troceadas', gramosAprox: 90, medidaCasera: '3 tazas crudas', nota: 'Base saciante voluminosa' },
      { id: 'v-chayote', nombre: 'Chayote cocido en cubos', porcion: '1/2 taza', gramosAprox: 100, medidaCasera: '1/2 taza', nota: 'Suave digestión' },
      { id: 'v-zanahoria', nombre: 'Zanahoria rallada cruda', porcion: '1/2 taza', gramosAprox: 60, medidaCasera: '1/2 taza rallada', nota: 'Betacarotenos' },
      { id: 'v-apio', nombre: 'Apio en bastones', porcion: '1 taza y media', gramosAprox: 150, medidaCasera: '1.5 tazas', nota: 'Diurético e hidratante' },
      { id: 'v-pimiento', nombre: 'Pimiento morrón picado', porcion: '1 taza', gramosAprox: 120, medidaCasera: '1 taza', nota: 'Alto en vitamina C' },
      { id: 'v-pico-gallo', nombre: 'Pico de gallo fresco sin aceite', porcion: '1/2 taza', gramosAprox: 90, medidaCasera: '1/2 taza', nota: 'Jitomate, cebolla, cilantro y chile' }
    ]
  },

  // ========================================================
  // 2. FRUTAS
  // ========================================================
  {
    key: 'frutas',
    nombre: 'Frutas Frescas',
    descripcionCorta: 'Fructosa natural, vitaminas hidrosolubles y agua biológica.',
    icon: '🍎',
    colorTheme: {
      badgeBg: '#fef3eb',
      badgeText: '#8a4216',
      badgeBorder: '#f8cfb5',
      headerBg: '#fff7f2',
      headerText: '#6e310e',
      dotColor: '#ea580c',
      trackingBg: 'rgba(251, 146, 60, 0.12)',
      trackingBorder: 'rgba(251, 146, 60, 0.3)',
      trackingText: '#fb923c',
      trackingGlow: 'rgba(251, 146, 60, 0.4)'
    },
    macrosPromedio: {
      calories: 60,
      protein: 0,
      carbs: 15,
      fat: 0
    },
    reglaIntercambio: '1 equivalente = 1 pieza mediana o 1 taza de fruta picada (excepto frutas densas como plátano o uvas).',
    alimentos: [
      { id: 'f-manzana', nombre: 'Manzana verde o roja', porcion: '1 pieza chica / mediana', gramosAprox: 130, medidaCasera: '1 pieza', nota: 'Con cáscara para fibra' },
      { id: 'f-platano', nombre: 'Plátano / Banano', porcion: '1/2 pieza', gramosAprox: 60, medidaCasera: '1/2 pieza mediana', nota: 'Fruta densa en energía y potasio' },
      { id: 'f-fresas', nombre: 'Fresas frescas enteras', porcion: '1 taza colmada', gramosAprox: 160, medidaCasera: '1 taza (aprox. 8 piezas)', nota: 'Bajo índice glucémico' },
      { id: 'f-frutos-rojos', nombre: 'Frutos rojos mixtos (zarzamora, arándano, frambuesa)', porcion: '3/4 taza', gramosAprox: 110, medidaCasera: '3/4 taza', nota: 'Altos en polifenoles' },
      { id: 'f-papaya', nombre: 'Papaya picada en cubos', porcion: '1 taza', gramosAprox: 140, medidaCasera: '1 taza', nota: 'Enzima papaína digestiva' },
      { id: 'f-pina', nombre: 'Piña picada en cubos', porcion: '3/4 taza', gramosAprox: 120, medidaCasera: '3/4 taza', nota: 'Enzima bromelina' },
      { id: 'f-sandia', nombre: 'Sandía picada en cubos', porcion: '1 taza y 1/4', gramosAprox: 180, medidaCasera: '1.25 tazas', nota: 'Muy hidratante' },
      { id: 'f-melon', nombre: 'Melón cantaloupe o verde picado', porcion: '1 taza', gramosAprox: 150, medidaCasera: '1 taza', nota: 'Refrescante y saciante' },
      { id: 'f-naranja', nombre: 'Naranja en gajos', porcion: '1 pieza mediana', gramosAprox: 150, medidaCasera: '1 pieza (no en jugo)', nota: 'Consumir la fruta entera con gabazo' },
      { id: 'f-toronja', nombre: 'Toronja', porcion: '1/2 pieza grande', gramosAprox: 140, medidaCasera: '1/2 pieza', nota: 'Excelente perfil cítrico' },
      { id: 'f-guayaba', nombre: 'Guayabas', porcion: '2 piezas medianas', gramosAprox: 100, medidaCasera: '2 piezas', nota: 'Riquísima en vitamina C' },
      { id: 'f-uvas', nombre: 'Uvas verdes o rojas', porcion: '10 a 12 piezas', gramosAprox: 90, medidaCasera: '10-12 uvas', nota: 'Medir en piezas' },
      { id: 'f-durazno', nombre: 'Durazno amarillo', porcion: '2 piezas chicas', gramosAprox: 130, medidaCasera: '2 piezas chicas', nota: 'Natural sin almíbar' }
    ]
  },

  // ========================================================
  // 3. CEREALES Y TUBÉRCULOS (SIN GRASA Y CON GRASA)
  // ========================================================
  {
    key: 'cereales',
    nombre: 'Cereales y Tubérculos',
    descripcionCorta: 'Carbohidratos complejos de energía sostenida y almidones.',
    icon: '🌽',
    colorTheme: {
      badgeBg: '#fef8e7',
      badgeText: '#855b0a',
      badgeBorder: '#fae6b2',
      headerBg: '#fffdf5',
      headerText: '#684505',
      dotColor: '#d97706',
      trackingBg: 'rgba(250, 204, 21, 0.12)',
      trackingBorder: 'rgba(250, 204, 21, 0.3)',
      trackingText: '#facc15',
      trackingGlow: 'rgba(250, 204, 21, 0.4)'
    },
    macrosPromedio: {
      calories: 70,
      protein: 2,
      carbs: 15,
      fat: 0
    },
    reglaIntercambio: '1 equivalente = 1 tortilla de maíz = 1/3 taza de arroz cocido = 1/2 taza de avena cocida.',
    alimentos: [
      { id: 'c-tortilla-maiz', nombre: 'Tortilla de maíz nixtamalizada', porcion: '1 pieza', gramosAprox: 30, medidaCasera: '1 pieza', nota: 'Base tradicional rica en calcio', subcategoria: 'Sin grasa' },
      { id: 'c-tortilla-nopal', nombre: 'Tortilla de nopal comercial', porcion: '2 piezas', gramosAprox: 50, medidaCasera: '2 piezas', nota: 'Mayor volumen y fibra', subcategoria: 'Sin grasa' },
      { id: 'c-tostada-horneada', nombre: 'Tostada de maíz horneada (Saníssimo)', porcion: '2 piezas', gramosAprox: 22, medidaCasera: '2 piezas horneadas', nota: 'Crujiente sin aceite', subcategoria: 'Sin grasa' },
      { id: 'c-avena-hojuelas', nombre: 'Avena natural en hojuelas (en seco)', porcion: '1/3 taza (30g)', gramosAprox: 30, medidaCasera: '1/3 taza en seco', nota: 'Betaglucanos para colesterol', subcategoria: 'Sin grasa' },
      { id: 'c-arroz-cocido', nombre: 'Arroz blanco o integral cocido', porcion: '1/3 taza', gramosAprox: 60, medidaCasera: '1/3 taza cocido', nota: 'Medir ya cocido al vapor', subcategoria: 'Sin grasa' },
      { id: 'c-quinoa-cocida', nombre: 'Quinoa cocida', porcion: '1/3 taza', gramosAprox: 60, medidaCasera: '1/3 taza cocida', nota: 'Pseudocereal con aminoácidos', subcategoria: 'Sin grasa' },
      { id: 'c-pan-integral', nombre: 'Pan de caja 100% integral', porcion: '1 rebanada', gramosAprox: 28, medidaCasera: '1 rebanada', nota: 'Buscar harina integral de grano entero', subcategoria: 'Sin grasa' },
      { id: 'c-pasta-cocida', nombre: 'Pasta de trigo o integral cocida', porcion: '1/3 taza', gramosAprox: 55, medidaCasera: '1/3 taza cocida', nota: 'Al dente para menor impacto glucémico', subcategoria: 'Sin grasa' },
      { id: 'c-papa-cocida', nombre: 'Papa cocida o al horno con piel', porcion: '1/2 pieza mediana', gramosAprox: 80, medidaCasera: '1/2 pieza', nota: 'Tubérculo saciante', subcategoria: 'Sin grasa' },
      { id: 'c-camote-cocido', nombre: 'Camote al vapor o asado', porcion: '1/3 taza en cubos', gramosAprox: 70, medidaCasera: '1/3 taza', nota: 'Carbohidrato complejo dulce', subcategoria: 'Sin grasa' },
      { id: 'c-elote-desgranado', nombre: 'Elote blanco cocido desgranado', porcion: '1/2 taza', gramosAprox: 80, medidaCasera: '1/2 taza', nota: 'Grano entero natural', subcategoria: 'Sin grasa' },
      { id: 'c-galletas-habaneras', nombre: 'Galletas habaneras / salvado integrales', porcion: '4 piezas', gramosAprox: 28, medidaCasera: '4 piezas', nota: 'Snack práctico', subcategoria: 'Sin grasa' },
      { id: 'c-palomitas-naturales', nombre: 'Palomitas de maíz naturales sin grasa', porcion: '2 tazas y media', gramosAprox: 25, medidaCasera: '2.5 tazas infladas', nota: 'Excelente volumen y saciedad', subcategoria: 'Sin grasa' }
    ]
  },

  // ========================================================
  // 4. LEGUMINOSAS
  // ========================================================
  {
    key: 'leguminosas',
    nombre: 'Leguminosas',
    descripcionCorta: 'Proteína vegetal, fibra prebiótica soluble y hierro no hemo.',
    icon: '🫘',
    colorTheme: {
      badgeBg: '#f6f0ea',
      badgeText: '#6e4526',
      badgeBorder: '#decaba',
      headerBg: '#fbf8f5',
      headerText: '#543219',
      dotColor: '#92400e',
      trackingBg: 'rgba(180, 83, 9, 0.12)',
      trackingBorder: 'rgba(180, 83, 9, 0.3)',
      trackingText: '#f59e0b',
      trackingGlow: 'rgba(180, 83, 9, 0.4)'
    },
    macrosPromedio: {
      calories: 120,
      protein: 8,
      carbs: 20,
      fat: 1
    },
    reglaIntercambio: '1 equivalente = 1/2 taza de leguminosas cocidas de la olla con su caldo.',
    alimentos: [
      { id: 'l-frijol-olla', nombre: 'Frijoles de la olla cocidos (negros/bayos)', porcion: '1/2 taza', gramosAprox: 100, medidaCasera: '1/2 taza con poco caldo', nota: 'Sin manteca ni tocino' },
      { id: 'l-lentejas-olla', nombre: 'Lentejas cocidas de la olla', porcion: '1/2 taza', gramosAprox: 100, medidaCasera: '1/2 taza cocida', nota: 'Consumir con limón para absorber el hierro' },
      { id: 'l-garbanzos-cocidos', nombre: 'Garbanzos cocidos', porcion: '1/2 taza', gramosAprox: 90, medidaCasera: '1/2 taza', nota: 'Ricos en magnesio y saciedad' },
      { id: 'l-frijoles-refritos', nombre: 'Frijoles molidos refritos con poco aceite', porcion: '1/3 taza', gramosAprox: 75, medidaCasera: '1/3 taza espesa', nota: 'Preparación casera ligera' },
      { id: 'l-habas-cocidas', nombre: 'Habas cocidas', porcion: '1/2 taza', gramosAprox: 95, medidaCasera: '1/2 taza', nota: 'Sabor tradicional' },
      { id: 'l-soya-texturizada', nombre: 'Soya texturizada hidratada', porcion: '1/3 taza', gramosAprox: 60, medidaCasera: '1/3 taza hidratada', nota: 'Alta densidad proteica vegetal' }
    ]
  },

  // ========================================================
  // 5. ALIMENTOS DE ORIGEN ANIMAL (PROTEÍNAS)
  // ========================================================
  {
    key: 'aoa',
    nombre: 'Proteínas & Origen Animal (AOA)',
    descripcionCorta: 'Proteínas de alto valor biológico para músculo y regeneración celular.',
    icon: '🥩',
    colorTheme: {
      badgeBg: '#fef0f0',
      badgeText: '#991b1b',
      badgeBorder: '#fecaca',
      headerBg: '#fff7f7',
      headerText: '#7f1d1d',
      dotColor: '#dc2626',
      trackingBg: 'rgba(248, 113, 113, 0.12)',
      trackingBorder: 'rgba(248, 113, 113, 0.3)',
      trackingText: '#f87171',
      trackingGlow: 'rgba(248, 113, 113, 0.4)'
    },
    macrosPromedio: {
      calories: 55,
      protein: 7,
      carbs: 0,
      fat: 2
    },
    reglaIntercambio: '1 equivalente = 30-40g de carne/pescado cocido = 2 claras = 1/3 lata de atún = 40g queso panela.',
    alimentos: [
      { id: 'a-pechuga-pollo', nombre: 'Pechuga de pollo a la plancha / deshebrada', porcion: '30g a 40g', gramosAprox: 35, medidaCasera: '35g cocido (palma de la mano = 90-100g = 3 eq)', nota: 'Muy bajo aporte de grasa', subcategoria: 'Muy bajo en grasa' },
      { id: 'a-atun-agua', nombre: 'Atún en agua drenado', porcion: '1/3 de lata (35g drenado)', gramosAprox: 35, medidaCasera: '1/3 lata drenada', nota: '1 lata completa = 3 equivalentes de proteína', subcategoria: 'Muy bajo en grasa' },
      { id: 'a-claras-huevo', nombre: 'Claras de huevo', porcion: '2 piezas', gramosAprox: 66, medidaCasera: '2 claras', nota: 'Proteína pura sin colesterol ni grasa', subcategoria: 'Muy bajo en grasa' },
      { id: 'a-pescado-blanco', nombre: 'Filete de pescado blanco (tilapia, róbalo, merluza)', porcion: '40g cocido', gramosAprox: 40, medidaCasera: '40g a la plancha', nota: 'Fácil digestión', subcategoria: 'Muy bajo en grasa' },
      { id: 'a-camaron-cocido', nombre: 'Camarones cocidos', porcion: '5 piezas medianas', gramosAprox: 40, medidaCasera: '5 piezas', nota: 'Bajo en grasa', subcategoria: 'Muy bajo en grasa' },
      { id: 'a-bistec-res', nombre: 'Bistec de res magro (falda, bola, cuete)', porcion: '30g cocido', gramosAprox: 30, medidaCasera: '30g cocido', nota: 'Rico en hierro hemo y zinc', subcategoria: 'Bajo en grasa' },
      { id: 'a-queso-panela', nombre: 'Queso panela fresco', porcion: '40g', gramosAprox: 40, medidaCasera: '1 rebanada gruesa (40g)', nota: 'Queso fresco bajo en sodio y grasa', subcategoria: 'Bajo en grasa' },
      { id: 'a-queso-cottage', nombre: 'Queso cottage bajo en grasa (light)', porcion: '3 cucharadas soperas', gramosAprox: 45, medidaCasera: '3 cucharadas (1/4 taza)', nota: 'Rico en caseína', subcategoria: 'Bajo en grasa' },
      { id: 'a-requeson', nombre: 'Requesón natural', porcion: '3 cucharadas soperas', gramosAprox: 45, medidaCasera: '3 cucharadas', nota: 'Bajo en sodio', subcategoria: 'Bajo en grasa' },
      { id: 'a-jamon-pavo', nombre: 'Jamón de pechuga de pavo bajo en sodio', porcion: '2 rebanadas delgadas', gramosAprox: 40, medidaCasera: '2 rebanadas', nota: 'Buscar >85% carne de pavo', subcategoria: 'Bajo en grasa' },
      { id: 'a-huevo-entero', nombre: 'Huevo entero', porcion: '1 pieza', gramosAprox: 50, medidaCasera: '1 pieza', nota: 'Contiene colina, lecitina y 5g grasa', subcategoria: 'Moderado en grasa' },
      { id: 'a-salmon-fresco', nombre: 'Salmón fresco a la plancha', porcion: '30g cocido', gramosAprox: 30, medidaCasera: '30g cocido', nota: 'Rico en ácidos grasos Omega-3', subcategoria: 'Moderado en grasa' },
      { id: 'a-queso-oaxaca', nombre: 'Queso Oaxaca / hebra light', porcion: '30g', gramosAprox: 30, medidaCasera: '30g deshebrado', nota: 'Controlar sodio', subcategoria: 'Moderado en grasa' },
      { id: 'a-whey-protein', nombre: 'Proteína Whey Isolate en polvo', porcion: '1/3 scoop (10g)', gramosAprox: 10, medidaCasera: '1/3 scoop (1 scoop completo = 3 eq = 25g prot)', nota: 'Rápida asimilación', subcategoria: 'Muy bajo en grasa' }
    ]
  },

  // ========================================================
  // 6. LECHE Y LÁCTEOS
  // ========================================================
  {
    key: 'lacteos',
    nombre: 'Leche y Lácteos',
    descripcionCorta: 'Aporte dual de carbohidratos, calcio asimilable y caseína.',
    icon: '🥛',
    colorTheme: {
      badgeBg: '#f0f5ff',
      badgeText: '#1e40af',
      badgeBorder: '#bfdbfe',
      headerBg: '#f8faff',
      headerText: '#1e3a8a',
      dotColor: '#2563eb',
      trackingBg: 'rgba(96, 165, 250, 0.12)',
      trackingBorder: 'rgba(96, 165, 250, 0.3)',
      trackingText: '#60a5fa',
      trackingGlow: 'rgba(96, 165, 250, 0.4)'
    },
    macrosPromedio: {
      calories: 95,
      protein: 9,
      carbs: 12,
      fat: 2
    },
    reglaIntercambio: '1 equivalente = 1 taza (240ml) de leche descremada = 3/4 taza de yogurt griego natural 0%.',
    alimentos: [
      { id: 'k-leche-descremada', nombre: 'Leche descremada / deslactosada light', porcion: '1 taza (240 ml)', gramosAprox: 240, medidaCasera: '1 vaso estándar', nota: 'Sin grasa saturada' },
      { id: 'k-yogurt-griego', nombre: 'Yogurt griego natural 0% sin azúcar (Chobani / Fage / Yoplait Griego)', porcion: '3/4 taza', gramosAprox: 150, medidaCasera: '3/4 taza (150g)', nota: 'Doble de proteína que el yogurt tradicional' },
      { id: 'k-leche-soya', nombre: 'Bebida de soya natural sin azúcar', porcion: '1 taza (240 ml)', gramosAprox: 240, medidaCasera: '1 vaso', nota: 'Opción vegetal con buen perfil proteico' },
      { id: 'k-leche-almendras', nombre: 'Bebida de almendras sin azúcar (Silk/Nature\'s Heart)', porcion: '1 taza y media (360 ml)', gramosAprox: 360, medidaCasera: '1.5 vasos', nota: 'Muy ligera en calorías (~35 kcal por taza)' },
      { id: 'k-kefir', nombre: 'Kéfir natural bajo en grasa', porcion: '1 taza (240 ml)', gramosAprox: 240, medidaCasera: '1 taza', nota: 'Excelente probiótico para microbiota' }
    ]
  },

  // ========================================================
  // 7. ACEITES Y GRASAS (CON Y SIN PROTEÍNA)
  // ========================================================
  {
    key: 'grasas',
    nombre: 'Aceites & Grasas Saludables',
    descripcionCorta: 'Ácidos grasos esenciales, absorción de vitaminas A, D, E, K y saciedad.',
    icon: '🥑',
    colorTheme: {
      badgeBg: '#f4f8ed',
      badgeText: '#446622',
      badgeBorder: '#cce2b4',
      headerBg: '#f8faf3',
      headerText: '#324c18',
      dotColor: '#65a30d',
      trackingBg: 'rgba(163, 230, 53, 0.12)',
      trackingBorder: 'rgba(163, 230, 53, 0.3)',
      trackingText: '#a3e635',
      trackingGlow: 'rgba(163, 230, 53, 0.4)'
    },
    macrosPromedio: {
      calories: 50,
      protein: 0,
      carbs: 0,
      fat: 5
    },
    reglaIntercambio: '1 equivalente = 1/3 pieza de aguacate = 1 cdita de aceite de oliva = 10 almendras = 1 cda de chía.',
    alimentos: [
      { id: 'g-aguacate-hass', nombre: 'Aguacate Hass', porcion: '1/3 pieza', gramosAprox: 35, medidaCasera: '1/3 de pieza mediana', nota: 'Grasas monoinsaturadas cardiosaludables', subcategoria: 'Sin proteína' },
      { id: 'g-aceite-oliva', nombre: 'Aceite de oliva extra virgen', porcion: '1 cucharadita (5 ml)', gramosAprox: 5, medidaCasera: '1 cdita cafetera', nota: 'Consumir preferentemente en crudo', subcategoria: 'Sin proteína' },
      { id: 'g-aceite-aguacate', nombre: 'Aceite de aguacate', porcion: '1 cucharadita (5 ml)', gramosAprox: 5, medidaCasera: '1 cdita', nota: 'Alto punto de humo para cocción', subcategoria: 'Sin proteína' },
      { id: 'g-almendras', nombre: 'Almendras naturales enteras', porcion: '10 piezas', gramosAprox: 12, medidaCasera: '10 piezas', nota: 'Ricas en vitamina E y magnesio', subcategoria: 'Con proteína' },
      { id: 'g-nueces', nombre: 'Nueces en mitades', porcion: '3 mitades', gramosAprox: 10, medidaCasera: '3 mitades', nota: 'Omega-3 ALA vegetal', subcategoria: 'Con proteína' },
      { id: 'g-crema-cacahuate', nombre: 'Crema de cacahuate o almendra sin azúcar', porcion: '1 cucharada sopera rasa', gramosAprox: 15, medidaCasera: '1 cucharada rasa', nota: 'Ingrediente único: 100% cacahuates', subcategoria: 'Con proteína' },
      { id: 'g-semillas-chia', nombre: 'Semillas de chía', porcion: '1 cucharada sopera', gramosAprox: 12, medidaCasera: '1 cucharada', nota: 'Fibra soluble y mucílago saciante', subcategoria: 'Con proteína' },
      { id: 'g-semillas-girasol', nombre: 'Semillas de girasol / calabaza peladas', porcion: '1 cucharada sopera', gramosAprox: 12, medidaCasera: '1 cucharada', nota: 'Zinc y grasas poliinsaturadas', subcategoria: 'Con proteína' },
      { id: 'g-aceitunas', nombre: 'Aceitunas verdes o negras', porcion: '6 piezas', gramosAprox: 30, medidaCasera: '6 piezas', nota: 'Sodio moderado', subcategoria: 'Sin proteína' }
    ]
  },

  // ========================================================
  // 8. LIBRES DE ENERGÍA Y CONDIMENTOS
  // ========================================================
  {
    key: 'azucares_libres',
    nombre: 'Libres de Energía & Condimentos',
    descripcionCorta: 'Consumo libre para hidratación, sazón y variedad sin sumar calorías.',
    icon: '🌿',
    colorTheme: {
      badgeBg: '#f3f4f6',
      badgeText: '#374151',
      badgeBorder: '#d1d5db',
      headerBg: '#f9fafb',
      headerText: '#1f2937',
      dotColor: '#4b5563',
      trackingBg: 'rgba(156, 163, 175, 0.12)',
      trackingBorder: 'rgba(156, 163, 175, 0.3)',
      trackingText: '#9ca3af',
      trackingGlow: 'rgba(156, 163, 175, 0.4)'
    },
    macrosPromedio: {
      calories: 0,
      protein: 0,
      carbs: 0,
      fat: 0
    },
    reglaIntercambio: 'Consumo libre moderado sin aporte calórico significativo.',
    alimentos: [
      { id: 'e-agua-natural', nombre: 'Agua natural purificada', porcion: 'Libre', medidaCasera: 'Mínimo 2 a 2.5 litros al día', nota: 'Base indispensable de hidratación' },
      { id: 'e-agua-jamaica', nombre: 'Infusión de flor de jamaica o limón sin azúcar', porcion: 'Libre', medidaCasera: 'A voluntad', nota: 'Endulzar opcionalmente con estevia/monk fruit' },
      { id: 'e-cafe-negro', nombre: 'Café negro americano o espresso', porcion: '1 a 3 tazas al día', medidaCasera: 'Sin azúcar añadida ni crema', nota: 'Antioxidantes y alerta' },
      { id: 'e-te-verde', nombre: 'Té verde, manzanilla, menta o frutos secos', porcion: 'Libre', medidaCasera: 'Tazas al gusto', nota: 'Favorece digestión' },
      { id: 'e-limon', nombre: 'Jugo de limón fresco', porcion: 'Al gusto', medidaCasera: 'Jugo de 2 a 3 limones', nota: 'Excelente para sazonar ensaladas' },
      { id: 'e-especias', nombre: 'Especias secas (orégano, pimienta, ajo en polvo, comino, paprika)', porcion: 'Al gusto', medidaCasera: 'Pizcas libres', nota: 'Realzan el sabor sin añadir calorías' },
      { id: 'e-mostaza', nombre: 'Mostaza clásica amarilla o dijon', porcion: '1 cucharada', medidaCasera: '1 cucharada', nota: 'Cero azúcar añadida' },
      { id: 'e-vinagre', nombre: 'Vinagre blanco o de manzana', porcion: 'Al gusto', medidaCasera: '1 a 2 cucharadas', nota: 'Mejora sensibilidad a la insulina' },
      { id: 'e-gelatina-light', nombre: 'Gelatina comercial light 0% azúcar', porcion: '1 taza', medidaCasera: '1 taza preparada', nota: 'Aliada para controlar ansiedad' }
    ]
  }
];

/**
 * Busca alimentos en todo el catálogo de equivalencias por nombre o ingrediente.
 */
export function searchEquivalences(query: string): Array<{ group: EquivalenceGroup; food: any }> {
  if (!query || !query.trim()) return [];
  const q = query.toLowerCase().trim();
  const results: Array<{ group: EquivalenceGroup; food: any }> = [];

  SMAE_EQUIVALENCE_GROUPS.forEach(group => {
    group.alimentos.forEach(food => {
      const matchName = food.nombre.toLowerCase().includes(q);
      const matchNote = food.nota ? food.nota.toLowerCase().includes(q) : false;
      const matchSub = food.subcategoria ? food.subcategoria.toLowerCase().includes(q) : false;
      const matchGroup = group.nombre.toLowerCase().includes(q);

      if (matchName || matchNote || matchSub || matchGroup) {
        results.push({ group, food });
      }
    });
  });

  return results;
}

/**
 * Encuentra el grupo SMAE al que pertenece un alimento dado.
 */
export function findGroupByFoodName(foodName: string): EquivalenceGroup | undefined {
  if (!foodName) return undefined;
  const q = foodName.toLowerCase().trim();
  return SMAE_EQUIVALENCE_GROUPS.find(group =>
    group.alimentos.some(f => f.nombre.toLowerCase().includes(q) || q.includes(f.nombre.toLowerCase()))
  );
}
