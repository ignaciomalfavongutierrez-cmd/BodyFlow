import {
  collection,
  doc,
  getDocs,
  getDoc,
  setDoc,
  deleteDoc,
  query,
  where,
  orderBy,
  onSnapshot,
  serverTimestamp,
  type Unsubscribe,
  writeBatch
} from 'firebase/firestore';
import { db } from '../../firebase';
import type {
  Patient,
  PatientStatus,
  ClinicalHistory,
  PatientAppointment,
  PatientMeasurement,
  PatientDietPlan,
  PatientDeliverable
} from '../../types/patient';
import type { ClinicalRecord } from '../../types/patientProgress';
import { SEED_PATIENTS } from './samplePatientsSeed';

const PATIENTS_COLLECTION = 'pacientes';

/**
 * Recursively removes all keys with `undefined` values from an object or array.
 * Firestore setDoc/updateDoc throws when an object contains `undefined`:
 * "FirebaseError: Function setDoc() called with invalid data. Unsupported field value: undefined"
 */
export function cleanFirestoreData<T>(obj: T): T {
  if (obj === null || obj === undefined) {
    return null as unknown as T;
  }
  if (Array.isArray(obj)) {
    return obj
      .filter(item => item !== undefined)
      .map(item => cleanFirestoreData(item)) as unknown as T;
  }
  if (typeof obj === 'object' && !(obj instanceof Date)) {
    const constructorName = (obj as any)?.constructor?.name;
    if (constructorName === 'FieldValue' || constructorName === 'Timestamp' || '_methodName' in (obj as any)) {
      return obj;
    }
    const cleaned: any = {};
    for (const [key, value] of Object.entries(obj)) {
      if (value !== undefined) {
        cleaned[key] = cleanFirestoreData(value);
      }
    }
    return cleaned;
  }
  return obj;
}

/**
 * Service to manage all patient data, subcollections, and clinical records
 */
export class PatientsService {
  private static localPatientsCache: Patient[] = [];
  private static initialized = false;

  /**
   * Initializes or seeds default patients if Firestore collection is empty or for instant UI response
   */
  static async initializeDefaultsIfEmpty(): Promise<void> {
    try {
      const snap = await getDocs(collection(db, PATIENTS_COLLECTION));
      if (snap.empty) {
        console.log('[PATIENTS:SERVICE] Seeding initial patient records into Firestore...');
        for (const seed of SEED_PATIENTS) {
          await this.createPatientWithFullSeed(seed);
        }
      }
      this.initialized = true;
    } catch (err) {
      console.warn('[PATIENTS:SERVICE] Could not check/seed Firestore, loading local seed memory fallback.', err);
      if (this.localPatientsCache.length === 0) {
        this.localPatientsCache = SEED_PATIENTS.map(s => s.patient);
      }
      this.initialized = true;
    }
  }

  /**
   * Seeds a complete patient with its subcollections
   */
  private static async createPatientWithFullSeed(seed: typeof SEED_PATIENTS[0]): Promise<void> {
    const patientRef = doc(db, PATIENTS_COLLECTION, seed.patient.id);
    await setDoc(patientRef, {
      ...seed.patient,
      createdAt: serverTimestamp(),
      updatedAt: serverTimestamp()
    });

    // Subcollection: historial_clinico/main
    const historyRef = doc(db, PATIENTS_COLLECTION, seed.patient.id, 'historial_clinico', 'main');
    await setDoc(historyRef, {
      ...seed.history,
      updatedAt: serverTimestamp()
    });

    // Subcollection: citas
    for (const apt of seed.appointments) {
      const aptRef = doc(db, PATIENTS_COLLECTION, seed.patient.id, 'citas', apt.id);
      await setDoc(aptRef, {
        ...apt,
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp()
      });
    }

    // Subcollection: mediciones
    for (const meas of seed.measurements) {
      const measRef = doc(db, PATIENTS_COLLECTION, seed.patient.id, 'mediciones', meas.id);
      await setDoc(measRef, {
        ...meas,
        createdAt: serverTimestamp()
      });
    }

    // Subcollection: planes_nutricionales
    for (const plan of seed.dietPlans) {
      const planRef = doc(db, PATIENTS_COLLECTION, seed.patient.id, 'planes_nutricionales', plan.id);
      await setDoc(planRef, {
        ...plan,
        createdAt: serverTimestamp()
      });
    }
  }

  // =========================================================================
  // 1. PATIENTS (ROOT COLLECTION)
  // =========================================================================

  /**
   * Fetches all patients with optional filter by status or search keyword
   */
  static async getPatients(filters?: { status?: PatientStatus; search?: string }): Promise<Patient[]> {
    try {
      let q = query(collection(db, PATIENTS_COLLECTION));
      if (filters?.status) {
        q = query(collection(db, PATIENTS_COLLECTION), where('status', '==', filters.status));
      }

      const snap = await getDocs(q);
      if (snap.empty && !this.initialized) {
        await this.initializeDefaultsIfEmpty();
        const retrySnap = await getDocs(q);
        return this.mapPatientDocs(retrySnap.docs, filters?.search);
      }

      const results = this.mapPatientDocs(snap.docs, filters?.search);
      if (results.length > 0) {
        this.localPatientsCache = results;
        return results;
      }

      return this.getLocalFilteredPatients(filters);
    } catch (err) {
      console.warn('[PATIENTS:SERVICE] getPatients Firestore query failed, using local cache:', err);
      return this.getLocalFilteredPatients(filters);
    }
  }

  private static mapPatientDocs(docs: any[], search?: string): Patient[] {
    let list = docs.map(d => ({
      id: d.id,
      ...d.data()
    })) as Patient[];

    if (search && search.trim()) {
      const term = search.toLowerCase().trim();
      list = list.filter(p =>
        (p.nombre || '').toLowerCase().includes(term) ||
        (p.objetivoPrincipal || '').toLowerCase().includes(term) ||
        (p.email || '').toLowerCase().includes(term) ||
        (p.tags || []).some(t => t.toLowerCase().includes(term))
      );
    }

    return list;
  }

  private static getLocalFilteredPatients(filters?: { status?: PatientStatus; search?: string }): Patient[] {
    let list = this.localPatientsCache.length > 0 
      ? [...this.localPatientsCache] 
      : SEED_PATIENTS.map(s => s.patient);

    if (filters?.status) {
      list = list.filter(p => p.status === filters.status);
    }

    if (filters?.search && filters.search.trim()) {
      const term = filters.search.toLowerCase().trim();
      list = list.filter(p =>
        (p.nombre || '').toLowerCase().includes(term) ||
        (p.objetivoPrincipal || '').toLowerCase().includes(term) ||
        (p.email || '').toLowerCase().includes(term) ||
        (p.tags || []).some(t => t.toLowerCase().includes(term))
      );
    }

    return list;
  }

  /**
   * Real-time subscription to patients collection
   */
  static subscribePatients(
    onUpdate: (patients: Patient[]) => void,
    onError?: (error: any) => void
  ): Unsubscribe {
    const q = query(collection(db, PATIENTS_COLLECTION));
    return onSnapshot(
      q,
      (snap) => {
        const patients = snap.docs.map(d => ({ id: d.id, ...d.data() })) as Patient[];
        if (patients.length > 0) {
          this.localPatientsCache = patients;
          onUpdate(patients);
        } else {
          // If empty, initialize defaults
          this.initializeDefaultsIfEmpty().then(() => {
            onUpdate(SEED_PATIENTS.map(s => s.patient));
          });
        }
      },
      (error) => {
        console.warn('[PATIENTS:SERVICE] subscribePatients error, fallback to cache:', error);
        if (onError) onError(error);
        onUpdate(this.getLocalFilteredPatients());
      }
    );
  }

  /**
   * Retrieves a single patient by ID
   */
  static async getPatientById(patientId: string): Promise<Patient | null> {
    try {
      const docRef = doc(db, PATIENTS_COLLECTION, patientId);
      const snap = await getDoc(docRef);
      if (snap.exists()) {
        const data = { id: snap.id, ...snap.data() } as Patient;
        const idx = this.localPatientsCache.findIndex(p => p.id === patientId);
        if (idx !== -1) {
          this.localPatientsCache[idx] = data;
        } else {
          this.localPatientsCache.push(data);
        }
        return data;
      }
      // Check local cache
      const cached = this.localPatientsCache.find(p => p.id === patientId);
      if (cached) return { ...cached };
      // Check local seed
      const seed = SEED_PATIENTS.find(s => s.patient.id === patientId);
      return seed ? { ...seed.patient } : null;
    } catch (err) {
      console.warn(`[PATIENTS:SERVICE] getPatientById(${patientId}) failed, fallback:`, err);
      const cached = this.localPatientsCache.find(p => p.id === patientId);
      if (cached) return { ...cached };
      const seed = SEED_PATIENTS.find(s => s.patient.id === patientId);
      return seed ? { ...seed.patient } : null;
    }
  }

  /**
   * Creates a new patient in Firestore
   */
  static async createPatient(data: Omit<Patient, 'id' | 'createdAt' | 'updatedAt'>): Promise<Patient> {
    const newId = `patient_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`;
    const patientData: Patient = {
      ...data,
      id: newId,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };

    try {
      const docRef = doc(db, PATIENTS_COLLECTION, newId);
      await setDoc(docRef, cleanFirestoreData({
        ...patientData,
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp()
      }));
    } catch (err) {
      console.warn('[PATIENTS:SERVICE] createPatient Firestore write failed, stored in local cache:', err);
    }

    this.localPatientsCache.unshift(patientData);
    return patientData;
  }

  /**
   * Updates an existing patient document
   */
  static async updatePatient(patientId: string, data: Partial<Patient>): Promise<void> {
    const cleanData = { ...data, updatedAt: new Date().toISOString() };
    delete (cleanData as any).id;

    try {
      const docRef = doc(db, PATIENTS_COLLECTION, patientId);
      // setDoc with merge: true creates or updates safely even for initial seed records
      await setDoc(docRef, cleanFirestoreData({
        ...cleanData,
        updatedAt: serverTimestamp()
      }), { merge: true });
    } catch (err) {
      console.warn(`[PATIENTS:SERVICE] updatePatient(${patientId}) Firestore write failed, patching local cache:`, err);
    }

    // Update in local cache
    const idx = this.localPatientsCache.findIndex(p => p.id === patientId);
    if (idx !== -1) {
      this.localPatientsCache[idx] = { ...this.localPatientsCache[idx], ...cleanData };
    } else {
      this.localPatientsCache.push({ id: patientId, ...cleanData } as Patient);
    }

    // Also update seed memory object if it was a seed patient
    const seed = SEED_PATIENTS.find(s => s.patient.id === patientId);
    if (seed) {
      seed.patient = { ...seed.patient, ...cleanData };
    }
  }

  /**
   * Deletes a patient
   */
  static async deletePatient(patientId: string): Promise<void> {
    try {
      const docRef = doc(db, PATIENTS_COLLECTION, patientId);
      await deleteDoc(docRef);
    } catch (err) {
      console.warn(`[PATIENTS:SERVICE] deletePatient(${patientId}) failed:`, err);
    }
    this.localPatientsCache = this.localPatientsCache.filter(p => p.id !== patientId);
  }

  // In-memory & LocalStorage Fallback caches
  private static localMeasurementsCache: Record<string, PatientMeasurement[]> = {};
  private static localAppointmentsCache: Record<string, PatientAppointment[]> = {};
  private static localHistoryCache: Record<string, ClinicalHistory> = {};
  private static localDietPlansCache: Record<string, PatientDietPlan[]> = {};

  private static getStorageKey(sub: string, patientId: string) {
    return `bf_${sub}_${patientId}`;
  }

  private static loadFromStorage<T>(key: string): T | null {
    try {
      const raw = localStorage.getItem(key);
      return raw ? JSON.parse(raw) : null;
    } catch {
      return null;
    }
  }

  private static saveToStorage(key: string, data: any) {
    try {
      localStorage.setItem(key, JSON.stringify(data));
    } catch {}
  }

  // =========================================================================
  // 2. CLINICAL HISTORY SUBCOLLECTION
  // =========================================================================

  /**
   * Retrieves the clinical history for a patient
   */
  static async getClinicalHistory(patientId: string): Promise<ClinicalHistory> {
    try {
      const docRef = doc(db, PATIENTS_COLLECTION, patientId, 'historial_clinico', 'main');
      const snap = await getDoc(docRef);
      if (snap.exists()) {
        const hist = { id: snap.id, ...snap.data() } as ClinicalHistory;
        this.localHistoryCache[patientId] = hist;
        this.saveToStorage(this.getStorageKey('historia', patientId), hist);
        return hist;
      }
    } catch (err) {
      console.warn(`[PATIENTS:SERVICE] getClinicalHistory(${patientId}) Firestore read failed, using cache fallback:`, err);
    }

    if (this.localHistoryCache[patientId]) return { ...this.localHistoryCache[patientId] };
    const stored = this.loadFromStorage<ClinicalHistory>(this.getStorageKey('historia', patientId));
    if (stored) {
      this.localHistoryCache[patientId] = stored;
      return { ...stored };
    }

    const seed = SEED_PATIENTS.find(s => s.patient.id === patientId);
    return seed ? { ...seed.history } : { id: 'main', updatedAt: new Date().toISOString() };
  }

  /**
   * Upserts the clinical history for a patient
   */
  static async upsertClinicalHistory(patientId: string, history: Partial<ClinicalHistory>): Promise<void> {
    const fullHist = {
      ...(this.localHistoryCache[patientId] || {}),
      ...history,
      id: 'main',
      updatedAt: new Date().toISOString()
    } as ClinicalHistory;

    this.localHistoryCache[patientId] = fullHist;
    this.saveToStorage(this.getStorageKey('historia', patientId), fullHist);

    const seed = SEED_PATIENTS.find(s => s.patient.id === patientId);
    if (seed) {
      seed.history = { ...seed.history, ...fullHist };
    }

    try {
      const docRef = doc(db, PATIENTS_COLLECTION, patientId, 'historial_clinico', 'main');
      await setDoc(docRef, cleanFirestoreData({
        ...fullHist,
        updatedAt: serverTimestamp()
      }), { merge: true });
    } catch (err) {
      console.warn(`[PATIENTS:SERVICE] upsertClinicalHistory(${patientId}) Firestore write failed (stored in local cache):`, err);
    }
  }

  // =========================================================================
  // 3. APPOINTMENTS SUBCOLLECTION
  // =========================================================================

  /**
   * Gets all appointments for a patient
   */
  static async getAppointments(patientId: string): Promise<PatientAppointment[]> {
    try {
      const colRef = collection(db, PATIENTS_COLLECTION, patientId, 'citas');
      const q = query(colRef, orderBy('fecha', 'desc'));
      const snap = await getDocs(q);
      if (!snap.empty) {
        const apts = snap.docs.map(d => ({ id: d.id, ...d.data() })) as PatientAppointment[];
        this.localAppointmentsCache[patientId] = apts;
        this.saveToStorage(this.getStorageKey('citas', patientId), apts);
        return apts;
      }
    } catch (err) {
      console.warn(`[PATIENTS:SERVICE] getAppointments(${patientId}) Firestore read failed, using cache fallback:`, err);
    }

    if (this.localAppointmentsCache[patientId]) return [...this.localAppointmentsCache[patientId]];
    const stored = this.loadFromStorage<PatientAppointment[]>(this.getStorageKey('citas', patientId));
    if (stored && stored.length > 0) {
      this.localAppointmentsCache[patientId] = stored;
      return [...stored];
    }

    const seed = SEED_PATIENTS.find(s => s.patient.id === patientId);
    return seed ? [...seed.appointments] : [];
  }

  /**
   * Creates a new appointment
   */
  static async createAppointment(
    patientId: string,
    appointment: Omit<PatientAppointment, 'id' | 'createdAt' | 'updatedAt'>
  ): Promise<PatientAppointment> {
    const newId = `apt_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`;
    const aptData: PatientAppointment = {
      ...appointment,
      id: newId,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };

    const currentApts = this.localAppointmentsCache[patientId] || [];
    this.localAppointmentsCache[patientId] = [aptData, ...currentApts];
    this.saveToStorage(this.getStorageKey('citas', patientId), this.localAppointmentsCache[patientId]);

    const seed = SEED_PATIENTS.find(s => s.patient.id === patientId);
    if (seed) {
      seed.appointments = [aptData, ...seed.appointments];
    }

    if (aptData.status === 'programada') {
      await this.updatePatient(patientId, { proximaCita: aptData.fecha });
    } else if (aptData.status === 'completada') {
      await this.updatePatient(patientId, { ultimaConsulta: aptData.fecha });
    }

    try {
      const docRef = doc(db, PATIENTS_COLLECTION, patientId, 'citas', newId);
      await setDoc(docRef, {
        ...aptData,
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp()
      }, { merge: true });
    } catch (err) {
      console.warn(`[PATIENTS:SERVICE] createAppointment(${patientId}) Firestore write failed (stored locally):`, err);
    }

    return aptData;
  }

  /**
   * Updates an existing appointment
   */
  static async updateAppointment(
    patientId: string,
    appointmentId: string,
    data: Partial<PatientAppointment>
  ): Promise<void> {
    const currentApts = this.localAppointmentsCache[patientId] || [];
    const idx = currentApts.findIndex(a => a.id === appointmentId);
    if (idx !== -1) {
      currentApts[idx] = { ...currentApts[idx], ...data, updatedAt: new Date().toISOString() };
      this.localAppointmentsCache[patientId] = [...currentApts];
      this.saveToStorage(this.getStorageKey('citas', patientId), currentApts);
    }

    try {
      const docRef = doc(db, PATIENTS_COLLECTION, patientId, 'citas', appointmentId);
      await setDoc(docRef, {
        ...data,
        updatedAt: serverTimestamp()
      }, { merge: true });
    } catch (err) {
      console.warn(`[PATIENTS:SERVICE] updateAppointment(${patientId}, ${appointmentId}) Firestore write failed:`, err);
    }
  }

  /**
   * Deletes an appointment
   */
  static async deleteAppointment(patientId: string, appointmentId: string): Promise<void> {
    const currentApts = this.localAppointmentsCache[patientId] || [];
    this.localAppointmentsCache[patientId] = currentApts.filter(a => a.id !== appointmentId);
    this.saveToStorage(this.getStorageKey('citas', patientId), this.localAppointmentsCache[patientId]);

    try {
      const docRef = doc(db, PATIENTS_COLLECTION, patientId, 'citas', appointmentId);
      await deleteDoc(docRef);
    } catch (err) {
      console.warn(`[PATIENTS:SERVICE] deleteAppointment(${patientId}, ${appointmentId}) failed:`, err);
    }
  }

  // =========================================================================
  // 4. MEASUREMENTS & ANTHROPOMETRY SUBCOLLECTION
  // =========================================================================

  /**
   * Gets all measurements for a patient
   */
  static async getMeasurements(patientId: string): Promise<PatientMeasurement[]> {
    try {
      const colRef = collection(db, PATIENTS_COLLECTION, patientId, 'mediciones');
      const snap = await getDocs(colRef);
      if (!snap.empty) {
        const records = snap.docs.map(d => ({ id: d.id, ...d.data() })) as PatientMeasurement[];
        this.localMeasurementsCache[patientId] = records;
        this.saveToStorage(this.getStorageKey('mediciones', patientId), records);
        return records;
      }
    } catch (err) {
      console.warn(`[PATIENTS:SERVICE] getMeasurements(${patientId}) Firestore read failed, using cache fallback:`, err);
    }

    // Check in-memory cache
    if (this.localMeasurementsCache[patientId] && this.localMeasurementsCache[patientId].length > 0) {
      return [...this.localMeasurementsCache[patientId]];
    }

    // Check localStorage
    const stored = this.loadFromStorage<PatientMeasurement[]>(this.getStorageKey('mediciones', patientId));
    if (stored && stored.length > 0) {
      this.localMeasurementsCache[patientId] = stored;
      return [...stored];
    }

    // Check seed
    const seed = SEED_PATIENTS.find(s => s.patient.id === patientId);
    return seed ? [...seed.measurements] : [];
  }

  /**
   * Adds a single measurement record
   */
  static async addMeasurement(
    patientId: string,
    record: Omit<ClinicalRecord, 'id'> & { notasConsulta?: string }
  ): Promise<PatientMeasurement> {
    const newId = `meas_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`;
    const measurement: PatientMeasurement = {
      ...record,
      id: newId,
      createdAt: new Date().toISOString()
    };

    const currentList = this.localMeasurementsCache[patientId] || [];
    this.localMeasurementsCache[patientId] = [...currentList, measurement];
    this.saveToStorage(this.getStorageKey('mediciones', patientId), this.localMeasurementsCache[patientId]);

    const seed = SEED_PATIENTS.find(s => s.patient.id === patientId);
    if (seed) {
      seed.measurements = [...seed.measurements, measurement];
    }

    if (record.Fecha) {
      await this.updatePatient(patientId, { ultimaConsulta: record.Fecha });
    }

    try {
      const docRef = doc(db, PATIENTS_COLLECTION, patientId, 'mediciones', newId);
      await setDoc(docRef, {
        ...measurement,
        createdAt: serverTimestamp()
      }, { merge: true });
    } catch (err) {
      console.warn(`[PATIENTS:SERVICE] addMeasurement(${patientId}) Firestore write failed (stored in local cache):`, err);
    }

    return measurement;
  }

  /**
   * Updates an existing measurement
   */
  static async updateMeasurement(
    patientId: string,
    measurementId: string,
    record: Partial<ClinicalRecord>
  ): Promise<void> {
    const currentList = this.localMeasurementsCache[patientId] || [];
    const idx = currentList.findIndex(m => m.id === measurementId);
    if (idx !== -1) {
      currentList[idx] = { ...currentList[idx], ...record };
      this.localMeasurementsCache[patientId] = [...currentList];
      this.saveToStorage(this.getStorageKey('mediciones', patientId), currentList);
    }

    try {
      const docRef = doc(db, PATIENTS_COLLECTION, patientId, 'mediciones', measurementId);
      await setDoc(docRef, { ...record }, { merge: true });
    } catch (err) {
      console.warn(`[PATIENTS:SERVICE] updateMeasurement(${patientId}, ${measurementId}) Firestore write failed:`, err);
    }
  }

  /**
   * Deletes a measurement
   */
  static async deleteMeasurement(patientId: string, measurementId: string): Promise<void> {
    const currentList = this.localMeasurementsCache[patientId] || [];
    this.localMeasurementsCache[patientId] = currentList.filter(m => m.id !== measurementId);
    this.saveToStorage(this.getStorageKey('mediciones', patientId), this.localMeasurementsCache[patientId]);

    try {
      const docRef = doc(db, PATIENTS_COLLECTION, patientId, 'mediciones', measurementId);
      await deleteDoc(docRef);
    } catch (err) {
      console.warn(`[PATIENTS:SERVICE] deleteMeasurement(${patientId}, ${measurementId}) failed:`, err);
    }
  }

  /**
   * Imports an array of ClinicalRecords (e.g. from Word/Excel via ProgressFileParserService)
   */
  static async batchImportMeasurements(
    patientId: string,
    records: ClinicalRecord[]
  ): Promise<void> {
    const normRecords: PatientMeasurement[] = records.map(rec => ({
      ...rec,
      id: rec.id || `meas_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`,
      createdAt: (rec as any).createdAt || new Date().toISOString()
    }));

    // 1. Save immediately to in-memory cache & localStorage
    this.localMeasurementsCache[patientId] = normRecords;
    this.saveToStorage(this.getStorageKey('mediciones', patientId), normRecords);

    // Update in-memory seed object if applicable
    const seed = SEED_PATIENTS.find(s => s.patient.id === patientId);
    if (seed) {
      seed.measurements = [...normRecords];
    }

    // Update patient's last consultation date
    const lastRec = normRecords[normRecords.length - 1];
    if (lastRec?.Fecha) {
      await this.updatePatient(patientId, { ultimaConsulta: lastRec.Fecha });
    }

    // 2. Attempt Firestore batch write
    try {
      const batch = writeBatch(db);
      for (const rec of normRecords) {
        const docRef = doc(db, PATIENTS_COLLECTION, patientId, 'mediciones', rec.id);
        batch.set(docRef, {
          ...rec,
          id: rec.id,
          createdAt: serverTimestamp()
        }, { merge: true });
      }
      await batch.commit();
    } catch (err) {
      console.warn(`[PATIENTS:SERVICE] batchImportMeasurements(${patientId}) Firestore batch write failed (saved to local cache & storage):`, err);
    }
  }

  // =========================================================================
  // 5. DIET PLANS & DELIVERABLES SUBCOLLECTIONS
  // =========================================================================

  static async getPatientDietPlans(patientId: string): Promise<PatientDietPlan[]> {
    try {
      const colRef = collection(db, PATIENTS_COLLECTION, patientId, 'planes_nutricionales');
      const snap = await getDocs(colRef);
      if (!snap.empty) {
        const plans = snap.docs.map(d => ({ id: d.id, ...d.data() })) as PatientDietPlan[];
        this.localDietPlansCache[patientId] = plans;
        this.saveToStorage(this.getStorageKey('planes', patientId), plans);
        return plans;
      }
    } catch (err) {
      console.warn(`[PATIENTS:SERVICE] getPatientDietPlans(${patientId}) Firestore read failed, using cache fallback:`, err);
    }

    if (this.localDietPlansCache[patientId]) return [...this.localDietPlansCache[patientId]];
    const stored = this.loadFromStorage<PatientDietPlan[]>(this.getStorageKey('planes', patientId));
    if (stored && stored.length > 0) {
      this.localDietPlansCache[patientId] = stored;
      return [...stored];
    }

    const seed = SEED_PATIENTS.find(s => s.patient.id === patientId);
    return seed ? [...seed.dietPlans] : [];
  }

  static async savePatientDietPlan(
    patientId: string,
    plan: Omit<PatientDietPlan, 'id' | 'createdAt'> & { id?: string }
  ): Promise<PatientDietPlan> {
    const planId = plan.id || `plan_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`;
    const fullPlan: PatientDietPlan = {
      ...plan,
      id: planId,
      createdAt: (plan as any).createdAt || new Date().toISOString()
    };

    const currentPlans = this.localDietPlansCache[patientId] || [];
    const existingIndex = currentPlans.findIndex(p => p.id === planId);
    if (existingIndex !== -1) {
      currentPlans[existingIndex] = { ...currentPlans[existingIndex], ...fullPlan };
      this.localDietPlansCache[patientId] = [...currentPlans];
    } else {
      this.localDietPlansCache[patientId] = [fullPlan, ...currentPlans];
    }
    this.saveToStorage(this.getStorageKey('planes', patientId), this.localDietPlansCache[patientId]);

    const seed = SEED_PATIENTS.find(s => s.patient.id === patientId);
    if (seed) {
      const sIdx = seed.dietPlans.findIndex(p => p.id === planId);
      if (sIdx !== -1) {
        seed.dietPlans[sIdx] = { ...seed.dietPlans[sIdx], ...fullPlan };
      } else {
        seed.dietPlans = [fullPlan, ...seed.dietPlans];
      }
    }

    try {
      const docRef = doc(db, PATIENTS_COLLECTION, patientId, 'planes_nutricionales', planId);
      const dataToSave = cleanFirestoreData({
        ...fullPlan,
        createdAt: (fullPlan as any).createdAt || serverTimestamp(),
        updatedAt: serverTimestamp()
      });
      await setDoc(docRef, dataToSave, { merge: true });
    } catch (err) {
      console.warn(`[PATIENTS:SERVICE] savePatientDietPlan(${patientId}) failed (saved to local cache):`, err);
    }

    return fullPlan;
  }

  /**
   * Actualiza únicamente el estatus de un plan nutricional existente (activo, completado, archivado)
   */
  static async updateDietPlanStatus(
    patientId: string,
    planId: string,
    status: 'activo' | 'completado' | 'archivado'
  ): Promise<void> {
    const plans = this.localDietPlansCache[patientId] || [];
    const target = plans.find(p => p.id === planId);
    if (target) {
      target.status = status;
      await this.savePatientDietPlan(patientId, target);
    }
  }

  static async getPatientDeliverables(patientId: string): Promise<PatientDeliverable[]> {
    try {
      const colRef = collection(db, PATIENTS_COLLECTION, patientId, 'archivos');
      const snap = await getDocs(colRef);
      if (!snap.empty) {
        return snap.docs.map(d => ({ id: d.id, ...d.data() })) as PatientDeliverable[];
      }
      return [];
    } catch (err) {
      console.warn(`[PATIENTS:SERVICE] getPatientDeliverables(${patientId}) failed:`, err);
      return [];
    }
  }

  static async savePatientDeliverable(
    patientId: string,
    deliverable: Omit<PatientDeliverable, 'id' | 'createdAt'> & { id?: string }
  ): Promise<PatientDeliverable> {
    const fileId = deliverable.id || `file_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`;
    const fullFile: PatientDeliverable = {
      ...deliverable,
      id: fileId,
      createdAt: new Date().toISOString()
    };

    try {
      const docRef = doc(db, PATIENTS_COLLECTION, patientId, 'archivos', fileId);
      await setDoc(docRef, {
        ...fullFile,
        createdAt: serverTimestamp()
      });
    } catch (err) {
      console.warn(`[PATIENTS:SERVICE] savePatientDeliverable(${patientId}) failed:`, err);
    }

    return fullFile;
  }
}
