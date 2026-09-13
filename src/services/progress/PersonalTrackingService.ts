import {
  collection,
  doc,
  getDocs,
  setDoc,
  deleteDoc,
  query,
  orderBy,
  serverTimestamp
} from 'firebase/firestore';
import { db } from '../../firebase';
import type { ClinicalRecord } from '../../types/patientProgress';
import { ProgressCalculationService } from './ProgressCalculationService';

export interface PersonalMeasurement {
  id: string;
  fecha: string; // YYYY-MM-DD
  peso: number; // kg
  talla?: number; // cm
  edad?: number;
  grasaPorcentaje?: number; // %
  musculoKg?: number; // kg
  cintura?: number; // cm
  cadera?: number; // cm
  pecho?: number; // cm
  brazo?: number; // cm
  notas?: string;
  createdAt?: string;
}

const STORAGE_PREFIX = 'bodyflow_personal_meas_';

export class PersonalTrackingService {
  private static getStorageKey(uid: string): string {
    return `${STORAGE_PREFIX}${uid}`;
  }

  private static loadFromStorage(uid: string): PersonalMeasurement[] {
    try {
      const raw = localStorage.getItem(this.getStorageKey(uid));
      return raw ? JSON.parse(raw) : [];
    } catch {
      return [];
    }
  }

  private static saveToStorage(uid: string, items: PersonalMeasurement[]): void {
    try {
      localStorage.setItem(this.getStorageKey(uid), JSON.stringify(items));
    } catch (e) {
      console.warn('[PERSONAL TRACKING] Failed to write localStorage:', e);
    }
  }

  /**
   * Obtiene las mediciones personales de un usuario (Firestore con fallback en localStorage)
   */
  public static async getMeasurements(uid: string): Promise<PersonalMeasurement[]> {
    if (!uid) return [];

    try {
      const colRef = collection(db, 'users', uid, 'mediciones_personales');
      const q = query(colRef, orderBy('fecha', 'asc'));
      const snap = await getDocs(q);

      if (!snap.empty) {
        const items = snap.docs.map(d => ({ id: d.id, ...d.data() })) as PersonalMeasurement[];
        this.saveToStorage(uid, items);
        return items;
      }
    } catch (err) {
      console.warn(`[PERSONAL TRACKING] Firestore get failed for user ${uid}, falling back to local storage:`, err);
    }

    return this.loadFromStorage(uid);
  }

  /**
   * Registra una nueva medición personal
   */
  public static async addMeasurement(
    uid: string,
    data: Omit<PersonalMeasurement, 'id' | 'createdAt'>
  ): Promise<PersonalMeasurement> {
    const id = `pmeas_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`;
    const newRecord: PersonalMeasurement = {
      ...data,
      id,
      createdAt: new Date().toISOString()
    };

    // Actualizar cache local
    const current = this.loadFromStorage(uid);
    const updated = [...current, newRecord].sort((a, b) => (a.fecha || '').localeCompare(b.fecha || ''));
    this.saveToStorage(uid, updated);

    // Persistir en Firestore
    try {
      const docRef = doc(db, 'users', uid, 'mediciones_personales', id);
      await setDoc(docRef, {
        ...newRecord,
        updatedAt: serverTimestamp()
      });
    } catch (err) {
      console.warn('[PERSONAL TRACKING] Firestore write failed, preserved in localStorage:', err);
    }

    return newRecord;
  }

  /**
   * Elimina una medición personal
   */
  public static async deleteMeasurement(uid: string, measurementId: string): Promise<void> {
    const current = this.loadFromStorage(uid);
    const updated = current.filter(m => m.id !== measurementId);
    this.saveToStorage(uid, updated);

    try {
      const docRef = doc(db, 'users', uid, 'mediciones_personales', measurementId);
      await deleteDoc(docRef);
    } catch (err) {
      console.warn('[PERSONAL TRACKING] Firestore delete failed:', err);
    }
  }

  /**
   * Mapea mediciones personales a formato ClinicalRecord para que las gráficas y KPIs funcionen transparentemente
   */
  public static toClinicalRecords(items: PersonalMeasurement[], userHeight = 170, userAge = 28): ClinicalRecord[] {
    return items.map(item => {
      const peso = Number(item.peso) || 0;
      const talla = Number(item.talla || userHeight) || 170;
      const tallaM = talla / 100;
      const imc = tallaM > 0 && peso > 0 ? Number((peso / (tallaM * tallaM)).toFixed(1)) : 0;

      const grasaPct = Number(item.grasaPorcentaje) || 0;
      const musculoKg = Number(item.musculoKg) || (peso > 0 && grasaPct > 0 ? ProgressCalculationService.calculateMuscleKg(peso, grasaPct) || 0 : 0);

      const cintura = Number(item.cintura) || 0;
      const cadera = Number(item.cadera) || 0;
      const icc = cadera > 0 && cintura > 0 ? Number((cintura / cadera).toFixed(2)) : 0;

      return {
        id: item.id,
        Fecha: item.fecha,
        Edad: item.edad || userAge,
        Peso: peso,
        Talla: talla,
        Cintura: cintura,
        Cadera: cadera,
        Pecho: Number(item.pecho) || 0,
        Brazo: Number(item.brazo) || 0,
        Pliegues: { tricep: null, bicep: null, subescapular: null, cresta: null },
        Suma_Pliegues: 0,
        Grasa_Bascula: grasaPct,
        Grasa_Formula: 0,
        Grasa_Fuente: 'bascula',
        Grasa_Porcentaje: grasaPct,
        Musculo_Kg: musculoKg,
        IMC: imc,
        ICC: icc
      };
    });
  }
}
