import type { RecommendationObjective, PatientOption } from '../../types/recommendations';

export const RECOMMENDATION_OBJECTIVES: RecommendationObjective[] = [
  {
    id: 'general',
    name: 'Hábitos Sostenibles & Bienestar (General)',
    badgeLabel: 'Hábitos Sostenibles & Bienestar',
    bannerSubtitle: 'Lineamientos para Continuar con Buenos Hábitos',
    summaryText: 'Recomendaciones para continuar con buenos hábitos y construir resultados duraderos.',
    summaryTag: 'Nutrición Clínica Personalizada',
    cards: [
      {
        id: 'c1',
        num: 1,
        title: 'Horarios y Hábitos en la Mesa',
        icon: 'fa-regular fa-clock',
        highlight: true,
        items: [
          {
            title: 'Mantener horarios regulares de alimentación:',
            description: 'Procurar conservar los 5 tiempos de comida establecidos, evitando saltarse comidas de manera habitual y llegando a las comidas principales con hambre excesiva.'
          },
          {
            title: 'Comer despacio y con atención:',
            description: 'Procurar comer sentado, sin hacerlo apresuradamente, masticar adecuadamente y reconocer las señales de hambre y saciedad.'
          }
        ]
      },
      {
        id: 'c2',
        num: 2,
        title: 'Calidad y Variedad Nutricional',
        icon: 'fa-solid fa-basket-shopping',
        highlight: false,
        items: [
          {
            title: 'Priorizar alimentos frescos y poco procesados:',
            description: 'Dar preferencia a verduras, frutas, leguminosas, cereales integrales, carnes magras, pescado, huevo y lácteos bajos en grasa.'
          },
          {
            title: 'Variar los alimentos durante la semana:',
            description: 'No es necesario comer los mismos alimentos diariamente. Se pueden intercambiar pollo por pescado, atún, huevo, res magra o cerdo magro, y alternar arroz, tortilla, papa, avena y leguminosas como fuentes de carbohidratos.'
          }
        ]
      },
      {
        id: 'c3',
        num: 3,
        title: 'Verduras y Sabor Natural',
        icon: 'fa-solid fa-leaf',
        highlight: false,
        items: [
          {
            title: 'Consumir verduras diariamente:',
            description: 'Procurar incluir verduras en comida y cena, buscando variedad de colores y preparaciones para evitar la monotonía.'
          },
          {
            title: 'Moderar el consumo de sal:',
            description: 'Utilizar hierbas, especias, limón, ajo, chile y otros condimentos para mejorar el sabor de los alimentos sin depender de cantidades elevadas de sal.'
          }
        ]
      },
      {
        id: 'c4',
        num: 4,
        title: 'Hidratación y Bebidas',
        icon: 'fa-solid fa-droplet',
        highlight: true,
        items: [
          {
            title: 'Mantener una adecuada hidratación:',
            description: 'Continuar con aproximadamente 2–3 litros de agua al día, ajustando según sed, clima y actividad física.'
          },
          {
            title: 'Preferir agua simple sobre bebidas azucaradas:',
            description: 'Evitar refrescos, jugos industrializados y bebidas con azúcar. El agua de limón, jamaica u otras preparaciones puede utilizarse sin azúcar o con un endulzante no calórico si lo tolera.'
          }
        ]
      },
      {
        id: 'c5',
        num: 5,
        title: 'Actividad Física y Movimiento',
        icon: 'fa-solid fa-person-walking',
        highlight: true,
        items: [
          {
            title: 'Mantener y progresar la actividad:',
            description: 'Mantener la actividad que ya realiza y procurar aumentar progresivamente la duración o intensidad únicamente si se siente cómodo y no existen contraindicaciones médicas.'
          },
          {
            title: 'Evitar pasar largos periodos completamente sedentario:',
            description: 'Si permanece mucho tiempo sentado, levantarse periódicamente, caminar algunos minutos o realizar movimientos ligeros durante el día.'
          }
        ]
      },
      {
        id: 'c6',
        num: 6,
        title: 'Flexibilidad y Hábitos Sostenibles',
        icon: 'fa-solid fa-heart-pulse',
        highlight: true,
        items: [
          {
            title: 'No considerar los alimentos como "prohibidos":',
            description: 'El objetivo es crear hábitos que pueda mantener durante años. Un alimento ocasional fuera del menú no significa que haya perdido su progreso; lo importante es regresar posteriormente a su alimentación habitual.'
          },
          {
            title: 'Compromiso y constancia:',
            description: 'Recordar que la regularidad y la flexibilidad son las claves fundamentales para consolidar resultados duraderos y un estilo de vida saludable.'
          }
        ]
      }
    ]
  },
  {
    id: 'fat-loss',
    name: 'Pérdida de Grasa & Déficit Energético',
    badgeLabel: 'Pérdida de Grasa & Composición Corporal',
    bannerSubtitle: 'Estrategias para Reducción de Tejido Adiposo con Saciedad',
    summaryText: 'Pérdida de grasa progresiva, preservación muscular y control consciente del apetito.',
    summaryTag: 'Control de Grasa & Saciedad',
    cards: [
      {
        id: 'fl1',
        num: 1,
        title: 'Control de Hambre y Saciedad',
        icon: 'fa-solid fa-scale-balanced',
        highlight: true,
        items: [
          {
            title: 'Alimentos de alto volumen y baja densidad calórica:',
            description: 'Aumentar la presencia de verduras de hoja verde, calabacita, pepino y caldos claros para lograr plenitud gástrica sin exceso calórico.'
          },
          {
            title: 'Masticación consciente y ritmo pausado:',
            description: 'Comer en un mínimo de 20 minutos para permitir que las señales hormonales de saciedad (leptina, GLP-1) lleguen adecuadamente al cerebro.'
          }
        ]
      },
      {
        id: 'fl2',
        num: 2,
        title: 'Proteína y Preservación Muscular',
        icon: 'fa-solid fa-drumstick-bite',
        highlight: false,
        items: [
          {
            title: 'Proteína magra en cada tiempo de comida:',
            description: 'Incluir pechuga de pollo, lomo de cerdo, atún en agua, claras de huevo o pescado blanco para proteger la masa magra durante el déficit.'
          },
          {
            title: 'Efecto térmico de los alimentos:',
            description: 'El consumo proteico eleva el gasto calórico de digestión y mantiene los niveles de glucosa y saciedad estables por más tiempo.'
          }
        ]
      },
      {
        id: 'fl3',
        num: 3,
        title: 'Fibra Estratégica y Orden al Comer',
        icon: 'fa-solid fa-plate-wheat',
        highlight: false,
        items: [
          {
            title: 'Iniciar comidas con ensaladas o verduras:',
            description: 'Consumir primero el plato de vegetales crudos o al vapor antes de las proteínas y carbohidratos para moderar la velocidad de absorción.'
          },
          {
            title: 'Cereales enteros vs refinados:',
            description: 'Preferir avena, papa cocida con cáscara, leguminosas o tortilla de maíz sobre pan dulce, harinas blancas y galletas.'
          }
        ]
      },
      {
        id: 'fl4',
        num: 4,
        title: 'Hidratación y Cero Calorías Líquidas',
        icon: 'fa-solid fa-bottle-water',
        highlight: true,
        items: [
          {
            title: 'Hidratación antes de los alimentos:',
            description: 'Beber un vaso con agua (250-300 ml) 15 minutos antes de cada comida principal para favorecer la digestión y el control del apetito.'
          },
          {
            title: 'Eliminar calorías líquidas no contabilizadas:',
            description: 'Evitar jugos de frutas, cafés preparados con jarabes, tés comerciales y refrescos regulares; optar por agua simple, café negro o infusiones.'
          }
        ]
      },
      {
        id: 'fl5',
        num: 5,
        title: 'Gasto Diario (NEAT) y Entrenamiento',
        icon: 'fa-solid fa-fire-flame-curved',
        highlight: true,
        items: [
          {
            title: 'Incrementar actividad no asociada al ejercicio (NEAT):',
            description: 'Buscar un objetivo de 8,000 a 10,000 pasos diarios usando escaleras, caminando en llamadas y evitando periodos prolongados sentado.'
          },
          {
            title: 'Priorizar entrenamiento de fuerza:',
            description: 'El estímulo de pesas o resistencia muscular es indispensable para señalarle al cuerpo que queme grasa y preserve músculo.'
          }
        ]
      },
      {
        id: 'fl6',
        num: 6,
        title: 'Adherencia Psicológica y Enfoque 80/20',
        icon: 'fa-solid fa-shield-heart',
        highlight: true,
        items: [
          {
            title: 'Sin restricciones extremas que generen atracones:',
            description: 'Si surge un evento social, modera las porciones y retoma tu menú regular en la siguiente comida sin compensar con ayunos severos.'
          },
          {
            title: 'Monitoreo multidimensional:',
            description: 'El éxito no se mide solo en la báscula: evalúa cómo te queda la ropa, tus niveles de energía diarios y tu calidad de sueño.'
          }
        ]
      }
    ]
  },
  {
    id: 'muscle-gain',
    name: 'Aumento de Masa Muscular (Hipertrofia)',
    badgeLabel: 'Hipertrofia & Rendimiento Físico',
    bannerSubtitle: 'Lineamientos para Optimizar Ganancia Muscular y Energía',
    summaryText: 'Nutrición orientada al superávit controlado, síntesis proteica y recuperación muscular.',
    summaryTag: 'Hipertrofia & Rendimiento',
    cards: [
      {
        id: 'mg1',
        num: 1,
        title: 'Superávit Calórico y Densidad Nutricional',
        icon: 'fa-solid fa-dumbbell',
        highlight: true,
        items: [
          {
            title: 'Aporte energético suficiente y consistente:',
            description: 'Consumir la totalidad de las porciones planificadas sin saltarse tiempos de comida para asegurar el excedente calórico necesario para crecer.'
          },
          {
            title: 'Densidad calórica saludable:',
            description: 'Incluir grasas saludables como frutos secos, crema de cacahuate, aguacate y aceite de oliva para alcanzar calorías sin pesadez estomacal.'
          }
        ]
      },
      {
        id: 'mg2',
        num: 2,
        title: 'Distribución y Timing de Proteínas',
        icon: 'fa-solid fa-egg',
        highlight: false,
        items: [
          {
            title: 'Fraccionamiento de proteína en 4-5 tomas:',
            description: 'Aportar entre 25g y 40g de proteína de alto valor biológico cada 3–4 horas para maximizar los picos de síntesis proteica muscular (MPS).'
          },
          {
            title: 'Variedad de fuentes proteicas:',
            description: 'Alternar pechuga de pollo, res magra, pescados grasos (salmón/atún), huevos enteros, lácteos y proteína de suero si está indicada.'
          }
        ]
      },
      {
        id: 'mg3',
        num: 3,
        title: 'Carbohidratos y Combustible Peri-Entreno',
        icon: 'fa-solid fa-bolt',
        highlight: false,
        items: [
          {
            title: 'Carbohidratos pre-entrenamiento (1-2 horas antes):',
            description: 'Avena, plátano, pan tostado con miel o arroz para repletar reservas de glucógeno y entrenar con máxima intensidad.'
          },
          {
            title: 'Recuperación post-entreno inmediata:',
            description: 'Combinar carbohidratos de fácil asimilación con proteína para acelerar la recuperación muscular y reducir el catabolismo.'
          }
        ]
      },
      {
        id: 'mg4',
        num: 4,
        title: 'Hidratación Celular y Rendimiento',
        icon: 'fa-solid fa-droplet',
        highlight: true,
        items: [
          {
            title: 'Volumen hídrico aumentado:',
            description: 'Consumir de 3 a 3.5 litros de agua al día, asegurando una correcta reposición de líquidos durante y después de los entrenamientos.'
          },
          {
            title: 'Equilibrio de electrolitos:',
            description: 'No restringir el sodio en exceso; una cantidad adecuada de sal favorece la bomba muscular, la contracción y la hidratación celular.'
          }
        ]
      },
      {
        id: 'mg5',
        num: 5,
        title: 'Descanso, Hormonas y Sueño Profundo',
        icon: 'fa-solid fa-bed',
        highlight: true,
        items: [
          {
            title: 'Dormir entre 7 y 9 horas continuas:',
            description: 'El tejido muscular se repara y sintetiza durante las fases profundas de sueño mediante la liberación de hormona del crecimiento y testosterona.'
          },
          {
            title: 'Gestión del estrés fisiológico:',
            description: 'El cortisol crónicamente elevado interfiere con la hipertrofia; programa días de descarga y actividades de relajación.'
          }
        ]
      },
      {
        id: 'mg6',
        num: 6,
        title: 'Sobrecarga Progresiva y Paciencia',
        icon: 'fa-solid fa-chart-line',
        highlight: true,
        items: [
          {
            title: 'Anotar pesos y repeticiones en el gimnasio:',
            description: 'El crecimiento muscular requiere exigir progresivamente más trabajo a las fibras musculares sesión a sesión o semana a semana.'
          },
          {
            title: 'Ganancia de peso gradual y limpia:',
            description: 'Un ritmo saludable de ganancia es de 0.5 a 1.5 kg al mes; incrementos más rápidos corresponden predominantemente a grasa corporal.'
          }
        ]
      }
    ]
  },
  {
    id: 'glycemic',
    name: 'Salud Metabólica & Control Glucémico (Diabetes / Resistencia a la Insulina)',
    badgeLabel: 'Control Glucémico & Salud Metabólica',
    bannerSubtitle: 'Pautas para Estabilizar Glucosa, Insulina y Energía',
    summaryText: 'Control glucémico constante, regulación de insulina y protección cardiovascular.',
    summaryTag: 'Salud Metabólica & Glucemia',
    cards: [
      {
        id: 'gl1',
        num: 1,
        title: 'Orden Estratégico de Ingesta',
        icon: 'fa-solid fa-layer-group',
        highlight: true,
        items: [
          {
            title: 'Regla de oro del plato:',
            description: 'Comer primero los vegetales y fibra -> después las proteínas y grasas saludables -> y dejar los carbohidratos para el final del tiempo de comida.'
          },
          {
            title: 'Aplanamiento de la curva de glucosa:',
            description: 'Este orden retrasa el vaciamiento gástrico y reduce los picos postprandiales de glucosa e insulina en más de un 30%.'
          }
        ]
      },
      {
        id: 'gl2',
        num: 2,
        title: 'Calidad y Carga Glucémica',
        icon: 'fa-solid fa-wheat-awn',
        highlight: false,
        items: [
          {
            title: 'Cereales integrales y leguminosas:',
            description: 'Preferir frijoles, lentejas, garbanzos, avena integral y quinoa, ricos en fibra soluble que atrapa los azúcares en el intestino.'
          },
          {
            title: 'Evitar carbohidratos "desnudos":',
            description: 'Nunca consumir una fruta o carbohidrato solo; acompáñalo siempre con nueces, semillas, yogurt griego o queso para moderar el impacto.'
          }
        ]
      },
      {
        id: 'gl3',
        num: 3,
        title: 'Cero Bebidas Azucaradas y Harinas Refinadas',
        icon: 'fa-solid fa-ban',
        highlight: false,
        items: [
          {
            title: 'Eliminar refrescos, jugos y aguas frescas con azúcar:',
            description: 'Los azúcares líquidos pasan directo a la sangre provocando picos inmediatos. Utilizar agua con limón/chía o infusiones frías.'
          },
          {
            title: 'Sustitución de ultraprocesados:',
            description: 'Reemplazar pan blanco, galletas y harinas refinadas por opciones con granos enteros, masa madre o tortillas de maíz nixtamalizado.'
          }
        ]
      },
      {
        id: 'gl4',
        num: 4,
        title: 'Caminata y Movimiento Post-Comida',
        icon: 'fa-solid fa-shoe-prints',
        highlight: true,
        items: [
          {
            title: 'Caminar 10-15 minutos después de comer:',
            description: 'La contracción muscular en piernas activa los transportadores GLUT-4, captando glucosa sanguínea directamente sin requerir insulina extra.'
          },
          {
            title: 'Romper el sedentarismo postprandial:',
            description: 'Evitar acostarse o sentarse inmóvil inmediatamente después del almuerzo o la cena.'
          }
        ]
      },
      {
        id: 'gl5',
        num: 5,
        title: 'Regularidad de Horarios y Ayuno Nocturno',
        icon: 'fa-regular fa-clock',
        highlight: true,
        items: [
          {
            title: 'Consistencia en los tiempos de comida:',
            description: 'Comer a horas similares ayuda al reloj circadiano del páncreas y del hígado a sincronizar la secreción óptima de insulina.'
          },
          {
            title: 'Ayuno fisiológico nocturno (11-12 horas):',
            description: 'Cenar ligero 2-3 horas antes de dormir para permitir que el hígado descanse y reduzca la producción nocturna de glucosa.'
          }
        ]
      },
      {
        id: 'gl6',
        num: 6,
        title: 'Manejo del Estrés, Sueño y Monitoreo',
        icon: 'fa-solid fa-heart-pulse',
        highlight: true,
        items: [
          {
            title: 'Impacto del cortisol en la glucosa:',
            description: 'El estrés elevado y dormir menos de 6 horas estimulan la gluconeogénesis hepática elevando la glucosa aún en ayuno estricto.'
          },
          {
            title: 'Anotar mediciones de glucosa:',
            description: 'Llevar registro de glucosas capilares en ayuno y postprandiales (2h tras comer) para ajustar el tratamiento nutricional oportunamente.'
          }
        ]
      }
    ]
  },
  {
    id: 'cardiovascular',
    name: 'Salud Cardiovascular & Presión Arterial (Enfoque DASH)',
    badgeLabel: 'Salud Cardiovascular & Control Presión',
    bannerSubtitle: 'Lineamientos Cardioprotectores y Equilibrio Mineral',
    summaryText: 'Nutrición cardioprotectora, moderación de sodio y aporte de minerales esenciales.',
    summaryTag: 'Cardioprotección & Presión Arterial',
    cards: [
      {
        id: 'cv1',
        num: 1,
        title: 'Control de Sodio y Potenciadores de Sabor',
        icon: 'fa-solid fa-seedling',
        highlight: true,
        items: [
          {
            title: 'Reducción gradual de sal agregada:',
            description: 'Evitar saleros en la mesa y productos embutidos, enlatados con salmuera, sopas instantáneas y sazonadores en polvo comerciales.'
          },
          {
            title: 'Condimentación natural cardioprotectora:',
            description: 'Utilizar orégano, romero, cúrcuma, pimienta, ajo fresco, cebolla y jugo de limón para realzar el sabor de manera saludable.'
          }
        ]
      },
      {
        id: 'cv2',
        num: 2,
        title: 'Potasio, Magnesio y Vegetales Frescos',
        icon: 'fa-solid fa-leaf',
        highlight: false,
        items: [
          {
            title: 'Abundancia de potasio natural (Enfoque DASH):',
            description: 'Consumir espinacas, jitomate, calabaza, aguacate, plátano y papaya que contrarrestan el efecto del sodio en las arterias.'
          },
          {
            title: 'Aporte de magnesio y nitratos naturales:',
            description: 'Hojas verdes oscuras y betabel favorecen la síntesis de óxido nítrico, promoviendo la vasodilatación y relajación arterial.'
          }
        ]
      },
      {
        id: 'cv3',
        num: 3,
        title: 'Grasas Cardiosaludables (Omega-3 y AOVE)',
        icon: 'fa-solid fa-oil-well',
        highlight: false,
        items: [
          {
            title: 'Aceite de oliva extra virgen en crudo:',
            description: 'Usar 1-2 cucharadas diarias sobre ensaladas o verduras cocidas por su alto contenido de polifenoles y ácido oleico.'
          },
          {
            title: 'Pescados grasos y semillas:',
            description: 'Consumir atún, sardina, salmón, nueces, chía y linaza molida 2 a 3 veces por semana para reducir triglicéridos e inflamación.'
          }
        ]
      },
      {
        id: 'cv4',
        num: 4,
        title: 'Hidratación y Restricción de Estimulantes',
        icon: 'fa-solid fa-droplet',
        highlight: true,
        items: [
          {
            title: 'Agua simple baja en sodio:',
            description: 'Mantener de 2 a 2.5 litros de agua al día para facilitar la función renal y la correcta volemia sanguínea.'
          },
          {
            title: 'Moderar cafeína y evitar alcohol:',
            description: 'Limitar el café a 1-2 tazas al día y evitar bebidas energizantes o consumo de alcohol que elevan la tensión arterial.'
          }
        ]
      },
      {
        id: 'cv5',
        num: 5,
        title: 'Actividad Física Aeróbica Regular',
        icon: 'fa-solid fa-person-running',
        highlight: true,
        items: [
          {
            title: '150 minutos semanales de ejercicio moderado:',
            description: 'Caminar a paso ligero, bicicleta, natación o elíptica fortalecen el músculo cardíaco y mejoran la elasticidad endotelial.'
          },
          {
            title: 'Evitar esfuerzos estáticos extremos sin guía:',
            description: 'Mantener respiración fluida durante el esfuerzo sin contener el aire (maniobra de Valsalva).'
          }
        ]
      },
      {
        id: 'cv6',
        num: 6,
        title: 'Manejo del Estrés y Descanso Nocturno',
        icon: 'fa-solid fa-heart-circle-check',
        highlight: true,
        items: [
          {
            title: 'Higiene del sueño y presión arterial:',
            description: 'El descanso nocturno deficiente impide el descenso fisiológico nocturno de la presión arterial (patrón non-dipper).'
          },
          {
            title: 'Técnicas de respiración diafragmática:',
            description: '5 minutos de respiraciones lentas y profundas al día ayudan a activar el sistema parasimpático y relajar los vasos sanguíneos.'
          }
        ]
      }
    ]
  },
  {
    id: 'digestive',
    name: 'Salud Digestiva & Gastrointestinal (Gastritis / Colitis)',
    badgeLabel: 'Salud Digestiva & Microbiota',
    bannerSubtitle: 'Lineamientos para Calmar Mucosas, Digestión Ligera y Microbiota',
    summaryText: 'Pautas para aliviar malestares gástricos, optimizar la digestión y proteger la mucosa.',
    summaryTag: 'Confort Digestivo & Mucosas',
    cards: [
      {
        id: 'dg1',
        num: 1,
        title: 'Masticación y Ambiente en la Mesa',
        icon: 'fa-solid fa-utensils',
        highlight: true,
        items: [
          {
            title: 'Masticar cada bocado 20 a 30 veces:',
            description: 'La digestión inicia en la boca con las enzimas salivales. Triturar bien los alimentos alivia enormemente el trabajo gástrico y previene gases.'
          },
          {
            title: 'Comer en calma y sin pantallas:',
            description: 'Comer con prisa o bajo estrés altera el vaciamiento gástrico y propicia la deglución involuntaria de aire (aerofagia).'
          }
        ]
      },
      {
        id: 'dg2',
        num: 2,
        title: 'Cocciones Ligeras y Digestibles',
        icon: 'fa-solid fa-fire-burner',
        highlight: false,
        items: [
          {
            title: 'Preferir métodos de cocción suaves:',
            description: 'Cocinar al vapor, hervido, plancha o al horno. Evitar empanizados, capeados, frituras y alimentos con exceso de manteca o aceite recalentado.'
          },
          {
            title: 'Temperatura templada de las comidas:',
            description: 'Evitar alimentos o bebidas extremadamente calientes o heladas que irriten directamente la mucosa esofágica y gástrica.'
          }
        ]
      },
      {
        id: 'dg3',
        num: 3,
        title: 'Fibra Soluble y Cuidado de la Mucosa',
        icon: 'fa-solid fa-apple-whole',
        highlight: false,
        items: [
          {
            title: 'Vegetales cocidos y frutas blandas:',
            description: 'Priorizar zanahoria hervida, calabacita sin semilla, chayote, papaya, manzana cocida y avena cocida, que forman mucílagos protectores.'
          },
          {
            title: 'Introducción gradual de leguminosas y crucíferas:',
            description: 'Remojar frijoles/lentejas 12-24 horas previas y moderar brócoli, coliflor y cebolla cruda si experimenta distensión abdominal frecuente.'
          }
        ]
      },
      {
        id: 'dg4',
        num: 4,
        title: 'Líquidos Fraccionados Fuera de Comidas',
        icon: 'fa-solid fa-mug-hot',
        highlight: true,
        items: [
          {
            title: 'Beber agua entre comidas:',
            description: 'Evitar tomar grandes volúmenes de líquidos durante la comida principal para no diluir los jugos gástricos ni causar plenitud excesiva.'
          },
          {
            title: 'Infusiones digestivas templadas:',
            description: 'Manzanilla, jengibre suave, menta o hinojo después de los alimentos pueden aliviar espasmos e inflamación gástrica.'
          }
        ]
      },
      {
        id: 'dg5',
        num: 5,
        title: 'Identificación y Control de Irritantes',
        icon: 'fa-solid fa-pepper-hot',
        highlight: true,
        items: [
          {
            title: 'Moderar picantes, salsas ácidas y condimentos fuertes:',
            description: 'Reducir el consumo de chile irritante, vinagres, salsas procesadas embotelladas, café en ayunas, refrescos con gas y alcohol.'
          },
          {
            title: 'Evaluar tolerancia a lácteos enteros:',
            description: 'Si presenta inflamación o diarreas, sustituir leche entera por deslactosada, yogurt griego o bebidas vegetales sin azúcar.'
          }
        ]
      },
      {
        id: 'dg6',
        num: 6,
        title: 'Cena Temprana y Postura Anti-Reflujo',
        icon: 'fa-solid fa-moon',
        highlight: true,
        items: [
          {
            title: 'Cenar al menos 2 horas antes de dormir:',
            description: 'No acostarse inmediatamente después de ingerir alimentos para prevenir el reflujo gastroesofágico y la acidez nocturna.'
          },
          {
            title: 'Ropa holgada en la zona abdominal:',
            description: 'Evitar cinturones o prendas excesivamente ajustadas que incrementen la presión intraabdominal.'
          }
        ]
      }
    ]
  }
];

export const SAMPLE_PATIENTS_LIST: PatientOption[] = [
  { id: '1', name: 'Laura Martínez Soto', goal: 'Pérdida de grasa', objectiveId: 'fat-loss', plan: 'Plan Hipocalórico 1,600 kcal', notes: 'Ligera molestia con lácteos en ayunas. Enfocar en saciedad.' },
  { id: '2', name: 'Carlos Mendoza Cruz', goal: 'Hipertrofia muscular', objectiveId: 'muscle-gain', plan: 'Plan Hiperproteico 2,400 kcal', notes: 'Entrenamiento de fuerza matutino 5 días/semana. Cuidar descanso.' },
  { id: '3', name: 'Valeria Rivas Gómez', goal: 'Recomposición corporal', objectiveId: 'general', plan: 'Plan Balanceado 1,850 kcal', notes: 'Metas de constancia y horarios de comida estables.' },
  { id: '4', name: 'Diego Hernández Vega', goal: 'Control Glucémico & Energía', objectiveId: 'glycemic', plan: 'Plan Índice Glucémico 1,900 kcal', notes: 'Resistencia a la insulina. Priorizar orden de ingesta de alimentos.' },
  { id: '5', name: 'María Elena Salazar', goal: 'Salud Cardiovascular & Presión', objectiveId: 'cardiovascular', plan: 'Plan DASH 1,700 kcal', notes: 'Hipertensión leve. Reducir sal y aumentar potasio vegetal.' },
  { id: '6', name: 'Roberto Garza Treviño', goal: 'Salud Gastrointestinal', objectiveId: 'digestive', plan: 'Plan Blando Digestivo 1,750 kcal', notes: 'Gastritis y reflujo ocasional. Cenar 2 horas antes de dormir.' },
];
