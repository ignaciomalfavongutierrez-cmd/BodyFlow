import type { Patient, ClinicalHistory, PatientAppointment, PatientMeasurement, PatientDietPlan } from '../../types/patient';
import { SAMPLE_PROGRESS_RECORDS } from '../../catalog/progress/samplePatientProgress';

export interface FullPatientData {
  patient: Patient;
  history: ClinicalHistory;
  appointments: PatientAppointment[];
  measurements: PatientMeasurement[];
  dietPlans: PatientDietPlan[];
}

export const SEED_PATIENTS: FullPatientData[] = [
  {
    patient: {
      id: 'patient-valeria-rivas',
      nombre: 'Valeria Rivas Gómez',
      email: 'valeria.rivas@gmail.com',
      telefono: '3541123456',
      edad: 28,
      sexo: 'M',
      ocupacion: 'Diseñadora Gráfica',
      motivoConsulta: 'Recomposición corporal y control de digestión/gastritis',
      objetivoPrincipal: 'Recomposición corporal',
      status: 'activo',
      alertasMedicas: ['Gastritis y Reflujo', 'Intolerancia a la Lactosa'],
      metas: {
        metaPeso: 63.5,
        metaGrasa: 19.0,
        metaMusculo: 26.0,
        fechaObjetivo: 'Mayo 2026',
        notas: 'Reducir % de grasa manteniendo masa muscular magra y aliviar inflamación postprandial.'
      },
      tags: ['Presencial', 'Matutino', 'Cardio + Pesas'],
      notasGenerales: 'Paciente muy constante. Refiere mejoría notable al evitar lácteos enteros y café en ayunas.',
      ultimaConsulta: '2026-04-06',
      proximaCita: '2026-05-04',
      createdAt: '2026-01-10T10:00:00.000Z',
      updatedAt: '2026-04-06T12:30:00.000Z'
    },
    history: {
      id: 'main',
      antecedentesPatologicos: ['Gastritis leve', 'Reflujo gastroesofágico matutino'],
      antecedentesHeredofamiliares: 'Madre con hipotiroidismo, padre con hipertensión arterial.',
      medicamentosActuales: 'Omeprazol 20mg en ayunas (solo en crisis agudas).',
      suplementacion: 'Proteína aislada vegetal (sin suero de leche), Omega 3 (2g diarios), Magnesio bisglicinato (300mg noche).',
      alergiasIntolerancias: ['Lactosa', 'Nueces de la India'],
      preferenciasAlimentarias: {
        gustosFavoritos: ['Salmón', 'Aguacate', 'Arroz jazmín', 'Frutos rojos', 'Avena', 'Huevo'],
        aversionesDisgustos: ['Hígado', 'Cilantro', 'Papaya', 'Lentejas'],
        recordatorio24h: 'Desayuno: Claras con espinacas y tostadas de maíz. Comida: Pollo a la plancha con quinoa y ensalada verde. Cena: Atún con aguacate y tostadas horneadas.',
        comidasAlDia: 4,
        consumoAguaLitros: 2.5,
        restriccionesEspeciales: 'Sin lácteos, baja en condimentos irritantes'
      },
      estiloDeVida: {
        nivelActividad: 'moderado',
        actividadFisicaDetalle: 'Entrenamiento de fuerza funcional 4 días/semana (50 min) + 20 min caminata diaria.',
        horasSueno: 7.5,
        nivelEstres: 'medio',
        consumoAlcoholTabaco: 'Social ocasional (vino tinto 1 copa fin de semana), No fuma.'
      },
      sintomasDigestivos: ['Distensión abdominal por las tardes', 'Reflujo con café concentrado'],
      observacionesGenerales: 'Alta motivación y adherencia al plan de suplementación.',
      updatedAt: '2026-04-06T12:30:00.000Z'
    },
    appointments: [
      {
        id: 'apt-1',
        fecha: '2026-01-12',
        hora: '10:00 AM',
        tipo: 'primera_vez',
        motivo: 'Evaluación inicial, anamnesis y toma de medidas antropométricas completas.',
        status: 'completada',
        notasEvolucion: 'S: Paciente acude para iniciar plan de recomposición. Refiere molestias digestivas frecuentes.\nO: Peso 72.4kg, % Grasa 27.2% (Durnin-Womersley), Cintura 82.5cm.\nA: Sobrepeso leve con % grasa elevado.\nP: Se prescribe plan balanceado 1,850 kcal, eliminación de lácteos y pauta de hidratación.',
        acuerdosCompromisos: 'Registrar ingesta en BodyFlow y evitar café en ayunas.',
        createdAt: '2026-01-12T11:00:00.000Z'
      },
      {
        id: 'apt-2',
        fecha: '2026-02-02',
        hora: '10:30 AM',
        tipo: 'seguimiento',
        motivo: 'Revisión de 3 semanas y ajuste calórico.',
        status: 'completada',
        notasEvolucion: 'S: Reporta disminución total de acidez estomacal y mayor energía durante el día.\nO: Peso 70.1kg (-2.3kg), Cintura 80.0cm (-2.5cm), % Grasa 25.6%.\nA: Respuesta excelente a la reducción de inflamación.\nP: Se mantiene distribución de macros.',
        acuerdosCompromisos: 'Incrementar agua a 2.5L diarios.',
        createdAt: '2026-02-02T11:30:00.000Z'
      },
      {
        id: 'apt-3',
        fecha: '2026-04-06',
        hora: '11:00 AM',
        tipo: 'seguimiento',
        motivo: 'Control antropométrico mensual y entrega de recomendaciones actualizadas.',
        status: 'completada',
        notasEvolucion: 'S: Se siente muy ligera y con excelente fuerza en gimnasio.\nO: Peso 64.8kg (-7.6kg acumulados), % Grasa 20.3%, Masa muscular +1.2kg.\nA: Evolución sobresaliente.\nP: Ajuste a fase de consolidación 1,750 kcal.',
        acuerdosCompromisos: 'Continuar con magnesio nocturno y rutina de fuerza.',
        createdAt: '2026-04-06T12:00:00.000Z'
      },
      {
        id: 'apt-4',
        fecha: '2026-05-04',
        hora: '10:00 AM',
        tipo: 'seguimiento',
        motivo: 'Evaluación de fase de consolidación y cierre de ciclo.',
        status: 'programada',
        notasEvolucion: '',
        acuerdosCompromisos: 'Traer dudas sobre mantenimiento a largo plazo.',
        createdAt: '2026-04-06T12:15:00.000Z'
      }
    ],
    measurements: SAMPLE_PROGRESS_RECORDS.map((r, idx) => ({
      ...r,
      id: r.id || `meas-${idx + 1}`,
      notasConsulta: `Medición clínica #${idx + 1} en consultorio.`,
      createdAt: `2026-0${idx + 1}-10T10:00:00.000Z`
    })),
    dietPlans: [
      {
        id: 'plan-1',
        nombre: 'Plan Antiinflamatorio & Recomposición Fase 1',
        fechaAsignacion: '2026-01-12',
        status: 'completado',
        calorias: 1850,
        macros: { protein: 130, carbs: 180, fat: 55 },
        notas: 'Enfocado en digestión fácil y proteína vegetal/pescado.',
        createdAt: '2026-01-12T11:00:00.000Z'
      },
      {
        id: 'plan-2',
        nombre: 'Plan Hipocalórico Definición & Fuerza Fase 2',
        fechaAsignacion: '2026-04-06',
        status: 'activo',
        calorias: 1750,
        macros: { protein: 140, carbs: 160, fat: 50 },
        notas: 'Plan actual con ciclado leve de carbohidratos en días de entrenamiento.',
        createdAt: '2026-04-06T12:00:00.000Z'
      }
    ]
  },
  {
    patient: {
      id: 'patient-carlos-mendoza',
      nombre: 'Carlos Mendoza Cruz',
      email: 'carlos.mendoza@outlook.com',
      telefono: '3541789012',
      edad: 32,
      sexo: 'H',
      ocupacion: 'Ingeniero de Software',
      motivoConsulta: 'Aumento de masa muscular (hipertrofia) y rendimiento',
      objetivoPrincipal: 'Hipertrofia muscular',
      status: 'activo',
      alertasMedicas: ['Resistencia leve a la Insulina'],
      metas: {
        metaPeso: 82.0,
        metaGrasa: 14.0,
        metaMusculo: 40.0,
        fechaObjetivo: 'Julio 2026',
        notas: 'Superávit calórico controlado (+300 kcal) priorizando calidad de carbohidratos.'
      },
      tags: ['Presencial', 'Vespertino', 'Hipertrofia'],
      notasGenerales: 'Buen apego al entrenamiento de pesas. Necesita recordatorios para beber agua.',
      ultimaConsulta: '2026-04-02',
      proximaCita: '2026-04-30',
      createdAt: '2026-02-01T15:00:00.000Z',
      updatedAt: '2026-04-02T16:00:00.000Z'
    },
    history: {
      id: 'main',
      antecedentesPatologicos: ['Glucosa en ayuno límite (102 mg/dL)'],
      antecedentesHeredofamiliares: 'Abuelo paterno con diabetes tipo 2.',
      medicamentosActuales: 'Ninguno.',
      suplementacion: 'Creatina monohidratada 5g diarios, Proteína Whey Isolate 30g post-entreno.',
      alergiasIntolerancias: [],
      preferenciasAlimentarias: {
        gustosFavoritos: ['Carne de res magra', 'Arroz blanco', 'Crema de cacahuate', 'Plátano', 'Papas al horno'],
        aversionesDisgustos: ['Brócoli cocido', 'Sardinas', 'Espinacas crudas'],
        recordatorio24h: '4 comidas grandes: Huevos con avena, Pollo con arroz, Carne con papas, Batido con avena y crema de cacahuate.',
        comidasAlDia: 4,
        consumoAguaLitros: 3.0,
        restriccionesEspeciales: 'Ninguna'
      },
      estiloDeVida: {
        nivelActividad: 'intenso',
        actividadFisicaDetalle: 'Gimnasio hipertrofia 5 días/semana (60-75 min).',
        horasSueno: 7.0,
        nivelEstres: 'medio',
        consumoAlcoholTabaco: 'No fuma, alcohol ocasional.'
      },
      sintomasDigestivos: ['Buena tolerancia general'],
      observacionesGenerales: 'Excelente respuesta a la creatina y aumento de cargas.',
      updatedAt: '2026-04-02T16:00:00.000Z'
    },
    appointments: [
      {
        id: 'apt-cm-1',
        fecha: '2026-02-01',
        hora: '04:00 PM',
        tipo: 'primera_vez',
        motivo: 'Evaluación antropométrica inicial e inicio de superávit.',
        status: 'completada',
        notasEvolucion: 'S: Paciente desea ganar masa muscular sin elevar % de grasa.\nO: Peso 77.5kg, Grasa 16.8%, Masa muscular 36.2kg.\nP: Dieta de 2,600 kcal con 170g proteína.',
        acuerdosCompromisos: 'Consumir 5g de creatina todos los días sin falta.',
        createdAt: '2026-02-01T17:00:00.000Z'
      },
      {
        id: 'apt-cm-2',
        fecha: '2026-04-02',
        hora: '04:30 PM',
        tipo: 'seguimiento',
        motivo: 'Control de progreso y ajuste de cargas.',
        status: 'completada',
        notasEvolucion: 'S: Reporta incremento notable de fuerza en sentadilla y banca.\nO: Peso 79.2kg (+1.7kg), Grasa 16.2% (estable), Músculo 37.5kg (+1.3kg).\nP: Subir a 2,750 kcal.',
        acuerdosCompromisos: 'Mantener hidratación mínima de 3 litros.',
        createdAt: '2026-04-02T17:30:00.000Z'
      }
    ],
    measurements: [
      {
        id: 'meas-cm-1',
        Fecha: '01 de Febrero 2026',
        Edad: 32,
        Peso: 77.5,
        Talla: 178,
        Cintura: 84.0,
        Cadera: 98.0,
        Pecho: 102.0,
        Brazo: 34.5,
        Muslo: 56.0,
        Pantorrilla: 37.0,
        Pliegues: { tricep: 12.0, bicep: 6.0, subescapular: 14.0, cresta: 16.0 },
        Suma_Pliegues: 48.0,
        Suma_Manual: false,
        Grasa_Bascula: 16.8,
        Grasa_Formula: 16.5,
        Grasa_Fuente: 'formula',
        Grasa_Porcentaje: 16.5,
        Musculo_Kg: 36.2,
        IMC: 24.5,
        ICC: 0.85,
        createdAt: '2026-02-01T17:00:00.000Z'
      },
      {
        id: 'meas-cm-2',
        Fecha: '02 de Abril 2026',
        Edad: 32,
        Peso: 79.2,
        Talla: 178,
        Cintura: 84.5,
        Cadera: 99.0,
        Pecho: 104.5,
        Brazo: 36.0,
        Muslo: 58.0,
        Pantorrilla: 37.5,
        Pliegues: { tricep: 11.5, bicep: 5.5, subescapular: 13.5, cresta: 15.0 },
        Suma_Pliegues: 45.5,
        Suma_Manual: false,
        Grasa_Bascula: 16.2,
        Grasa_Formula: 15.8,
        Grasa_Fuente: 'formula',
        Grasa_Porcentaje: 15.8,
        Musculo_Kg: 37.5,
        IMC: 25.0,
        ICC: 0.85,
        createdAt: '2026-04-02T17:00:00.000Z'
      }
    ],
    dietPlans: [
      {
        id: 'plan-cm-1',
        nombre: 'Plan Hipertrofia & Rendimiento 2,750 kcal',
        fechaAsignacion: '2026-04-02',
        status: 'activo',
        calorias: 2750,
        macros: { protein: 175, carbs: 340, fat: 75 },
        notas: 'Alto en carbohidratos complejos y proteína de alto valor biológico.',
        createdAt: '2026-04-02T17:00:00.000Z'
      }
    ]
  },
  {
    patient: {
      id: 'patient-laura-martinez',
      nombre: 'Laura Martínez Soto',
      email: 'laura.martinez@gmail.com',
      telefono: '3541456789',
      edad: 41,
      sexo: 'M',
      ocupacion: 'Contadora Pública',
      motivoConsulta: 'Pérdida de peso, control de hipotiroidismo y cansancio crónico',
      objetivoPrincipal: 'Pérdida de grasa',
      status: 'activo',
      alertasMedicas: ['Hipotiroidismo (Levotiroxina 75mcg)', 'Alergia a Mariscos'],
      metas: {
        metaPeso: 68.0,
        metaGrasa: 24.0,
        metaMusculo: 23.0,
        fechaObjetivo: 'Agosto 2026',
        notas: 'Déficit calórico moderado cuidando función tiroidea y energía.'
      },
      tags: ['Online', 'Control Tiroideo', 'Déficit'],
      notasGenerales: 'Tomas de levotiroxina 45 min antes del desayuno sin interferencias.',
      ultimaConsulta: '2026-04-15',
      proximaCita: '2026-05-13',
      createdAt: '2026-03-01T09:00:00.000Z',
      updatedAt: '2026-04-15T10:00:00.000Z'
    },
    history: {
      id: 'main',
      antecedentesPatologicos: ['Hipotiroidismo primario diagnosticado hace 4 años'],
      antecedentesHeredofamiliares: 'Madre y hermana con hipotiroidismo.',
      medicamentosActuales: 'Eutirox (Levotiroxina) 75mcg diario en ayuno estricto.',
      suplementacion: 'Selenio 100mcg, Vitamina D3 (2000 UI), Zinc 15mg.',
      alergiasIntolerancias: ['Mariscos (Camarón, Pulpo)'],
      preferenciasAlimentarias: {
        gustosFavoritos: ['Pechuga de pavo', 'Calabacitas', 'Fresas', 'Almendras', 'Té verde'],
        aversionesDisgustos: ['Pescado blanco grasoso', 'Berenjena'],
        recordatorio24h: '3 comidas + 1 colación ligera.',
        comidasAlDia: 4,
        consumoAguaLitros: 2.0,
        restriccionesEspeciales: 'Sin mariscos, espaciar café de la pastilla tiroidea'
      },
      estiloDeVida: {
        nivelActividad: 'ligero',
        actividadFisicaDetalle: 'Pilates 3 veces por semana + caminata matutina 30 min.',
        horasSueno: 6.5,
        nivelEstres: 'alto',
        consumoAlcoholTabaco: 'No fuma ni bebe alcohol.'
      },
      sintomasDigestivos: ['Tendencia a estreñimiento'],
      observacionesGenerales: 'Recomendar fibra soluble e hidratación adecuada.',
      updatedAt: '2026-04-15T10:00:00.000Z'
    },
    appointments: [
      {
        id: 'apt-lm-1',
        fecha: '2026-03-01',
        hora: '09:00 AM',
        tipo: 'primera_vez',
        motivo: 'Evaluación clínica inicial y plan para hipotiroidismo.',
        status: 'completada',
        notasEvolucion: 'S: Paciente con fatiga y dificultad para bajar de peso.\nO: Peso 78.2kg, Grasa 34.5%, Cintura 88cm.\nP: Dieta 1,550 kcal con alta densidad de micronutrientes.',
        acuerdosCompromisos: 'Tomar Eutirox con agua natural 45 min antes de comer o beber.',
        createdAt: '2026-03-01T10:00:00.000Z'
      }
    ],
    measurements: [
      {
        id: 'meas-lm-1',
        Fecha: '01 de Marzo 2026',
        Edad: 41,
        Peso: 78.2,
        Talla: 160,
        Cintura: 88.0,
        Cadera: 110.0,
        Pecho: 100.0,
        Brazo: 31.0,
        Muslo: 62.0,
        Pantorrilla: 38.0,
        Pliegues: { tricep: 22.0, bicep: 12.0, subescapular: 20.0, cresta: 26.0 },
        Suma_Pliegues: 80.0,
        Suma_Manual: false,
        Grasa_Bascula: 34.5,
        Grasa_Formula: 33.8,
        Grasa_Fuente: 'formula',
        Grasa_Porcentaje: 33.8,
        Musculo_Kg: 22.5,
        IMC: 30.5,
        ICC: 0.80,
        createdAt: '2026-03-01T10:00:00.000Z'
      }
    ],
    dietPlans: [
      {
        id: 'plan-lm-1',
        nombre: 'Plan Balanceado Tiroideo 1,550 kcal',
        fechaAsignacion: '2026-03-01',
        status: 'activo',
        calorias: 1550,
        macros: { protein: 115, carbs: 155, fat: 45 },
        notas: 'Enfocado en control glucémico y soporte tiroideo.',
        createdAt: '2026-03-01T10:00:00.000Z'
      }
    ]
  },
  {
    patient: {
      id: 'patient-diego-hernandez',
      nombre: 'Diego Hernández Vega',
      email: 'diego.hdez@gmail.com',
      telefono: '3541998877',
      edad: 25,
      sexo: 'H',
      ocupacion: 'Atleta de Ciclismo / Estudiante',
      motivoConsulta: 'Nutrición deportiva y periodización para competencia de ruta',
      objetivoPrincipal: 'Rendimiento deportivo',
      status: 'seguimiento',
      alertasMedicas: ['Deshidratación frecuente en rodadas largas'],
      metas: {
        metaPeso: 69.0,
        metaGrasa: 11.0,
        metaMusculo: 35.0,
        fechaObjetivo: 'Junio 2026',
        notas: 'Optimizar reservas de glucógeno y recuperación muscular intra/post-entreno.'
      },
      tags: ['Ciclismo', 'Alto Rendimiento', 'Carb Cycling'],
      notasGenerales: 'Excelente disciplina. Se beneficia de geles energéticos caseros.',
      ultimaConsulta: '2026-03-25',
      proximaCita: '2026-04-29',
      createdAt: '2026-01-20T16:00:00.000Z',
      updatedAt: '2026-03-25T17:00:00.000Z'
    },
    history: {
      id: 'main',
      antecedentesPatologicos: ['Calambres musculares en cuádriceps post-competencia'],
      antecedentesHeredofamiliares: 'Sin antecedentes relevantes.',
      medicamentosActuales: 'Ninguno.',
      suplementacion: 'Electrólitos orales (Sodio 500mg/L), Beta-alanina 4g/día, Cafeína 200mg pre-carrera.',
      alergiasIntolerancias: [],
      preferenciasAlimentarias: {
        gustosFavoritos: ['Pasta integral', 'Plátano deshidratado', 'Miel', 'Pechuga de pavo', 'Yogur griego'],
        aversionesDisgustos: ['Pescados muy fuertes', 'Coles de bruselas'],
        recordatorio24h: '5 comidas en días de fondo de ciclismo (>80km).',
        comidasAlDia: 5,
        consumoAguaLitros: 3.5,
        restriccionesEspeciales: 'Alta disponibilidad de carbohidratos en rodadas'
      },
      estiloDeVida: {
        nivelActividad: 'muy_intenso',
        actividadFisicaDetalle: 'Ciclismo de ruta 12-16 horas/semana + 2 sesiones gimnasio.',
        horasSueno: 8.0,
        nivelEstres: 'bajo',
        consumoAlcoholTabaco: 'No fuma ni bebe.'
      },
      sintomasDigestivos: ['Tolerancia digestiva óptima a maltodextrina y fructosa 2:1'],
      observacionesGenerales: 'Excelente capacidad oxidativa.',
      updatedAt: '2026-03-25T17:00:00.000Z'
    },
    appointments: [
      {
        id: 'apt-dh-1',
        fecha: '2026-01-20',
        hora: '04:00 PM',
        tipo: 'primera_vez',
        motivo: 'Periodización nutricional para temporada ciclista.',
        status: 'completada',
        notasEvolucion: 'S: Paciente con cargas altas de volumen.\nO: Peso 71.0kg, Grasa 12.8%, Musculo 34.2kg.\nP: Dieta 2,800-3,200 kcal según día de entrenamiento.',
        acuerdosCompromisos: 'Llevar registro de gramos de CHO por hora de rodada.',
        createdAt: '2026-01-20T17:00:00.000Z'
      }
    ],
    measurements: [
      {
        id: 'meas-dh-1',
        Fecha: '20 de Enero 2026',
        Edad: 25,
        Peso: 71.0,
        Talla: 175,
        Cintura: 78.0,
        Cadera: 94.0,
        Pecho: 96.0,
        Brazo: 30.0,
        Muslo: 57.0,
        Pantorrilla: 37.0,
        Pliegues: { tricep: 9.0, bicep: 4.5, subescapular: 10.0, cresta: 11.5 },
        Suma_Pliegues: 35.0,
        Suma_Manual: false,
        Grasa_Bascula: 12.8,
        Grasa_Formula: 12.4,
        Grasa_Fuente: 'formula',
        Grasa_Porcentaje: 12.4,
        Musculo_Kg: 34.2,
        IMC: 23.2,
        ICC: 0.83,
        createdAt: '2026-01-20T17:00:00.000Z'
      }
    ],
    dietPlans: [
      {
        id: 'plan-dh-1',
        nombre: 'Periodización Ciclismo Rendimiento 3,000 kcal',
        fechaAsignacion: '2026-01-20',
        status: 'activo',
        calorias: 3000,
        macros: { protein: 140, carbs: 460, fat: 65 },
        notas: 'Ciclado de carbohidratos con recarga pre-competencia.',
        createdAt: '2026-01-20T17:00:00.000Z'
      }
    ]
  }
];
