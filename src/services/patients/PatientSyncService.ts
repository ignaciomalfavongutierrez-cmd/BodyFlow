import {
  collection,
  doc,
  getDocs,
  query,
  where,
  onSnapshot,
  deleteField,
  writeBatch,
  serverTimestamp,
  type Unsubscribe
} from 'firebase/firestore';
import { db, auth } from '../../firebase';
import type { Patient, PatientDietPlan } from '../../types/patient';
import type { DietPlanMenu, DayMenuSchedule, DishItem } from '../../types/dietMenu';
import { MEAL_TIMES_CATALOG } from '../../types/dietMenu';
import type { DayPlan, MealPlan } from '../../stores/diet';
import { cleanFirestoreData, PatientsService } from './patients.service';

const PATIENTS_COLLECTION = 'pacientes';

export interface PatientSyncResult {
  linked: boolean;
  patient: Patient | null;
  activePlan: PatientDietPlan | null;
  dayPlans: DayPlan[] | null;
}

export class PatientSyncService {
  /**
   * Mapeo canónico de nombres de días en español a índices de semana de JavaScript (0 = Domingo, 1 = Lunes...)
   */
  private static readonly DAY_NAME_TO_INDEX: Record<string, number> = {
    lunes: 1,
    martes: 2,
    miercoles: 3,
    miércoles: 3,
    jueves: 4,
    viernes: 5,
    sabado: 6,
    sábado: 6,
    domingo: 0,
    dia_1: 1,
    dia_2: 2,
    dia_3: 3,
    dia_4: 4,
    dia_5: 5,
    dia_6: 6,
    dia_7: 0
  };

  /**
   * @deprecated DESACTIVADO POR SEGURIDAD.
   * No consultar la colección `pacientes` por email de forma abierta / cross-tenant.
   * La vinculación de expedientes de pacientes debe realizarse mediante vinculación explícita
   * (`users/{uid}.linkedPatientId`) o bajo el ámbito de ownership de la nutrióloga.
   */
  public static async findPatientByEmail(_email?: string | null): Promise<Patient | null> {
    console.warn('[PATIENT:SYNC] findPatientByEmail está deprecado y desactivado por seguridad. Utilice users/{uid}.linkedPatientId');
    return null;
  }

  /**
   * Busca si existe una cuenta de usuario en Firestore `users` con el correo indicado.
   * Útil cuando la nutrióloga registra un paciente por email: detecta si ya tenía cuenta en la App.
   */
  public static async findUserByEmail(email?: string | null): Promise<{ id: string; [key: string]: any } | null> {
    if (!email || !email.trim()) return null;
    const cleanEmail = email.toLowerCase().trim();

    try {
      const usersCol = collection(db, 'users');
      const q = query(usersCol, where('email', '==', cleanEmail));
      const snap = await getDocs(q);

      if (!snap.empty) {
        const docSnap = snap.docs[0];
        return { id: docSnap.id, ...docSnap.data() };
      }
    } catch (err) {
      console.warn('[PATIENT:SYNC] Error buscando usuario por email en Firestore:', err);
    }

    return null;
  }

  /**
   * Vincula bidireccionalmente y de forma ATÓMICA el UID de Auth con el expediente clínico del paciente.
   * Exclusivo para la nutrióloga dueña del expediente (`patient.ownerUid === auth.currentUser.uid`).
   * Protegido contra sobreescritura silenciosa si el usuario ya está vinculado a otro expediente.
   */
  public static async linkUserToPatient(patientId: string, userId: string): Promise<void> {
    if (!patientId || !userId) return;

    try {
      const user = auth.currentUser;
      if (!user) {
        throw new Error('No se puede vincular paciente: usuario no autenticado');
      }

      // Validar que el usuario autenticado sea el dueño (ownerUid) del expediente
      const patient = await PatientsService.getPatientById(patientId);
      if (!patient || patient.ownerUid !== user.uid) {
        throw new Error('No autorizado para vincular este paciente: no es el propietario del expediente');
      }

      // Atomic writeBatch para garantizar bidireccionalidad íntegra.
      // Las reglas de seguridad de Firestore validan en el servidor que el usuario no esté
      // vinculado previamente a otro expediente, respetando el principio de mínimo privilegio en /users/{uid}.
      const userRef = doc(db, 'users', userId);
      const batch = writeBatch(db);
      const patientRef = doc(db, PATIENTS_COLLECTION, patientId);

      batch.set(patientRef, cleanFirestoreData({
        userId,
        updatedAt: serverTimestamp()
      }), { merge: true });

      batch.set(userRef, cleanFirestoreData({
        linkedPatientId: patientId,
        updatedAt: serverTimestamp()
      }), { merge: true });

      await batch.commit();
      console.log(`[PATIENT:SYNC] Vinculación atómica exitosa: Paciente ${patientId} ⇄ Usuario ${userId}`);
    } catch (err: any) {
      if (err?.code === 'permission-denied') {
        console.error('[PATIENT:SYNC] Permiso denegado al vincular. Posible sobreescritura rechazada por Firestore Rules.');
        throw new Error('No se pudo vincular: el usuario ya está vinculado a otro expediente o no eres propietario del mismo.');
      }
      console.error('[PATIENT:SYNC] Error al vincular usuario con paciente:', err);
      throw err;
    }
  }

  /**
   * Desvincula bidireccionalmente y de forma ATÓMICA el paciente y el usuario de la App.
   * Requiere autorización del propietario del expediente (`ownerUid`).
   */
  public static async unlinkUserFromPatient(patientId: string, userId: string): Promise<void> {
    if (!patientId || !userId) return;

    try {
      const user = auth.currentUser;
      if (!user) {
        throw new Error('No se puede desvincular: usuario no autenticado');
      }

      const patient = await PatientsService.getPatientById(patientId);
      if (!patient || patient.ownerUid !== user.uid) {
        throw new Error('No autorizado para desvincular este paciente: no es el propietario');
      }

      const batch = writeBatch(db);
      const patientRef = doc(db, PATIENTS_COLLECTION, patientId);
      const userRef = doc(db, 'users', userId);

      batch.update(patientRef, {
        userId: deleteField(),
        updatedAt: serverTimestamp()
      });

      batch.update(userRef, {
        linkedPatientId: deleteField(),
        updatedAt: serverTimestamp()
      });

      await batch.commit();
      console.log(`[PATIENT:SYNC] Desvinculación atómica exitosa: Paciente ${patientId} ⇎ Usuario ${userId}`);
    } catch (err) {
      console.error('[PATIENT:SYNC] Error al desvincular usuario de paciente:', err);
      throw err;
    }
  }

  /**
   * Obtiene el plan activo de un paciente específico.
   */
  public static async getActiveDietPlan(patientId: string): Promise<PatientDietPlan | null> {
    try {
      const plans = await PatientsService.getPatientDietPlans(patientId);
      const active = plans.find(p => p.status === 'activo');
      return active || (plans.length > 0 ? plans[0] : null);
    } catch (err) {
      console.error(`[PATIENT:SYNC] Error obteniendo plan activo para paciente ${patientId}:`, err);
      return null;
    }
  }

  /**
   * Convierte la estructura del Diseñador de Menús (`DietPlanMenu`) al modelo de tracking (`DayPlan[]`)
   * para que el DateBubbleSlider, MacroRings y MealCards reflejen exactamente lo diseñado por la nutrióloga.
   */
  public static convertDietPlanMenuToDayPlans(menu: DietPlanMenu, planCalorias?: number): DayPlan[] {
    if (!menu || !menu.dias || menu.dias.length === 0) {
      return [];
    }

    const isSingleTypeDay = menu.tipoEstructura === 'dia_tipo' || menu.dias.length === 1;

    return menu.dias.map((diaSchedule: DayMenuSchedule, dayIndex: number) => {
      const dayId = (diaSchedule.diaId || '').toLowerCase().trim();
      const dayName = diaSchedule.diaNombre || `Día ${dayIndex + 1}`;

      // Asignación de días de la semana
      let assignedDays: number[] = [];
      if (isSingleTypeDay) {
        // Aplica a toda la semana
        assignedDays = [0, 1, 2, 3, 4, 5, 6];
      } else {
        const mappedIdx = this.DAY_NAME_TO_INDEX[dayId];
        if (mappedIdx !== undefined) {
          assignedDays = [mappedIdx];
        } else {
          // Fallback secuencial (1=Lun ... 6=Sáb, 0=Dom)
          const fallbackOrder = [1, 2, 3, 4, 5, 6, 0];
          assignedDays = [fallbackOrder[dayIndex % fallbackOrder.length]];
        }
      }

      // Tiempos de comida configurados
      const timeCatalog = menu.tiemposComidaConfig && menu.tiemposComidaConfig.length > 0
        ? menu.tiemposComidaConfig
        : MEAL_TIMES_CATALOG;

      const meals: MealPlan[] = [];

      // Procesar cada categoría de comida registrada en el día
      timeCatalog.forEach(tCat => {
        const dishes: DishItem[] = diaSchedule.comidas[tCat.key] || [];
        if (dishes && dishes.length > 0) {
          // Extraer nombres e ingredientes estructurados
          const items: string[] = [];
          let totalCalories = 0;
          let totalProtein = 0;
          let totalCarbs = 0;
          let totalFat = 0;

          dishes.forEach(dish => {
            const hasIngredients = dish.ingredientes && dish.ingredientes.length > 0;
            if (hasIngredients) {
              dish.ingredientes.forEach(ing => {
                if (ing && !items.includes(ing)) {
                  items.push(ing);
                }
              });
            } else if (dish.nombre) {
              const portionStr = dish.porcion ? ` (${dish.porcion})` : '';
              items.push(`${dish.nombre}${portionStr}`);
            }

            if (dish.macros) {
              totalCalories += dish.macros.calories || 0;
              totalProtein += dish.macros.protein || 0;
              totalCarbs += dish.macros.carbs || 0;
              totalFat += dish.macros.fat || 0;
            }
          });

          // Si los platillos no tenían macros detallados individuales, distribuir equitativamente
          if (totalCalories === 0 && planCalorias && timeCatalog.length > 0) {
            totalCalories = Math.round(planCalorias / timeCatalog.length);
          }

          // El nombre principal del platillo (ej: "Huevos a la Mexicana con Claras, Tortillas y Aguacate")
          const dishTitles = dishes.map(d => (d.nombre || '').trim()).filter(Boolean);
          const primaryTitle = dishTitles.length > 0 ? dishTitles.join(' + ') : tCat.label;

          meals.push({
            id: `nutri_${dayId}_${tCat.key}`,
            name: primaryTitle,
            mealType: tCat.label,
            items: items.length > 0 ? items : [dishes.map(d => d.nombre).join(', ')],
            plannedMacros: {
              calories: Math.round(totalCalories),
              protein: Math.round(totalProtein),
              carbs: Math.round(totalCarbs),
              fat: Math.round(totalFat),
              sugar: 0
            }
          });
        }
      });

      return {
        dayName,
        date: `plan_${dayId}`,
        assignedDays,
        meals
      };
    });
  }

  /**
   * @deprecated DESACTIVADO POR SEGURIDAD.
   * Los pacientes autenticados leen directamente su expediente asignado mediante `users/{uid}.linkedPatientId`.
   * No se permite auto-descubrimiento o auto-vinculación basada en coincidencias de email cross-tenant.
   */
  public static async checkAndSyncPatientAccount(
    _userId: string,
    _userEmail: string
  ): Promise<PatientSyncResult> {
    console.warn('[PATIENT:SYNC] checkAndSyncPatientAccount está deprecado y desactivado por seguridad.');
    return {
      linked: false,
      patient: null,
      activePlan: null,
      dayPlans: null
    };
  }

  /**
   * Escucha cambios en tiempo real en los planes del paciente asignado.
   * Cuando la nutrióloga guarda o modifica un menú en /utilities, la app del paciente se actualiza al instante.
   */
  public static listenToPatientActivePlan(
    patientId: string,
    callback: (activePlan: PatientDietPlan | null, dayPlans: DayPlan[] | null) => void
  ): Unsubscribe {
    const plansCol = collection(db, PATIENTS_COLLECTION, patientId, 'planes_nutricionales');

    return onSnapshot(plansCol, (snap) => {
      if (snap.empty) {
        callback(null, null);
        return;
      }

      const plans = snap.docs.map(d => ({ id: d.id, ...d.data() })) as PatientDietPlan[];
      const active = plans.find(p => p.status === 'activo') || plans[0] || null;

      let dayPlans: DayPlan[] | null = null;
      if (active && active.menu) {
        dayPlans = this.convertDietPlanMenuToDayPlans(active.menu, active.calorias);
      }

      callback(active, dayPlans);
    }, (error) => {
      console.warn(`[PATIENT:SYNC] Error en listener de planes para paciente ${patientId}:`, error);
    });
  }
}
