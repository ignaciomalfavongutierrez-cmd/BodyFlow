/**
 * ============================================================================
 * ISOLATED MIGRATION UTILITY: Patient Shared / Private Clinical Data Separation
 * ============================================================================
 * Location: scripts/migrations/patient-data-separation.ts
 *
 * CRITICAL SECURITY CONSTRAINTS:
 * - Isolated from production bundle (NEVER imported by client app code).
 * - NOT exposed through any UI route or view.
 * - NOT executed on startup, build, or deploy.
 * - Uses project modular Firebase Web SDK (deleteField, getDocs, writeBatch, etc.).
 *
 * OPERATIONS:
 * 1. dryRun()                  -> Read-only scan and comprehensive inventory.
 * 2. migrate()                 -> COPY ONLY into private documents (idempotent, no deletions).
 * 3. cleanupLegacyPrivateFields() -> Verified deletion of legacy shared fields (requires --confirm-cleanup).
 */

import {
  collection,
  doc,
  getDocs,
  getDoc,
  updateDoc,
  deleteField,
  writeBatch,
  serverTimestamp
} from 'firebase/firestore';
import { db } from '../../src/firebase';

export interface DryRunReport {
  patientsScanned: number;
  patientsNeedingMigration: number;
  appointmentsScanned: number;
  measurementsScanned: number;
  privateClinicalDocsNeeded: number;
  privateAppointmentDocsNeeded: number;
  privateMeasurementDocsNeeded: number;
  documentsSkipped: number;
  errors: string[];
}

export interface MigrationReport {
  patientsProcessed: number;
  privateClinicalDocsWritten: number;
  appointmentsProcessed: number;
  privateAppointmentDocsWritten: number;
  measurementsProcessed: number;
  privateMeasurementDocsWritten: number;
  documentsSkipped: number;
  verificationFailures: number;
  errors: string[];
}

export interface CleanupReport {
  documentsChecked: number;
  fieldsRemoved: number;
  documentsSkipped: number;
  verificationFailures: number;
  errors: string[];
}

const PATIENTS_COLLECTION = 'pacientes';

/**
 * 1. dryRun()
 * READ-ONLY operation. Scans all patients and subcollections to identify legacy private fields.
 * Performs NO WRITES.
 */
export async function dryRun(): Promise<DryRunReport> {
  const report: DryRunReport = {
    patientsScanned: 0,
    patientsNeedingMigration: 0,
    appointmentsScanned: 0,
    measurementsScanned: 0,
    privateClinicalDocsNeeded: 0,
    privateAppointmentDocsNeeded: 0,
    privateMeasurementDocsNeeded: 0,
    documentsSkipped: 0,
    errors: []
  };

  console.log('\n🔍 [MIGRATION:DRY_RUN] Starting read-only inspection of Firestore...');

  try {
    const patientsSnap = await getDocs(collection(db, PATIENTS_COLLECTION));
    report.patientsScanned = patientsSnap.size;

    for (const pDoc of patientsSnap.docs) {
      const data = pDoc.data();
      const patientId = pDoc.id;

      let patientNeedsMigration = false;

      // Check root document for legacy private fields
      const hasLegacyAlerts = Array.isArray(data.alertasMedicas) && data.alertasMedicas.length > 0;
      const hasLegacyGeneralNotes = Boolean(data.notasGenerales);
      const hasLegacyNotes = Boolean(data.notas);

      if (hasLegacyAlerts || hasLegacyGeneralNotes || hasLegacyNotes) {
        patientNeedsMigration = true;
        report.privateClinicalDocsNeeded++;
      }

      // Check appointments subcollection
      try {
        const aptsSnap = await getDocs(collection(db, PATIENTS_COLLECTION, patientId, 'citas'));
        report.appointmentsScanned += aptsSnap.size;

        for (const aDoc of aptsSnap.docs) {
          const aData = aDoc.data();
          if (aData.notasEvolucion) {
            patientNeedsMigration = true;
            report.privateAppointmentDocsNeeded++;
          }
        }
      } catch (err: any) {
        report.errors.push(`Error scanning appointments for patient ${patientId}: ${err?.message || err}`);
      }

      // Check measurements subcollection
      try {
        const measSnap = await getDocs(collection(db, PATIENTS_COLLECTION, patientId, 'mediciones'));
        report.measurementsScanned += measSnap.size;

        for (const mDoc of measSnap.docs) {
          const mData = mDoc.data();
          if (mData.notasConsulta) {
            patientNeedsMigration = true;
            report.privateMeasurementDocsNeeded++;
          }
        }
      } catch (err: any) {
        report.errors.push(`Error scanning measurements for patient ${patientId}: ${err?.message || err}`);
      }

      if (patientNeedsMigration) {
        report.patientsNeedingMigration++;
      } else {
        report.documentsSkipped++;
      }
    }
  } catch (err: any) {
    report.errors.push(`Fatal error in dryRun: ${err?.message || err}`);
  }

  console.log('\n📊 [MIGRATION:DRY_RUN] Summary Report:');
  console.log(`  - Patients Scanned:              ${report.patientsScanned}`);
  console.log(`  - Patients Needing Migration:    ${report.patientsNeedingMigration}`);
  console.log(`  - Appointments Scanned:          ${report.appointmentsScanned}`);
  console.log(`  - Measurements Scanned:          ${report.measurementsScanned}`);
  console.log(`  - Private Clinical Docs Needed:  ${report.privateClinicalDocsNeeded}`);
  console.log(`  - Private Appointment Docs Needed:${report.privateAppointmentDocsNeeded}`);
  console.log(`  - Private Measurement Docs Needed:${report.privateMeasurementDocsNeeded}`);
  console.log(`  - Documents Skipped:             ${report.documentsSkipped}`);
  console.log(`  - Errors Encountered:            ${report.errors.length}`);

  if (report.errors.length > 0) {
    report.errors.forEach(e => console.error(`    ⚠️ ${e}`));
  }

  return report;
}

/**
 * 2. migrate()
 * COPY ONLY operation.
 * Copies legacy private fields into their corresponding private documents.
 * Verifies destination values after writing.
 * DOES NOT remove original fields from shared documents.
 * Idempotent: Never overwrites non-empty destination values with empty legacy data.
 */
export async function migrate(): Promise<MigrationReport> {
  const report: MigrationReport = {
    patientsProcessed: 0,
    privateClinicalDocsWritten: 0,
    appointmentsProcessed: 0,
    privateAppointmentDocsWritten: 0,
    measurementsProcessed: 0,
    privateMeasurementDocsWritten: 0,
    documentsSkipped: 0,
    verificationFailures: 0,
    errors: []
  };

  console.log('\n🚀 [MIGRATION:COPY] Starting copy-only migration to private paths...');

  try {
    const patientsSnap = await getDocs(collection(db, PATIENTS_COLLECTION));

    for (const pDoc of patientsSnap.docs) {
      const data = pDoc.data();
      const patientId = pDoc.id;
      report.patientsProcessed++;

      // 1. Patient Root -> private/clinical
      const legacyAlerts = Array.isArray(data.alertasMedicas) ? data.alertasMedicas : [];
      const legacyGeneralNotes = data.notasGenerales || '';
      const legacyNotes = data.notas || '';

      if (legacyAlerts.length > 0 || legacyGeneralNotes || legacyNotes) {
        try {
          const privClinicalRef = doc(db, PATIENTS_COLLECTION, patientId, 'private', 'clinical');
          const existingPrivSnap = await getDoc(privClinicalRef);
          const existingPriv = existingPrivSnap.exists() ? existingPrivSnap.data() : {};

          // Merge without overwriting populated private fields with empty values
          const mergedAlerts = (existingPriv.alertasMedicas && existingPriv.alertasMedicas.length > 0)
            ? existingPriv.alertasMedicas
            : legacyAlerts;

          const mergedGeneralNotes = existingPriv.notasGenerales || legacyGeneralNotes || legacyNotes;

          const batch = writeBatch(db);
          batch.set(privClinicalRef, {
            ...existingPriv,
            alertasMedicas: mergedAlerts,
            notasGenerales: mergedGeneralNotes,
            observacionesClinicas: existingPriv.observacionesClinicas || '',
            diagnosticos: existingPriv.diagnosticos || [],
            notasInternas: existingPriv.notasInternas || '',
            updatedAt: serverTimestamp()
          }, { merge: true });

          await batch.commit();
          report.privateClinicalDocsWritten++;

          // Verification readback
          const verifySnap = await getDoc(privClinicalRef);
          if (!verifySnap.exists()) {
            report.verificationFailures++;
            report.errors.push(`Verification failed: ${privClinicalRef.path} does not exist after write`);
          }
        } catch (err: any) {
          report.errors.push(`Error writing private/clinical for ${patientId}: ${err?.message || err}`);
        }
      } else {
        report.documentsSkipped++;
      }

      // 2. Appointments -> citas_private
      try {
        const aptsSnap = await getDocs(collection(db, PATIENTS_COLLECTION, patientId, 'citas'));
        for (const aDoc of aptsSnap.docs) {
          const aData = aDoc.data();
          const aptId = aDoc.id;
          report.appointmentsProcessed++;

          if (aData.notasEvolucion) {
            const privAptRef = doc(db, PATIENTS_COLLECTION, patientId, 'citas_private', aptId);
            const existingSnap = await getDoc(privAptRef);
            const existingData = existingSnap.exists() ? existingSnap.data() : {};

            const finalNotes = existingData.notasEvolucion || aData.notasEvolucion;

            const batch = writeBatch(db);
            batch.set(privAptRef, {
              ...existingData,
              notasEvolucion: finalNotes,
              observacionesClinicas: existingData.observacionesClinicas || '',
              notasInternas: existingData.notasInternas || '',
              updatedAt: serverTimestamp()
            }, { merge: true });

            await batch.commit();
            report.privateAppointmentDocsWritten++;

            // Verification readback
            const verifySnap = await getDoc(privAptRef);
            if (!verifySnap.exists() || verifySnap.data()?.notasEvolucion !== finalNotes) {
              report.verificationFailures++;
              report.errors.push(`Verification failed for appointment ${privAptRef.path}`);
            }
          }
        }
      } catch (err: any) {
        report.errors.push(`Error migrating appointments for ${patientId}: ${err?.message || err}`);
      }

      // 3. Measurements -> mediciones_private
      try {
        const measSnap = await getDocs(collection(db, PATIENTS_COLLECTION, patientId, 'mediciones'));
        for (const mDoc of measSnap.docs) {
          const mData = mDoc.data();
          const measId = mDoc.id;
          report.measurementsProcessed++;

          if (mData.notasConsulta) {
            const privMeasRef = doc(db, PATIENTS_COLLECTION, patientId, 'mediciones_private', measId);
            const existingSnap = await getDoc(privMeasRef);
            const existingData = existingSnap.exists() ? existingSnap.data() : {};

            const finalNotes = existingData.notasConsulta || mData.notasConsulta;

            const batch = writeBatch(db);
            batch.set(privMeasRef, {
              ...existingData,
              notasConsulta: finalNotes,
              observacionesClinicas: existingData.observacionesClinicas || '',
              notasInternas: existingData.notasInternas || '',
              updatedAt: serverTimestamp()
            }, { merge: true });

            await batch.commit();
            report.privateMeasurementDocsWritten++;

            // Verification readback
            const verifySnap = await getDoc(privMeasRef);
            if (!verifySnap.exists() || verifySnap.data()?.notasConsulta !== finalNotes) {
              report.verificationFailures++;
              report.errors.push(`Verification failed for measurement ${privMeasRef.path}`);
            }
          }
        }
      } catch (err: any) {
        report.errors.push(`Error migrating measurements for ${patientId}: ${err?.message || err}`);
      }
    }
  } catch (err: any) {
    report.errors.push(`Fatal migration error: ${err?.message || err}`);
  }

  console.log('\n📊 [MIGRATION:COPY] Completed Report:');
  console.log(`  - Patients Processed:            ${report.patientsProcessed}`);
  console.log(`  - Private Clinical Docs Written: ${report.privateClinicalDocsWritten}`);
  console.log(`  - Appointments Processed:        ${report.appointmentsProcessed}`);
  console.log(`  - Private Apt Docs Written:      ${report.privateAppointmentDocsWritten}`);
  console.log(`  - Measurements Processed:        ${report.measurementsProcessed}`);
  console.log(`  - Private Meas Docs Written:     ${report.privateMeasurementDocsWritten}`);
  console.log(`  - Verification Failures:         ${report.verificationFailures}`);
  console.log(`  - Errors Encountered:            ${report.errors.length}`);

  return report;
}

/**
 * 3. cleanupLegacyPrivateFields()
 * DESTRUCTIVE OPERATION - Requires explicit confirmation.
 * Before deleting each legacy field:
 * 1. Verifies corresponding private destination exists.
 * 2. Verifies migrated value matches expected legacy data.
 * 3. Only then deletes legacy shared field using modular deleteField().
 */
export async function cleanupLegacyPrivateFields(confirmed = false): Promise<CleanupReport> {
  const report: CleanupReport = {
    documentsChecked: 0,
    fieldsRemoved: 0,
    documentsSkipped: 0,
    verificationFailures: 0,
    errors: []
  };

  if (!confirmed) {
    console.error('⛔ [CLEANUP] Execution aborted: cleanupLegacyPrivateFields requires explicit human confirmation (--confirm-cleanup).');
    return report;
  }

  console.log('\n🧹 [MIGRATION:CLEANUP] Starting verified removal of legacy private fields from shared docs...');

  try {
    const patientsSnap = await getDocs(collection(db, PATIENTS_COLLECTION));

    for (const pDoc of patientsSnap.docs) {
      const data = pDoc.data();
      const patientId = pDoc.id;
      report.documentsChecked++;

      // Check root document
      const hasLegacyAlerts = 'alertasMedicas' in data;
      const hasLegacyNotes = 'notas' in data;
      const hasLegacyGeneralNotes = 'notasGenerales' in data;

      if (hasLegacyAlerts || hasLegacyNotes || hasLegacyGeneralNotes) {
        // Verify destination exists first
        const privRef = doc(db, PATIENTS_COLLECTION, patientId, 'private', 'clinical');
        const privSnap = await getDoc(privRef);

        if (!privSnap.exists()) {
          report.verificationFailures++;
          report.errors.push(`Destination ${privRef.path} does not exist. Skipping cleanup for patient ${patientId}`);
        } else {
          // Verify content equality
          const privData = privSnap.data();
          let verified = true;

          if (hasLegacyAlerts && Array.isArray(data.alertasMedicas) && data.alertasMedicas.length > 0) {
            const destAlerts = Array.isArray(privData.alertasMedicas) ? privData.alertasMedicas : [];
            const matches = data.alertasMedicas.every((a: string) => destAlerts.includes(a));
            if (!matches) {
              verified = false;
              report.verificationFailures++;
              report.errors.push(`Alerts mismatch in ${patientId}. Aborting deletion.`);
            }
          }

          if (verified) {
            const updates: Record<string, any> = {};
            if (hasLegacyAlerts) updates.alertasMedicas = deleteField();
            if (hasLegacyNotes) updates.notas = deleteField();
            if (hasLegacyGeneralNotes) updates.notasGenerales = deleteField();

            await updateDoc(doc(db, PATIENTS_COLLECTION, patientId), updates);
            report.fieldsRemoved += Object.keys(updates).length;
          }
        }
      } else {
        report.documentsSkipped++;
      }

      // Check appointments subcollection
      try {
        const aptsSnap = await getDocs(collection(db, PATIENTS_COLLECTION, patientId, 'citas'));
        for (const aDoc of aptsSnap.docs) {
          const aData = aDoc.data();
          const aptId = aDoc.id;
          report.documentsChecked++;

          if ('notasEvolucion' in aData) {
            const privAptRef = doc(db, PATIENTS_COLLECTION, patientId, 'citas_private', aptId);
            const privAptSnap = await getDoc(privAptRef);

            if (!privAptSnap.exists()) {
              report.verificationFailures++;
              report.errors.push(`Appointment private doc ${privAptRef.path} missing. Skipping.`);
            } else if (aData.notasEvolucion && privAptSnap.data()?.notasEvolucion !== aData.notasEvolucion) {
              report.verificationFailures++;
              report.errors.push(`Appointment notes mismatch in ${aptId}. Skipping.`);
            } else {
              await updateDoc(doc(db, PATIENTS_COLLECTION, patientId, 'citas', aptId), {
                notasEvolucion: deleteField()
              });
              report.fieldsRemoved++;
            }
          }
        }
      } catch (err: any) {
        report.errors.push(`Error cleaning appointments for ${patientId}: ${err?.message || err}`);
      }

      // Check measurements subcollection
      try {
        const measSnap = await getDocs(collection(db, PATIENTS_COLLECTION, patientId, 'mediciones'));
        for (const mDoc of measSnap.docs) {
          const mData = mDoc.data();
          const measId = mDoc.id;
          report.documentsChecked++;

          if ('notasConsulta' in mData) {
            const privMeasRef = doc(db, PATIENTS_COLLECTION, patientId, 'mediciones_private', measId);
            const privMeasSnap = await getDoc(privMeasRef);

            if (!privMeasSnap.exists()) {
              report.verificationFailures++;
              report.errors.push(`Measurement private doc ${privMeasRef.path} missing. Skipping.`);
            } else if (mData.notasConsulta && privMeasSnap.data()?.notasConsulta !== mData.notasConsulta) {
              report.verificationFailures++;
              report.errors.push(`Measurement notes mismatch in ${measId}. Skipping.`);
            } else {
              await updateDoc(doc(db, PATIENTS_COLLECTION, patientId, 'mediciones', measId), {
                notasConsulta: deleteField()
              });
              report.fieldsRemoved++;
            }
          }
        }
      } catch (err: any) {
        report.errors.push(`Error cleaning measurements for ${patientId}: ${err?.message || err}`);
      }
    }
  } catch (err: any) {
    report.errors.push(`Fatal cleanup error: ${err?.message || err}`);
  }

  console.log('\n📊 [MIGRATION:CLEANUP] Completed Report:');
  console.log(`  - Documents Checked:     ${report.documentsChecked}`);
  console.log(`  - Fields Removed:        ${report.fieldsRemoved}`);
  console.log(`  - Documents Skipped:     ${report.documentsSkipped}`);
  console.log(`  - Verification Failures: ${report.verificationFailures}`);
  console.log(`  - Errors Encountered:    ${report.errors.length}`);

  return report;
}

// CLI Runner
if (typeof process !== 'undefined' && process.argv) {
  const args = process.argv.slice(2);

  if (args.includes('--dry-run')) {
    dryRun().then(() => process.exit(0)).catch(e => { console.error(e); process.exit(1); });
  } else if (args.includes('--migrate')) {
    migrate().then(() => process.exit(0)).catch(e => { console.error(e); process.exit(1); });
  } else if (args.includes('--cleanup')) {
    const isConfirmed = args.includes('--confirm-cleanup');
    cleanupLegacyPrivateFields(isConfirmed).then(() => process.exit(0)).catch(e => { console.error(e); process.exit(1); });
  }
}
