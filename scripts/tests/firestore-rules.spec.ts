/**
 * ============================================================================
 * FIRESTORE SECURITY RULES (v2) REAL ENGINE SPECIFICATION & TEST SUITE
 * ============================================================================
 *
 * This test suite utilizes the official @firebase/rules-unit-testing package
 * to execute real Firestore Rules evaluation against the Firebase Local Emulator Suite.
 *
 * ⚠️ EXECUTION NOTE:
 * In accordance with repository safety constraints, no packages were installed
 * during this phase. Once the controlled package-manager phase is initiated,
 * install the required dependencies and run with:
 *
 *   npm install -D @firebase/rules-unit-testing mocha tsx
 *   npx firebase emulators:exec --only firestore "npx tsx scripts/tests/firestore-rules.spec.ts"
 */

import {
  initializeTestEnvironment,
  assertFails,
  assertSucceeds,
  RulesTestEnvironment
} from '@firebase/rules-unit-testing';
import * as fs from 'fs';
import * as path from 'path';
import {
  doc,
  getDoc,
  getDocs,
  setDoc,
  updateDoc,
  deleteDoc,
  collection,
  query,
  where,
  writeBatch,
  deleteField
} from 'firebase/firestore';

const PROJECT_ID = 'bodyflow-rules-test';
let testEnv: RulesTestEnvironment;

async function setupEnvironment() {
  const rulesPath = path.resolve(__dirname, '../../firestore.rules');
  const rules = fs.readFileSync(rulesPath, 'utf8');

  testEnv = await initializeTestEnvironment({
    projectId: PROJECT_ID,
    firestore: {
      rules,
      host: '127.0.0.1',
      port: 8080
    }
  });
}

// ----------------------------------------------------------------------------
// TEST SUITES
// ----------------------------------------------------------------------------

export async function runFirestoreRulesEngineTests() {
  console.log('================================================================');
  console.log(' STARTING REAL FIRESTORE RULES ENGINE VERIFICATION');
  console.log('================================================================\n');

  await setupEnvironment();

  const authenticatedNutriUid = 'nutri_pro_123';
  const otherNutriUid = 'nutri_stranger_456';
  const patientUserUid = 'patient_user_789';
  const strangerUserUid = 'stranger_user_000';

  // Helper context providers
  const getNutriDb = () => testEnv.authenticatedContext(authenticatedNutriUid).firestore();
  const getOtherNutriDb = () => testEnv.authenticatedContext(otherNutriUid).firestore();
  const getPatientDb = () => testEnv.authenticatedContext(patientUserUid).firestore();
  const getStrangerDb = () => testEnv.authenticatedContext(strangerUserUid).firestore();
  const getAnonDb = () => testEnv.unauthenticatedContext().firestore();

  // Seed Profiles using Admin / Test Context
  await testEnv.withSecurityRulesDisabled(async (context) => {
    const adminDb = context.firestore();

    // 1. Nutritionist User Profile
    await setDoc(doc(adminDb, 'users', authenticatedNutriUid), {
      name: 'Dra. Nutri',
      email: 'nutri@bodyflow.com',
      role: 'nutritionist',
      createdAt: new Date().toISOString()
    });

    // 2. Other Nutritionist Profile
    await setDoc(doc(adminDb, 'users', otherNutriUid), {
      name: 'Dr. Other',
      email: 'other@bodyflow.com',
      role: 'nutritionist',
      createdAt: new Date().toISOString()
    });

    // 3. Patient User Profile
    await setDoc(doc(adminDb, 'users', patientUserUid), {
      name: 'Paciente Uno',
      email: 'paciente1@gmail.com',
      role: 'patient',
      createdAt: new Date().toISOString()
    });

    // 4. Stranger User Profile
    await setDoc(doc(adminDb, 'users', strangerUserUid), {
      name: 'Usuario Ajeno',
      email: 'ajeno@gmail.com',
      role: 'patient',
      createdAt: new Date().toISOString()
    });
  });

  console.log('✓ Test fixtures successfully seeded.');

  // ==========================================================================
  // 1. USERS & PERSONAL TRACKING
  // ==========================================================================
  console.log('\n[1. Testing Users & Personal Tracking Isolation]');

  // 1.1 User reads own profile -> ALLOW
  await assertSucceeds(
    getDoc(doc(getPatientDb(), 'users', patientUserUid)),
    'Patient should be allowed to read their own profile'
  );
  console.log('  ✓ Patient reads own profile -> ALLOW');

  // 1.2 User reads another user profile -> DENY
  await assertFails(
    getDoc(doc(getPatientDb(), 'users', strangerUserUid)),
    'Patient should NOT be allowed to read another user profile'
  );
  console.log('  ✓ Patient reads another user profile -> DENY');

  // 1.3 Nutritionist reads another user profile -> DENY
  await assertFails(
    getDoc(doc(getNutriDb(), 'users', strangerUserUid)),
    'Nutritionist should NOT have global read access to other user profiles'
  );
  console.log('  ✓ Nutritionist reads unrelated user profile -> DENY');

  // 1.4 User self-update modifying role -> DENY
  await assertFails(
    updateDoc(doc(getPatientDb(), 'users', patientUserUid), {
      role: 'nutritionist'
    }),
    'User must not be able to escalate role'
  );
  console.log('  ✓ User self-escalating role to nutritionist -> DENY');

  // 1.5 User self-update modifying linkedPatientId -> DENY
  await assertFails(
    updateDoc(doc(getPatientDb(), 'users', patientUserUid), {
      linkedPatientId: 'paciente_hacked'
    }),
    'User must not be able to set their own linkedPatientId'
  );
  console.log('  ✓ User self-assigning linkedPatientId -> DENY');

  // 1.6 User accessing personal tracking subcollections -> ALLOW
  await assertSucceeds(
    setDoc(doc(getPatientDb(), 'users', patientUserUid, 'diet', 'day_1'), {
      meals: ['desayuno', 'comida'],
      kcal: 2000
    }),
    'User can read and write to their own tracking subcollections'
  );
  console.log('  ✓ User writes to own personal tracking subcollection -> ALLOW');

  // 1.7 Nutritionist accessing patient personal tracking -> DENY
  await assertFails(
    getDoc(doc(getNutriDb(), 'users', patientUserUid, 'diet', 'day_1')),
    'Nutritionist cannot read client personal tracking without explicit ownership'
  );
  console.log('  ✓ Nutritionist accessing another user personal tracking -> DENY');

  // ==========================================================================
  // 2. PATIENT DOSSIER CREATION & SCHEMA ALLOWLISTS
  // ==========================================================================
  console.log('\n[2. Testing Patient Creation & Shared Schema Allowlists]');

  const testPatientId = 'patient_test_001';

  // 2.1 Nutritionist creates owned dossier without userId -> ALLOW
  await assertSucceeds(
    setDoc(doc(getNutriDb(), 'pacientes', testPatientId), {
      id: testPatientId,
      ownerUid: authenticatedNutriUid,
      nombre: 'Paciente Prueba 1',
      status: 'activo',
      sexo: 'M',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    }),
    'Nutritionist can create owned patient dossier'
  );
  console.log('  ✓ Nutritionist creates owned patient dossier without userId -> ALLOW');

  // 2.2 Attempting to write confidential fields to shared patient root -> DENY
  const leakedPatientId = 'patient_leaked_001';
  await assertFails(
    setDoc(doc(getNutriDb(), 'pacientes', leakedPatientId), {
      id: leakedPatientId,
      ownerUid: authenticatedNutriUid,
      nombre: 'Paciente Filtrado',
      status: 'activo',
      sexo: 'M',
      alertasMedicas: ['Cardiopatía severa'], // FORBIDDEN IN SHARED ROOT
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    }),
    'Writing confidential fields to shared patient root must be DENIED by allowlist'
  );
  console.log('  ✓ Writing confidential clinical fields to shared patient root -> DENY (Schema Allowlist Enforced)');

  // 2.3 Attempting to create dossier with mismatched ownerUid -> DENY
  const spoofedPatientId = 'patient_spoof_001';
  await assertFails(
    setDoc(doc(getNutriDb(), 'pacientes', spoofedPatientId), {
      id: spoofedPatientId,
      ownerUid: otherNutriUid,
      nombre: 'Paciente Suplantado',
      status: 'activo',
      sexo: 'M',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    }),
    'Nutritionist cannot set another user as ownerUid'
  );
  console.log('  ✓ Nutritionist creating dossier with spoofed ownerUid -> DENY');

  // ==========================================================================
  // 3. COLLECTION LIST / QUERIES
  // ==========================================================================
  console.log('\n[3. Testing Collection Queries vs Direct Access]');

  // 3.1 Nutritionist unrestricted list -> DENY
  await assertFails(
    getDocs(collection(getNutriDb(), 'pacientes')),
    'Unrestricted getDocs on pacientes must be DENIED'
  );
  console.log('  ✓ Nutritionist getDocs(collection("pacientes")) without filter -> DENY');

  // 3.2 Nutritionist owner-scoped query -> ALLOW
  const scopedQuery = query(
    collection(getNutriDb(), 'pacientes'),
    where('ownerUid', '==', authenticatedNutriUid)
  );
  await assertSucceeds(
    getDocs(scopedQuery),
    'Owner-scoped query must be ALLOWED'
  );
  console.log('  ✓ Nutritionist query(where("ownerUid", "==", auth.uid)) -> ALLOW');

  // 3.3 Patient querying collection -> DENY
  await assertFails(
    getDocs(collection(getPatientDb(), 'pacientes')),
    'Patient must not be allowed to list /pacientes collection'
  );
  console.log('  ✓ Patient querying collection("pacientes") -> DENY');

  // ==========================================================================
  // 4. ATOMIC BIDIRECTIONAL LINKING & UNLINKING
  // ==========================================================================
  console.log('\n[4. Testing Atomic Bidirectional Linking & Unlinking]');

  // 4.1 Partial link (only patient.userId updated) -> DENY
  await assertFails(
    updateDoc(doc(getNutriDb(), 'pacientes', testPatientId), {
      userId: patientUserUid
    }),
    'Partial link without user reciprocal update must be DENIED'
  );
  console.log('  ✓ Partial link (updating only patient.userId) -> DENY');

  // 4.2 Valid atomic bidirectional link -> ALLOW
  const linkBatch = writeBatch(getNutriDb());
  linkBatch.update(doc(getNutriDb(), 'pacientes', testPatientId), {
    userId: patientUserUid,
    updatedAt: new Date().toISOString()
  });
  linkBatch.update(doc(getNutriDb(), 'users', patientUserUid), {
    linkedPatientId: testPatientId,
    updatedAt: new Date().toISOString()
  });
  await assertSucceeds(
    linkBatch.commit(),
    'Atomic bidirectional link batch must succeed'
  );
  console.log('  ✓ Atomic bidirectional link (patient.userId + user.linkedPatientId) -> ALLOW');

  // 4.3 Linked patient direct getDoc -> ALLOW
  await assertSucceeds(
    getDoc(doc(getPatientDb(), 'pacientes', testPatientId)),
    'Linked patient can read their assigned dossier directly'
  );
  console.log('  ✓ Linked patient direct getDoc on assigned dossier -> ALLOW');

  // 4.4 Stranger direct getDoc -> DENY
  await assertFails(
    getDoc(doc(getStrangerDb(), 'pacientes', testPatientId)),
    'Stranger cannot read patient dossier'
  );
  console.log('  ✓ Stranger direct getDoc on patient dossier -> DENY');

  // 4.5 Silent Overwrite: linking already-linked user to another patient -> DENY
  const secondPatientId = 'patient_test_002';
  await testEnv.withSecurityRulesDisabled(async (context) => {
    await setDoc(doc(context.firestore(), 'pacientes', secondPatientId), {
      id: secondPatientId,
      ownerUid: authenticatedNutriUid,
      nombre: 'Paciente 2',
      status: 'activo',
      sexo: 'M',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    });
  });

  const overwriteBatch = writeBatch(getNutriDb());
  overwriteBatch.update(doc(getNutriDb(), 'pacientes', secondPatientId), {
    userId: patientUserUid
  });
  overwriteBatch.update(doc(getNutriDb(), 'users', patientUserUid), {
    linkedPatientId: secondPatientId
  });
  await assertFails(
    overwriteBatch.commit(),
    'Overwriting existing user link without explicit unlink must be DENIED'
  );
  console.log('  ✓ Silent overwrite of existing linked patient -> DENY');

  // 4.6 Direct RELINK (old UID -> new UID directly on patient) -> DENY
  const directRelinkBatch = writeBatch(getNutriDb());
  directRelinkBatch.update(doc(getNutriDb(), 'pacientes', testPatientId), {
    userId: strangerUserUid
  });
  directRelinkBatch.update(doc(getNutriDb(), 'users', strangerUserUid), {
    linkedPatientId: testPatientId
  });
  await assertFails(
    directRelinkBatch.commit(),
    'Direct RELINK without prior UNLINK must be DENIED'
  );
  console.log('  ✓ Direct RELINK transition without prior UNLINK -> DENY');

  // 4.7 Atomic UNLINK -> ALLOW
  const unlinkBatch = writeBatch(getNutriDb());
  unlinkBatch.update(doc(getNutriDb(), 'pacientes', testPatientId), {
    userId: null,
    updatedAt: new Date().toISOString()
  });
  unlinkBatch.update(doc(getNutriDb(), 'users', patientUserUid), {
    linkedPatientId: null,
    updatedAt: new Date().toISOString()
  });
  await assertSucceeds(
    unlinkBatch.commit(),
    'Atomic unlink must succeed'
  );
  console.log('  ✓ Atomic UNLINK (clearing both patient.userId and user.linkedPatientId) -> ALLOW');

  // ==========================================================================
  // 5. SHARED VS PRIVATE SUBCOLLECTIONS & ANTI-LEAKAGE
  // ==========================================================================
  console.log('\n[5. Testing Shared vs Private Subcollections & Anti-Leakage]');

  // Re-link patient for subcollection testing
  const relinkForSubcollections = writeBatch(getNutriDb());
  relinkForSubcollections.update(doc(getNutriDb(), 'pacientes', testPatientId), {
    userId: patientUserUid,
    updatedAt: new Date().toISOString()
  });
  relinkForSubcollections.update(doc(getNutriDb(), 'users', patientUserUid), {
    linkedPatientId: testPatientId,
    updatedAt: new Date().toISOString()
  });
  await relinkForSubcollections.commit();

  // 5.1 Shared appointment creation (valid schema) -> ALLOW
  const aptId = 'cita_101';
  await assertSucceeds(
    setDoc(doc(getNutriDb(), 'pacientes', testPatientId, 'citas', aptId), {
      id: aptId,
      fecha: '2026-09-15',
      hora: '10:00 AM',
      tipo: 'seguimiento',
      motivo: 'Control mensual',
      status: 'programada',
      acuerdosCompromisos: 'Tomar 2L de agua diarios',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    }),
    'Nutritionist can write valid shared appointment'
  );
  console.log('  ✓ Nutritionist writes valid shared appointment -> ALLOW');

  // 5.2 Attempting to leak SOAP / notasEvolucion into shared appointment -> DENY
  const leakedAptId = 'cita_leaked_102';
  await assertFails(
    setDoc(doc(getNutriDb(), 'pacientes', testPatientId, 'citas', leakedAptId), {
      id: leakedAptId,
      fecha: '2026-09-15',
      tipo: 'seguimiento',
      motivo: 'Control',
      status: 'programada',
      notasEvolucion: 'Notas SOAP confidenciales del doctor', // FORBIDDEN IN SHARED CITAS
      createdAt: new Date().toISOString()
    }),
    'Writing private notes to shared citas must be DENIED by allowlist'
  );
  console.log('  ✓ Writing confidential SOAP notes to shared citas -> DENY (Schema Allowlist Enforced)');

  // 5.3 Linked patient reads shared appointment -> ALLOW
  await assertSucceeds(
    getDoc(doc(getPatientDb(), 'pacientes', testPatientId, 'citas', aptId)),
    'Linked patient can read shared appointment'
  );
  console.log('  ✓ Linked patient reads shared appointment -> ALLOW');

  // 5.4 Nutritionist writes private clinical notes in /private/clinical -> ALLOW
  await assertSucceeds(
    setDoc(doc(getNutriDb(), 'pacientes', testPatientId, 'private', 'clinical'), {
      alertasMedicas: ['Cardiopatía'],
      notasGenerales: 'Historial confidencial de seguimiento',
      diagnosticos: ['Resistencia a la insulina'],
      updatedAt: new Date().toISOString()
    }),
    'Nutritionist owner can write to private clinical document'
  );
  console.log('  ✓ Nutritionist writes to /private/clinical -> ALLOW');

  // 5.5 Linked patient reads /private/clinical -> STRICT DENY
  await assertFails(
    getDoc(doc(getPatientDb(), 'pacientes', testPatientId, 'private', 'clinical')),
    'Linked patient must NOT read /private/clinical'
  );
  console.log('  ✓ Linked patient reads /private/clinical -> STRICT DENY');

  // 5.6 Linked patient reads /citas_private -> STRICT DENY
  await assertFails(
    getDoc(doc(getPatientDb(), 'pacientes', testPatientId, 'citas_private', aptId)),
    'Linked patient must NOT read /citas_private'
  );
  console.log('  ✓ Linked patient reads /citas_private -> STRICT DENY');

  // ==========================================================================
  // 6. PATIENT DELETION WITH RECIPROCAL CLEANUP
  // ==========================================================================
  console.log('\n[6. Testing Patient Deletion with Reciprocal Cleanup]');

  // 6.1 Deleting linked patient WITHOUT clearing user link -> DENY
  await assertFails(
    deleteDoc(doc(getNutriDb(), 'pacientes', testPatientId)),
    'Deleting linked patient without reciprocal user cleanup must be DENIED'
  );
  console.log('  ✓ Deleting linked patient without clearing user.linkedPatientId -> DENY');

  // 6.2 Deleting linked patient WITH atomic user cleanup -> ALLOW
  const deleteBatch = writeBatch(getNutriDb());
  deleteBatch.delete(doc(getNutriDb(), 'pacientes', testPatientId));
  deleteBatch.update(doc(getNutriDb(), 'users', patientUserUid), {
    linkedPatientId: deleteField(),
    updatedAt: new Date().toISOString()
  });
  await assertSucceeds(
    deleteBatch.commit(),
    'Deleting linked patient while atomically clearing user link must succeed'
  );
  console.log('  ✓ Deleting linked patient while atomically clearing user link -> ALLOW');

  console.log('\n================================================================');
  console.log(' ALL REAL FIRESTORE RULES ENGINE TESTS PASSED SUCCESSFULLY!');
  console.log('================================================================');

  await testEnv.cleanup();
}

// Auto-run if executed directly via tsx/node
if (require.main === module) {
  runFirestoreRulesEngineTests().catch((err) => {
    console.error('Test execution failed:', err);
    process.exit(1);
  });
}
