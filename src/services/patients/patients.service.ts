import {
  collection,
  doc,
  getDocs,
  getDoc,
  setDoc,
  query,
  where,
  orderBy,
  onSnapshot,
  serverTimestamp,
  type Unsubscribe,
  writeBatch,
  deleteField
} from 'firebase/firestore';
import { db, auth } from '../../firebase';
import type { User } from 'firebase/auth';
import type {
  Patient,
  CreatePatientInput,
  UpdatePatientInput,
  PatientStatus,
  ClinicalHistory,
  PatientAppointment,
  PatientMeasurement,
  PrivateClinicalData,
  PatientDietPlan,
  PatientDeliverable
} from '../../types/patient';
import type { ClinicalRecord } from '../../types/patientProgress';
import { SEED_PATIENTS } from './samplePatientsSeed';

/**
 * Resolves and validates the authenticated Firebase user.
 * Waits for Firebase Auth initialization to eliminate startup race conditions.
 */
export async function resolveAuthUser(): Promise<User> {
  await auth.authStateReady();
  const user = auth.currentUser;
  if (!user) {
    throw new Error('User must be authenticated to perform this operation');
  }
  return user;
}

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

  public static get isInitialized(): boolean {
    return this.initialized;
  }

  /**
   * Initializes local demo patients in memory if cache is empty.
   * Never writes unowned or fake-owned seed fixtures to Firestore.
   */
  static async initializeDefaultsIfEmpty(): Promise<void> {
    if (this.localPatientsCache.length === 0) {
      this.localPatientsCache = SEED_PATIENTS.map(s => ({
        ...s.patient,
        ownerUid: 'demo_local'
      })) as Patient[];
    }
    this.initialized = true;
  }

  // =========================================================================
  // 1. PATIENTS (ROOT COLLECTION)
  // =========================================================================

  /**
   * Fetches all patients owned by the authenticated nutritionist with optional filter by status or search keyword.
   * Every collection query is strictly scoped to `ownerUid === user.uid`.
   */
  static async getPatients(filters?: { status?: PatientStatus; search?: string }): Promise<Patient[]> {
    const user = await resolveAuthUser();

    try {
      let q = query(
        collection(db, PATIENTS_COLLECTION),
        where('ownerUid', '==', user.uid)
      );

      if (filters?.status) {
        q = query(
          collection(db, PATIENTS_COLLECTION),
          where('ownerUid', '==', user.uid),
          where('status', '==', filters.status)
        );
      }

      const snap = await getDocs(q);
      const results = this.mapPatientDocs(snap.docs, filters?.search);
      this.localPatientsCache = results;
      this.initialized = true;
      return results;
    } catch (err: any) {
      if (err?.code === 'permission-denied') {
        console.warn('[PATIENTS:SERVICE] getPatients permission-denied:', err?.message || err);
        return [];
      }
      console.warn('[PATIENTS:SERVICE] getPatients query failed, using scoped local cache:', err);
      return this.getLocalFilteredPatients(user.uid, filters);
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

  private static getLocalFilteredPatients(ownerUid: string, filters?: { status?: PatientStatus; search?: string }): Patient[] {
    let list = this.localPatientsCache.filter(p => p.ownerUid === ownerUid);

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
   * Real-time subscription to patients collection scoped strictly to the authenticated user's ownerUid.
   */
  static subscribePatients(
    onUpdate: (patients: Patient[]) => void,
    onError?: (error: any) => void
  ): Unsubscribe {
    let isCancelled = false;
    let unsubscribeFirestore: Unsubscribe = () => {};

    resolveAuthUser()
      .then((user) => {
        if (isCancelled) return;
        const q = query(
          collection(db, PATIENTS_COLLECTION),
          where('ownerUid', '==', user.uid)
        );

        unsubscribeFirestore = onSnapshot(
          q,
          (snap) => {
            const patients = snap.docs.map(d => ({ id: d.id, ...d.data() })) as Patient[];
            this.localPatientsCache = patients;
            onUpdate(patients);
          },
          (error) => {
            console.warn('[PATIENTS:SERVICE] subscribePatients error:', error);
            if (onError) onError(error);
            onUpdate(this.getLocalFilteredPatients(user.uid));
          }
        );
      })
      .catch((err) => {
        console.warn('[PATIENTS:SERVICE] subscribePatients auth resolution error:', err);
        if (onError) onError(err);
        onUpdate([]);
      });

    return () => {
      isCancelled = true;
      unsubscribeFirestore();
    };
  }

  /**
   * Retrieves a single patient by ID.
   * Validates read permission: only the nutritionist owner OR the linked patient account may read.
   * If not found or unauthorized, returns null (safe deny state).
   */
  static async getPatientById(patientId: string): Promise<Patient | null> {
    const user = await resolveAuthUser();

    try {
      const docRef = doc(db, PATIENTS_COLLECTION, patientId);
      const snap = await getDoc(docRef);

      if (!snap.exists()) {
        return null;
      }

      const data = { id: snap.id, ...snap.data() } as Patient;

      // Explicit read-role validation:
      // Grants READ access only if authenticated user is the nutritionist owner OR the linked patient.
      const isOwner = data.ownerUid === user.uid;
      const isLinkedPatient = data.userId === user.uid;

      if (!isOwner && !isLinkedPatient) {
        return null;
      }

      if (isOwner) {
        const idx = this.localPatientsCache.findIndex(p => p.id === patientId);
        if (idx !== -1) {
          this.localPatientsCache[idx] = data;
        } else {
          this.localPatientsCache.push(data);
        }
      }

      return data;
    } catch (err: any) {
      if (err?.code === 'permission-denied') {
        return null;
      }
      console.warn(`[PATIENTS:SERVICE] getPatientById(${patientId}) read error:`, err);
      const cached = this.localPatientsCache.find(p => p.id === patientId && p.ownerUid === user.uid);
      return cached ? { ...cached } : null;
    }
  }

  /**
   * Creates a new patient in Firestore using an ATOMIC batch write:
   * 1. Shared root document: `pacientes/{id}` (patient-readable)
   * 2. Private clinical document: `pacientes/{id}/private/clinical` (nutritionist-only)
   * 3. Linked user profile (if email matches existing account)
   * Enforces trusted ownerUid strictly from authenticated Firebase user.
   */
  static async createPatient(data: CreatePatientInput): Promise<Patient> {
    const user = await resolveAuthUser();

    // Strip client-injected security fields
    const { ownerUid: _discardedOwner, id: _discardedId, ...cleanInput } = data as any;

    const newId = `patient_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`;

    // Separate private clinical data from shared root
    const privateClinical: Partial<PrivateClinicalData> = cleanInput.privateClinical || {};
    if (cleanInput.alertasMedicas && !privateClinical.alertasMedicas) {
      privateClinical.alertasMedicas = cleanInput.alertasMedicas;
    }
    if (cleanInput.notasGenerales && !privateClinical.notasGenerales) {
      privateClinical.notasGenerales = cleanInput.notasGenerales;
    }

    // Shared root document data (never contains private fields)
    const {
      alertasMedicas: _stripAlerts,
      notasGenerales: _stripNotes,
      privateClinical: _stripPrivate,
      ...sharedData
    } = cleanInput;

    const patientData: Patient = {
      ...sharedData,
      id: newId,
      ownerUid: user.uid,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };

    let userDocToLink: any = null;
    // Auto-link with app user if email is provided
    if (patientData.email && !patientData.userId) {
      try {
        const usersCol = collection(db, 'users');
        const q = query(usersCol, where('email', '==', patientData.email.toLowerCase().trim()));
        const snap = await getDocs(q);
        if (!snap.empty) {
          userDocToLink = snap.docs[0];
          patientData.userId = userDocToLink.id;
        }
      } catch (linkErr) {
        console.warn('[PATIENTS:SERVICE] Auto-vincular usuario omitido:', linkErr);
      }
    }

    try {
      const batch = writeBatch(db);
      const patientDocRef = doc(db, PATIENTS_COLLECTION, newId);
      const privateDocRef = doc(db, PATIENTS_COLLECTION, newId, 'private', 'clinical');

      batch.set(patientDocRef, cleanFirestoreData({
        ...patientData,
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp()
      }));

      batch.set(privateDocRef, cleanFirestoreData({
        alertasMedicas: privateClinical.alertasMedicas || [],
        notasGenerales: privateClinical.notasGenerales || '',
        observacionesClinicas: privateClinical.observacionesClinicas || '',
        diagnosticos: privateClinical.diagnosticos || [],
        notasInternas: privateClinical.notasInternas || '',
        updatedAt: serverTimestamp()
      }));

      if (userDocToLink) {
        const userRef = doc(db, 'users', userDocToLink.id);
        batch.set(userRef, {
          linkedPatientId: newId,
          updatedAt: serverTimestamp()
        }, { merge: true });
        console.log(`[PATIENTS:SERVICE] Auto-vinculado atómico paciente ${newId} con usuario ${userDocToLink.id}`);
      }

      await batch.commit();
    } catch (err) {
      console.warn('[PATIENTS:SERVICE] createPatient Firestore write failed:', err);
      throw err;
    }

    // Include private fields in local memory representation for nutritionist caller
    const fullLocalPatient: Patient = {
      ...patientData,
      alertasMedicas: privateClinical.alertasMedicas || [],
      notasGenerales: privateClinical.notasGenerales || ''
    };
    this.localPatientsCache.unshift(fullLocalPatient);
    return fullLocalPatient;
  }

  /**
   * Updates an existing patient document atomically.
   * Strips ownerUid and id from update payload so ownership is completely immutable.
   * `userId` is modifiable only by the nutritionist owner for linking/unlinking.
   */
  static async updatePatient(patientId: string, data: UpdatePatientInput): Promise<void> {
    const user = await resolveAuthUser();

    // Verify ownership before modifying
    const existing = await this.getPatientById(patientId);
    if (!existing || existing.ownerUid !== user.uid) {
      throw new Error('No tienes permiso para modificar este paciente.');
    }

    // Immutable ownership: ownerUid and id must never be modified by update operations
    const { ownerUid: _ownerUid, id: _id, createdAt: _createdAt, privateClinical, ...cleanData } = data as any;
    cleanData.updatedAt = new Date().toISOString();

    // Separate private fields if passed in updatePatient payload
    const privateUpdates: Partial<PrivateClinicalData> = { ...(privateClinical || {}) };
    if (cleanData.alertasMedicas !== undefined) {
      privateUpdates.alertasMedicas = cleanData.alertasMedicas;
      delete cleanData.alertasMedicas;
    }
    if (cleanData.notasGenerales !== undefined) {
      privateUpdates.notasGenerales = cleanData.notasGenerales;
      delete cleanData.notasGenerales;
    }

    // Auto-link with existing user if email is updated
    let userDocToLink: any = null;
    if (cleanData.email && !cleanData.userId) {
      try {
        const usersCol = collection(db, 'users');
        const q = query(usersCol, where('email', '==', cleanData.email.toLowerCase().trim()));
        const snap = await getDocs(q);
        if (!snap.empty) {
          userDocToLink = snap.docs[0];
          cleanData.userId = userDocToLink.id;
        }
      } catch (linkErr) {
        console.warn('[PATIENTS:SERVICE] Auto-vincular usuario omitido:', linkErr);
      }
    }

    try {
      const batch = writeBatch(db);
      const patientDocRef = doc(db, PATIENTS_COLLECTION, patientId);

      if (Object.keys(cleanData).length > 0) {
        batch.set(patientDocRef, cleanFirestoreData({
          ...cleanData,
          updatedAt: serverTimestamp()
        }), { merge: true });
      }

      if (Object.keys(privateUpdates).length > 0) {
        const privDocRef = doc(db, PATIENTS_COLLECTION, patientId, 'private', 'clinical');
        batch.set(privDocRef, cleanFirestoreData({
          ...privateUpdates,
          updatedAt: serverTimestamp()
        }), { merge: true });
      }

      if (userDocToLink) {
        const userRef = doc(db, 'users', userDocToLink.id);
        batch.set(userRef, {
          linkedPatientId: patientId,
          updatedAt: serverTimestamp()
        }, { merge: true });
      }

      await batch.commit();
    } catch (err: any) {
      if (err?.code === 'permission-denied') {
        throw new Error('No tienes permiso para modificar este paciente.');
      }
      console.warn(`[PATIENTS:SERVICE] updatePatient(${patientId}) Firestore write failed:`, err);
      throw err;
    }

    // Update in local cache
    const idx = this.localPatientsCache.findIndex(p => p.id === patientId && p.ownerUid === user.uid);
    if (idx !== -1) {
      this.localPatientsCache[idx] = {
        ...this.localPatientsCache[idx],
        ...cleanData,
        ...(privateUpdates.alertasMedicas !== undefined ? { alertasMedicas: privateUpdates.alertasMedicas } : {}),
        ...(privateUpdates.notasGenerales !== undefined ? { notasGenerales: privateUpdates.notasGenerales } : {})
      };
    }
  }

  /**
   * Retrieves private clinical data for a patient (`pacientes/{id}/private/clinical`).
   * Independently establishes `patient.ownerUid === authenticatedUser.uid`.
   * Never accepts `userId` or caller-supplied flags as authorization.
   */
  static async getPrivateClinical(patientId: string): Promise<PrivateClinicalData | null> {
    const user = await resolveAuthUser();
    const patient = await this.getPatientById(patientId);
    if (!patient || patient.ownerUid !== user.uid) {
      return null;
    }

    try {
      const docRef = doc(db, PATIENTS_COLLECTION, patientId, 'private', 'clinical');
      const snap = await getDoc(docRef);
      if (snap.exists()) {
        return snap.data() as PrivateClinicalData;
      }
      return null;
    } catch (err: any) {
      if (err?.code === 'permission-denied') {
        return null;
      }
      console.warn(`[PATIENTS:SERVICE] getPrivateClinical(${patientId}) error:`, err);
      return null;
    }
  }

  /**
   * Updates private clinical data for a patient (`pacientes/{id}/private/clinical`).
   * Independently establishes `patient.ownerUid === authenticatedUser.uid`.
   */
  static async updatePrivateClinical(patientId: string, data: Partial<PrivateClinicalData>): Promise<void> {
    const user = await resolveAuthUser();
    const patient = await this.getPatientById(patientId);
    if (!patient || patient.ownerUid !== user.uid) {
      throw new Error('No tienes permiso para modificar la información clínica privada de este paciente.');
    }

    const docRef = doc(db, PATIENTS_COLLECTION, patientId, 'private', 'clinical');
    await setDoc(docRef, cleanFirestoreData({
      ...data,
      updatedAt: serverTimestamp()
    }), { merge: true });

    // Update local cache
    const idx = this.localPatientsCache.findIndex(p => p.id === patientId && p.ownerUid === user.uid);
    if (idx !== -1) {
      this.localPatientsCache[idx] = {
        ...this.localPatientsCache[idx],
        ...(data.alertasMedicas !== undefined ? { alertasMedicas: data.alertasMedicas } : {}),
        ...(data.notasGenerales !== undefined ? { notasGenerales: data.notasGenerales } : {})
      };
    }
  }

  /**
   * Deletes a patient document and all associated private records.
   * Requires authenticated user and verifies ownerUid strictly matches.
   */
  static async deletePatient(patientId: string): Promise<void> {
    const user = await resolveAuthUser();
    const patient = await this.getPatientById(patientId);
    if (!patient || patient.ownerUid !== user.uid) {
      throw new Error('No tienes permiso para eliminar este paciente.');
    }

    try {
      const batch = writeBatch(db);
      const docRef = doc(db, PATIENTS_COLLECTION, patientId);
      const privRef = doc(db, PATIENTS_COLLECTION, patientId, 'private', 'clinical');
      batch.delete(docRef);
      batch.delete(privRef);

      // Si el paciente estaba vinculado a un usuario, limpiar atómicamente el perfil del usuario
      // para evitar vínculos huérfanos y satisfacer la regla de seguridad estricta en delete
      if (patient.userId) {
        const userRef = doc(db, 'users', patient.userId);
        batch.update(userRef, {
          linkedPatientId: deleteField(),
          updatedAt: serverTimestamp()
        });
      }

      await batch.commit();
    } catch (err: any) {
      if (err?.code === 'permission-denied') {
        throw new Error('No tienes permiso para eliminar este paciente.');
      }
      console.warn(`[PATIENTS:SERVICE] deletePatient(${patientId}) failed:`, err);
      throw err;
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
   * Retrieves the clinical history for a patient (`pacientes/{id}/historial_clinico/main`).
   * Authorized strictly for the nutritionist owner (ownerUid).
   */
  static async getClinicalHistory(patientId: string): Promise<ClinicalHistory> {
    const user = await resolveAuthUser();
    const patient = await this.getPatientById(patientId);
    if (!patient || patient.ownerUid !== user.uid) {
      return { id: 'main', updatedAt: new Date().toISOString() };
    }

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
    const user = await resolveAuthUser();
    const patient = await this.getPatientById(patientId);
    if (!patient || patient.ownerUid !== user.uid) {
      throw new Error('No tienes permiso para modificar el historial clínico.');
    }

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
   * Gets all patient-readable appointments for a patient (`pacientes/{id}/citas`).
   * Does NOT return private SOAP notes (`notasEvolucion`).
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
   * Gets appointments with private clinical notes merged (`citas` + `citas_private`).
   * Authorized strictly for the nutritionist owner (ownerUid).
   */
  static async getAppointmentsWithPrivate(patientId: string): Promise<PatientAppointment[]> {
    const user = await resolveAuthUser();
    const patient = await this.getPatientById(patientId);
    if (!patient || patient.ownerUid !== user.uid) {
      return this.getAppointments(patientId);
    }

    const appointments = await this.getAppointments(patientId);
    try {
      const privCol = collection(db, PATIENTS_COLLECTION, patientId, 'citas_private');
      const snap = await getDocs(privCol);
      if (!snap.empty) {
        const privMap = new Map(snap.docs.map(d => [d.id, d.data()]));
        return appointments.map(apt => {
          const priv = privMap.get(apt.id);
          return priv ? { ...apt, ...priv } : apt;
        });
      }
    } catch (err) {
      console.warn(`[PATIENTS:SERVICE] getAppointmentsWithPrivate(${patientId}) private read error:`, err);
    }
    return appointments;
  }

  /**
   * Creates a new appointment using an ATOMIC batch write:
   * 1. Shared record: `pacientes/{id}/citas/{aptId}` (patient-readable)
   * 2. Private notes: `pacientes/{id}/citas_private/{aptId}` (SOAP / nutritionist-only)
   */
  static async createAppointment(
    patientId: string,
    appointment: Omit<PatientAppointment, 'id' | 'createdAt' | 'updatedAt'> & {
      observacionesClinicas?: string;
      notasInternas?: string;
    }
  ): Promise<PatientAppointment> {
    const user = await resolveAuthUser();
    const patient = await this.getPatientById(patientId);
    if (!patient || patient.ownerUid !== user.uid) {
      throw new Error('No tienes permiso para crear citas para este paciente.');
    }

    const newId = `apt_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`;
    const { notasEvolucion, observacionesClinicas, notasInternas, ...sharedInput } = appointment as any;

    const aptData: PatientAppointment = {
      ...sharedInput,
      notasEvolucion: notasEvolucion || '',
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
      const batch = writeBatch(db);
      const aptDocRef = doc(db, PATIENTS_COLLECTION, patientId, 'citas', newId);
      const privDocRef = doc(db, PATIENTS_COLLECTION, patientId, 'citas_private', newId);

      batch.set(aptDocRef, cleanFirestoreData({
        ...sharedInput,
        id: newId,
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp()
      }));

      batch.set(privDocRef, cleanFirestoreData({
        notasEvolucion: notasEvolucion || '',
        observacionesClinicas: observacionesClinicas || '',
        notasInternas: notasInternas || '',
        updatedAt: serverTimestamp()
      }));

      await batch.commit();
    } catch (err) {
      console.warn(`[PATIENTS:SERVICE] createAppointment(${patientId}) Firestore batch write failed:`, err);
    }

    return aptData;
  }

  /**
   * Updates an existing appointment using an ATOMIC batch write:
   * Updates `citas/{id}` and `citas_private/{id}` simultaneously.
   */
  static async updateAppointment(
    patientId: string,
    appointmentId: string,
    data: Partial<PatientAppointment> & {
      observacionesClinicas?: string;
      notasInternas?: string;
    }
  ): Promise<void> {
    const user = await resolveAuthUser();
    const patient = await this.getPatientById(patientId);
    if (!patient || patient.ownerUid !== user.uid) {
      throw new Error('No tienes permiso para modificar citas de este paciente.');
    }

    const { notasEvolucion, observacionesClinicas, notasInternas, ...sharedUpdates } = data as any;

    const currentApts = this.localAppointmentsCache[patientId] || [];
    const idx = currentApts.findIndex(a => a.id === appointmentId);
    if (idx !== -1) {
      currentApts[idx] = { ...currentApts[idx], ...data, updatedAt: new Date().toISOString() };
      this.localAppointmentsCache[patientId] = [...currentApts];
      this.saveToStorage(this.getStorageKey('citas', patientId), currentApts);
    }

    try {
      const batch = writeBatch(db);
      const aptDocRef = doc(db, PATIENTS_COLLECTION, patientId, 'citas', appointmentId);
      const privDocRef = doc(db, PATIENTS_COLLECTION, patientId, 'citas_private', appointmentId);

      if (Object.keys(sharedUpdates).length > 0) {
        batch.set(aptDocRef, cleanFirestoreData({
          ...sharedUpdates,
          updatedAt: serverTimestamp()
        }), { merge: true });
      }

      if (notasEvolucion !== undefined || observacionesClinicas !== undefined || notasInternas !== undefined) {
        batch.set(privDocRef, cleanFirestoreData({
          ...(notasEvolucion !== undefined ? { notasEvolucion } : {}),
          ...(observacionesClinicas !== undefined ? { observacionesClinicas } : {}),
          ...(notasInternas !== undefined ? { notasInternas } : {}),
          updatedAt: serverTimestamp()
        }), { merge: true });
      }

      await batch.commit();
    } catch (err) {
      console.warn(`[PATIENTS:SERVICE] updateAppointment(${patientId}, ${appointmentId}) Firestore write failed:`, err);
    }
  }

  /**
   * Deletes an appointment and its associated private notes using an ATOMIC batch write.
   */
  static async deleteAppointment(patientId: string, appointmentId: string): Promise<void> {
    const user = await resolveAuthUser();
    const patient = await this.getPatientById(patientId);
    if (!patient || patient.ownerUid !== user.uid) {
      throw new Error('No tienes permiso para eliminar citas de este paciente.');
    }

    const currentApts = this.localAppointmentsCache[patientId] || [];
    this.localAppointmentsCache[patientId] = currentApts.filter(a => a.id !== appointmentId);
    this.saveToStorage(this.getStorageKey('citas', patientId), this.localAppointmentsCache[patientId]);

    try {
      const batch = writeBatch(db);
      batch.delete(doc(db, PATIENTS_COLLECTION, patientId, 'citas', appointmentId));
      batch.delete(doc(db, PATIENTS_COLLECTION, patientId, 'citas_private', appointmentId));
      await batch.commit();
    } catch (err) {
      console.warn(`[PATIENTS:SERVICE] deleteAppointment(${patientId}, ${appointmentId}) failed:`, err);
    }
  }

  // =========================================================================
  // 4. MEASUREMENTS & ANTHROPOMETRY SUBCOLLECTION
  // =========================================================================

  /**
   * Gets all patient-readable measurements for a patient (`pacientes/{id}/mediciones`).
   * Does NOT return private consultation notes (`notasConsulta`).
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
   * Gets measurements with private clinical notes merged (`mediciones` + `mediciones_private`).
   * Authorized strictly for the nutritionist owner (ownerUid).
   */
  static async getMeasurementsWithPrivate(patientId: string): Promise<PatientMeasurement[]> {
    const user = await resolveAuthUser();
    const patient = await this.getPatientById(patientId);
    if (!patient || patient.ownerUid !== user.uid) {
      return this.getMeasurements(patientId);
    }

    const measurements = await this.getMeasurements(patientId);
    try {
      const privCol = collection(db, PATIENTS_COLLECTION, patientId, 'mediciones_private');
      const snap = await getDocs(privCol);
      if (!snap.empty) {
        const privMap = new Map(snap.docs.map(d => [d.id, d.data()]));
        return measurements.map(m => {
          const priv = privMap.get(m.id);
          return priv ? { ...m, ...priv } : m;
        });
      }
    } catch (err) {
      console.warn(`[PATIENTS:SERVICE] getMeasurementsWithPrivate(${patientId}) private read error:`, err);
    }
    return measurements;
  }

  /**
   * Adds a single measurement record using an ATOMIC batch write:
   * 1. Shared record: `pacientes/{id}/mediciones/{measId}` (patient-readable)
   * 2. Private notes: `pacientes/{id}/mediciones_private/{measId}` (consultation notes / nutritionist-only)
   */
  static async addMeasurement(
    patientId: string,
    record: Omit<ClinicalRecord, 'id'> & {
      notasConsulta?: string;
      observacionesClinicas?: string;
      notasInternas?: string;
    }
  ): Promise<PatientMeasurement> {
    const user = await resolveAuthUser();
    const patient = await this.getPatientById(patientId);
    if (!patient || patient.ownerUid !== user.uid) {
      throw new Error('No tienes permiso para agregar mediciones a este paciente.');
    }

    const newId = `meas_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`;
    const { notasConsulta, observacionesClinicas, notasInternas, ...sharedRecord } = record as any;

    const measurement: PatientMeasurement = {
      ...sharedRecord,
      notasConsulta: notasConsulta || '',
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
      const batch = writeBatch(db);
      const measDocRef = doc(db, PATIENTS_COLLECTION, patientId, 'mediciones', newId);
      const privDocRef = doc(db, PATIENTS_COLLECTION, patientId, 'mediciones_private', newId);

      batch.set(measDocRef, cleanFirestoreData({
        ...sharedRecord,
        id: newId,
        createdAt: serverTimestamp()
      }));

      batch.set(privDocRef, cleanFirestoreData({
        notasConsulta: notasConsulta || '',
        observacionesClinicas: observacionesClinicas || '',
        notasInternas: notasInternas || '',
        updatedAt: serverTimestamp()
      }));

      await batch.commit();
    } catch (err) {
      console.warn(`[PATIENTS:SERVICE] addMeasurement(${patientId}) Firestore batch write failed:`, err);
    }

    return measurement;
  }

  /**
   * Updates an existing measurement using an ATOMIC batch write:
   * Updates `mediciones/{id}` and `mediciones_private/{id}` simultaneously.
   */
  static async updateMeasurement(
    patientId: string,
    measurementId: string,
    record: Partial<ClinicalRecord> & {
      notasConsulta?: string;
      observacionesClinicas?: string;
      notasInternas?: string;
    }
  ): Promise<void> {
    const user = await resolveAuthUser();
    const patient = await this.getPatientById(patientId);
    if (!patient || patient.ownerUid !== user.uid) {
      throw new Error('No tienes permiso para modificar mediciones de este paciente.');
    }

    const { notasConsulta, observacionesClinicas, notasInternas, ...sharedUpdates } = record as any;

    const currentList = this.localMeasurementsCache[patientId] || [];
    const idx = currentList.findIndex(m => m.id === measurementId);
    if (idx !== -1) {
      currentList[idx] = { ...currentList[idx], ...record };
      this.localMeasurementsCache[patientId] = [...currentList];
      this.saveToStorage(this.getStorageKey('mediciones', patientId), currentList);
    }

    try {
      const batch = writeBatch(db);
      const measDocRef = doc(db, PATIENTS_COLLECTION, patientId, 'mediciones', measurementId);
      const privDocRef = doc(db, PATIENTS_COLLECTION, patientId, 'mediciones_private', measurementId);

      if (Object.keys(sharedUpdates).length > 0) {
        batch.set(measDocRef, cleanFirestoreData({ ...sharedUpdates }), { merge: true });
      }

      if (notasConsulta !== undefined || observacionesClinicas !== undefined || notasInternas !== undefined) {
        batch.set(privDocRef, cleanFirestoreData({
          ...(notasConsulta !== undefined ? { notasConsulta } : {}),
          ...(observacionesClinicas !== undefined ? { observacionesClinicas } : {}),
          ...(notasInternas !== undefined ? { notasInternas } : {}),
          updatedAt: serverTimestamp()
        }), { merge: true });
      }

      await batch.commit();
    } catch (err) {
      console.warn(`[PATIENTS:SERVICE] updateMeasurement(${patientId}, ${measurementId}) Firestore write failed:`, err);
    }
  }

  /**
   * Deletes a measurement and its associated private notes using an ATOMIC batch write.
   */
  static async deleteMeasurement(patientId: string, measurementId: string): Promise<void> {
    const user = await resolveAuthUser();
    const patient = await this.getPatientById(patientId);
    if (!patient || patient.ownerUid !== user.uid) {
      throw new Error('No tienes permiso para eliminar mediciones de este paciente.');
    }

    const currentList = this.localMeasurementsCache[patientId] || [];
    this.localMeasurementsCache[patientId] = currentList.filter(m => m.id !== measurementId);
    this.saveToStorage(this.getStorageKey('mediciones', patientId), this.localMeasurementsCache[patientId]);

    try {
      const batch = writeBatch(db);
      batch.delete(doc(db, PATIENTS_COLLECTION, patientId, 'mediciones', measurementId));
      batch.delete(doc(db, PATIENTS_COLLECTION, patientId, 'mediciones_private', measurementId));
      await batch.commit();
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
        const sorted = this.sortDietPlans(plans);
        this.localDietPlansCache[patientId] = sorted;
        this.saveToStorage(this.getStorageKey('planes', patientId), sorted);
        return sorted;
      }
    } catch (err) {
      console.warn(`[PATIENTS:SERVICE] getPatientDietPlans(${patientId}) Firestore read failed, using cache fallback:`, err);
    }

    if (this.localDietPlansCache[patientId]) return this.sortDietPlans(this.localDietPlansCache[patientId]);
    const stored = this.loadFromStorage<PatientDietPlan[]>(this.getStorageKey('planes', patientId));
    if (stored && stored.length > 0) {
      const sorted = this.sortDietPlans(stored);
      this.localDietPlansCache[patientId] = sorted;
      return sorted;
    }

    const seed = SEED_PATIENTS.find(s => s.patient.id === patientId);
    return seed ? this.sortDietPlans(seed.dietPlans) : [];
  }

  /**
   * Ordena los planes nutricionales: primero el activo, luego por fecha más reciente
   */
  public static sortDietPlans(plans: PatientDietPlan[]): PatientDietPlan[] {
    return [...plans].sort((a, b) => {
      // 1. Plan activo siempre primero
      if (a.status === 'activo' && b.status !== 'activo') return -1;
      if (a.status !== 'activo' && b.status === 'activo') return 1;
      // 2. Orden descendente por fecha de asignación o creación
      const dateA = new Date(a.fechaAsignacion || a.createdAt || 0).getTime();
      const dateB = new Date(b.fechaAsignacion || b.createdAt || 0).getTime();
      return dateB - dateA;
    });
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
      this.localDietPlansCache[patientId] = this.sortDietPlans([...currentPlans]);
    } else {
      this.localDietPlansCache[patientId] = this.sortDietPlans([fullPlan, ...currentPlans]);
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
    const user = await resolveAuthUser();
    const patient = await this.getPatientById(patientId);
    if (!patient || patient.ownerUid !== user.uid) {
      return [];
    }

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
    const user = await resolveAuthUser();
    const patient = await this.getPatientById(patientId);
    if (!patient || patient.ownerUid !== user.uid) {
      throw new Error('No tienes permiso para guardar archivos en este paciente.');
    }

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

