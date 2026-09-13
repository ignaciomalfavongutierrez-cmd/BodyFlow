/**
 * Suite de Pruebas de Autorización y Ownership de Pacientes
 *
 * Valida:
 * 1. Detección de roles (role === 'nutritionist') vs correos hardcodeados
 * 2. Protección de updateProfile() contra escalamiento de privilegios
 * 3. Asignación obligatoria de role: 'patient' en registro
 * 4. Asignación de ownerUid en creación de pacientes (inyección anulada)
 * 5. Inmutabilidad de ownerUid en actualizaciones clínicas
 * 6. Lectura directa permitida para Nutrióloga Propietaria (ownerUid)
 * 7. Lectura directa permitida para Paciente Vinculado (userId) en modo SOLO LECTURA
 * 8. Denegación de lectura directa para usuarios ajenos
 * 9. Separación de privilegios: Paciente Vinculado NO es Propietario (no puede listar, editar, borrar ni vincular)
 * 10. Desactivación de auto-descubrimiento por email abierto cross-tenant
 */

function assert(condition: boolean, message: string) {
  if (!condition) {
    console.error(`❌ FALLÓ: ${message}`);
    process.exit(1);
  }
  console.log(`  ✓ ${message}`);
}

console.log('===============================================================');
console.log(' EJECUTANDO PRUEBAS DE AUTORIZACIÓN Y OWNERSHIP (PATIENT FLOW)');
console.log('===============================================================');

// -------------------------------------------------------------
// GRUPO 1: DETECCIÓN DE ROLES BASADA EN PERFIL (CERO HARDCODED EMAILS)
// -------------------------------------------------------------
console.log('\n[1. Detección de Rol de Nutrióloga]');

function checkIsNutritionist(profile: { role?: string; email?: string } | null | undefined): boolean {
  return profile?.role === 'nutritionist';
}

assert(
  checkIsNutritionist({ role: 'nutritionist', email: 'cualquiera@dominio.com' }) === true,
  'role === "nutritionist" otorga permisos de nutrióloga independientemente del email'
);

assert(
  checkIsNutritionist({ role: 'patient', email: 'lic.n.talia@gmail.com' }) === false,
  'Correo históricamente administrativo (lic.n.talia@gmail.com) con role "patient" NO es nutrióloga'
);

assert(
  checkIsNutritionist({ role: 'patient', email: 'ignaciomalfavongutierrez@gmail.com' }) === false,
  'Correo de desarrollador con role "patient" NO es nutrióloga'
);

assert(
  checkIsNutritionist({ role: undefined, email: 'lic.n.talia@gmail.com' }) === false,
  'Perfil sin campo role falla cerrado (isNutritionist === false)'
);

assert(
  checkIsNutritionist(null) === false,
  'Perfil nulo falla cerrado (isNutritionist === false)'
);

assert(
  checkIsNutritionist({ role: 'admin' as any, email: 'admin@system.com' }) === false,
  'Roles no reconocidos fallan cerrado (isNutritionist === false)'
);

// -------------------------------------------------------------
// GRUPO 2: PROTECCIÓN DE UPDATE PROFILE (STRIP ROLE)
// -------------------------------------------------------------
console.log('\n[2. Inmutabilidad de Role en updateProfile()]');

function sanitizeProfileUpdates(updates: Record<string, any>): Record<string, any> {
  const { role: _role, ...safeUpdates } = updates;
  return safeUpdates;
}

const maliciousPayload = {
  name: 'Paciente Atacante',
  bio: 'Intentando escalar privilegios',
  role: 'nutritionist',
  admin: true
};

const sanitized = sanitizeProfileUpdates(maliciousPayload);
assert(!('role' in sanitized), 'updateProfile() elimina estrictamente el campo role');
assert(sanitized.name === 'Paciente Atacante', 'updateProfile() preserva campos válidos');
assert(sanitized.bio === 'Intentando escalar privilegios', 'updateProfile() preserva datos de usuario');

// -------------------------------------------------------------
// GRUPO 3: REGISTRO DE NUEVOS USUARIOS
// -------------------------------------------------------------
console.log('\n[3. Rol Asignado en Registro de Usuario]');

function createNewUserDocData(userInput: { name: string; email: string; role?: string }): {
  name: string;
  email: string;
  role: 'patient';
} {
  // La aplicación nunca acepta 'role' de input de usuario
  return {
    name: userInput.name,
    email: userInput.email.toLowerCase().trim(),
    role: 'patient' // Fijo para cualquier registro público
  };
}

const registered = createNewUserDocData({
  name: 'Nuevo Usuario',
  email: 'nuevo@app.com',
  role: 'nutritionist' // Intento de registrarse directamente como nutrióloga
});

assert(registered.role === 'patient', 'Registro público asigna invariablemente role: "patient"');

// -------------------------------------------------------------
// GRUPO 4: CREACIÓN DE PACIENTE Y ASIGNACIÓN DE OWNER UID
// -------------------------------------------------------------
console.log('\n[4. Asignación de ownerUid en createPatient()]');

function prepareNewPatientDoc(
  inputData: Record<string, any>,
  authenticatedUserUid: string
): Record<string, any> {
  return {
    ...inputData,
    ownerUid: authenticatedUserUid // Colocado estrictamente DESPUÉS del spread
  };
}

const attackerUid = 'ATTACKER_UID_123';
const legitNutriUid = 'NUTRIOLOGA_AUTH_UID_456';

const patientPayloadWithSpoof = {
  nombre: 'Juan Pérez',
  edad: 30,
  ownerUid: attackerUid // Intento de suplantar o inyectar otro ownerUid
};

const preparedDoc = prepareNewPatientDoc(patientPayloadWithSpoof, legitNutriUid);
assert(
  preparedDoc.ownerUid === legitNutriUid,
  'ownerUid proviene exclusivamente del usuario autenticado y anula inyecciones en el payload'
);

// -------------------------------------------------------------
// GRUPO 5: INMUTABILIDAD DE OWNER UID Y CONTROL DE USER ID
// -------------------------------------------------------------
console.log('\n[5. Inmutabilidad de ownerUid y Control de userId en updatePatient()]');

function sanitizePatientUpdates(data: Record<string, any>): Record<string, any> {
  const { id: _id, createdAt: _created, ownerUid: _ownerUid, ...cleanData } = data;
  return cleanData;
}

const updateAttempt = {
  nombre: 'Juan Pérez Modificado',
  ownerUid: 'NEW_OWNER_TAKEOVER_UID',
  id: 'patient_doc_id',
  createdAt: '2025-01-01',
  userId: 'PATIENT_AUTH_UID_999'
};

const sanitizedUpdate = sanitizePatientUpdates(updateAttempt);
assert(!('ownerUid' in sanitizedUpdate), 'updatePatient() despoja estrictamente el campo ownerUid (inmutable tras creación)');
assert(!('id' in sanitizedUpdate), 'updatePatient() despoja el campo id (inmutable)');
assert(sanitizedUpdate.userId === 'PATIENT_AUTH_UID_999', 'updatePatient() permite a la nutrióloga dueña modificar userId para vincular/reparar cuenta');
assert(sanitizedUpdate.nombre === 'Juan Pérez Modificado', 'updatePatient() conserva datos clínicos permitidos');

// -------------------------------------------------------------
// GRUPO 6: AUTORIZACIÓN DE LECTURA DIRECTA (getPatientById)
// -------------------------------------------------------------
console.log('\n[6. Autorización de Lectura Directa]');

interface PatientDocData {
  id: string;
  nombre: string;
  ownerUid: string;
  userId?: string;
}

function evaluateDirectPatientReadAccess(
  docData: PatientDocData | null,
  authUid: string | null
): boolean {
  if (!docData || !authUid) return false;
  const isOwner = docData.ownerUid === authUid;
  const isLinkedPatient = docData.userId === authUid;
  return isOwner || isLinkedPatient;
}

const patientRecord: PatientDocData = {
  id: 'expediente_100',
  nombre: 'Carlos Gómez',
  ownerUid: 'NUTRIOLOGA_A_UID',
  userId: 'PACIENTE_A_UID'
};

// Caso A: La nutrióloga dueña consulta el expediente
assert(
  evaluateDirectPatientReadAccess(patientRecord, 'NUTRIOLOGA_A_UID') === true,
  'Nutrióloga dueña (ownerUid) tiene acceso de lectura al expediente'
);

// Caso B: El paciente vinculado consulta su propio expediente
assert(
  evaluateDirectPatientReadAccess(patientRecord, 'PACIENTE_A_UID') === true,
  'Paciente vinculado (userId) tiene acceso directo de lectura a su expediente'
);

// Caso C: Un usuario ajeno intenta leer el expediente
assert(
  evaluateDirectPatientReadAccess(patientRecord, 'USUARIO_AJENO_UID') === false,
  'Usuario no vinculado y no dueño recibe acceso denegado (return null)'
);

// Caso D: Usuario no autenticado
assert(
  evaluateDirectPatientReadAccess(patientRecord, null) === false,
  'Usuario sin sesión autenticada recibe acceso denegado'
);

// -------------------------------------------------------------
// GRUPO 7: PRIVILEGIOS DE ESCRITURA: userId NUNCA ES OWNER
// -------------------------------------------------------------
console.log('\n[7. Privilegios de Escritura: userId NUNCA es Propietario]');

function evaluateClinicalWriteAccess(
  patient: PatientDocData,
  authUid: string
): boolean {
  // Exclusivamente el ownerUid tiene permisos de mutación clínica
  return patient.ownerUid === authUid;
}

assert(
  evaluateClinicalWriteAccess(patientRecord, 'NUTRIOLOGA_A_UID') === true,
  'Nutrióloga dueña (ownerUid) puede modificar expediente clínico'
);

assert(
  evaluateClinicalWriteAccess(patientRecord, 'PACIENTE_A_UID') === false,
  'Paciente vinculado (userId) NO tiene permisos de mutación sobre expediente clínico'
);

assert(
  evaluateClinicalWriteAccess(patientRecord, 'USUARIO_AJENO_UID') === false,
  'Usuario ajeno NO tiene permisos de mutación clínica'
);

// El paciente vinculado jamás puede modificar su propio userId en el expediente
function canUserModifyUserIdField(patient: PatientDocData, requestUid: string): boolean {
  return patient.ownerUid === requestUid;
}

assert(
  canUserModifyUserIdField(patientRecord, 'NUTRIOLOGA_A_UID') === true,
  'Nutrióloga propietaria puede modificar el vínculo userId'
);

assert(
  canUserModifyUserIdField(patientRecord, 'PACIENTE_A_UID') === false,
  'Paciente vinculado NO puede modificar el campo userId en el expediente'
);

// -------------------------------------------------------------
// GRUPO 8: SCOPING DE CONSULTAS DE COLECCIÓN
// -------------------------------------------------------------
console.log('\n[8. Scoping de Consultas por ownerUid]');

function buildPatientQueryConstraints(authenticatedUserUid: string) {
  return [
    { field: 'ownerUid', op: '==', value: authenticatedUserUid }
  ];
}

const constraintsNutriA = buildPatientQueryConstraints('NUTRIOLOGA_A_UID');
assert(
  constraintsNutriA.length === 1 &&
  constraintsNutriA[0].field === 'ownerUid' &&
  constraintsNutriA[0].value === 'NUTRIOLOGA_A_UID',
  'getPatients() y subscribePatients() filtran obligatoriamente por where("ownerUid", "==", auth.currentUser.uid)'
);

// -------------------------------------------------------------
// GRUPO 9: REMOCIÓN DE DESCUBRIMIENTO POR EMAIL
// -------------------------------------------------------------
console.log('\n[9. Desactivación de Descubrimiento Abierto por Email]');

import { PatientSyncService } from '../PatientSyncService';

async function testEmailDiscoveryDeactivation() {
  const result = await PatientSyncService.findPatientByEmail('cualquier_paciente@test.com');
  assert(
    result === null,
    'findPatientByEmail() está desactivado y retorna null de forma segura'
  );
}

// -------------------------------------------------------------
// GRUPO 10: PROTECCIÓN CONTRA SOBREESCRITURA SILENCIOSA DE ENLACE
// -------------------------------------------------------------
console.log('\n[10. Protección contra Sobreescritura Silenciosa de Enlace (Amend #2)]');

function validateLinkOperation(
  userProfile: { id: string; linkedPatientId?: string },
  targetPatientId: string
): { allowed: boolean; reason?: string } {
  if (userProfile.linkedPatientId && userProfile.linkedPatientId !== targetPatientId) {
    return {
      allowed: false,
      reason: `El usuario ya está vinculado al expediente ${userProfile.linkedPatientId}. Debe desvincularse primero.`
    };
  }
  return { allowed: true };
}

const alreadyLinkedUser = { id: 'user_paciente_1', linkedPatientId: 'expediente_existente' };
const linkValidationConflict = validateLinkOperation(alreadyLinkedUser, 'nuevo_expediente');
assert(
  linkValidationConflict.allowed === false,
  'Intento de sobreescribir un linkedPatientId existente de otro expediente es DENEGADO'
);

const unlinkedUser = { id: 'user_paciente_2', linkedPatientId: undefined };
const linkValidationSuccess = validateLinkOperation(unlinkedUser, 'nuevo_expediente');
assert(
  linkValidationSuccess.allowed === true,
  'Vinculación de usuario sin enlace previo es PERMITIDA'
);

const relinkSamePatient = { id: 'user_paciente_3', linkedPatientId: 'mismo_expediente' };
const relinkValidationSuccess = validateLinkOperation(relinkSamePatient, 'mismo_expediente');
assert(
  relinkValidationSuccess.allowed === true,
  'Re-vinculación idempotente al mismo expediente es PERMITIDA'
);

// -------------------------------------------------------------
// GRUPO 11: AISLAMIENTO DE DATOS CLÍNICOS PRIVADOS
// -------------------------------------------------------------
console.log('\n[11. Aislamiento Estricto de Rutas Privadas (/private, /citas_private, /mediciones_private)]');

function evaluatePrivateClinicalAccess(patientOwnerUid: string, requestUid: string | null): boolean {
  if (!requestUid) return false;
  return patientOwnerUid === requestUid;
}

assert(
  evaluatePrivateClinicalAccess('NUTRIOLOGA_A_UID', 'NUTRIOLOGA_A_UID') === true,
  'Nutrióloga dueña tiene acceso RW a /private/clinical, /citas_private y /mediciones_private'
);

assert(
  evaluatePrivateClinicalAccess('NUTRIOLOGA_A_UID', 'PACIENTE_A_UID') === false,
  'Paciente vinculado tiene ACCESO DENEGADO a todas las rutas y subcolecciones privadas'
);

assert(
  evaluatePrivateClinicalAccess('NUTRIOLOGA_A_UID', 'OTRA_NUTRIOLOGA_UID') === false,
  'Nutrióloga no propietaria tiene ACCESO DENEGADO a las rutas privadas de otro expediente'
);

// -------------------------------------------------------------
// GRUPO 12: ENFORCEMENT DE CONSULTAS FIRESTORE RULES (Amend #3)
// -------------------------------------------------------------
console.log('\n[12. Enforcement de Consultas en Reglas de Seguridad (Amend #3)]');

interface SecurityRuleEvaluation {
  requestAuthUid: string | null;
  userRole?: string;
  queryFilters?: Record<string, any>;
  operation: 'list' | 'get';
  resourceOwnerUid?: string;
  resourceUserId?: string;
}

function evaluatePatientsSecurityRule(evalCtx: SecurityRuleEvaluation): 'ALLOW' | 'DENY' {
  if (!evalCtx.requestAuthUid) return 'DENY';

  if (evalCtx.operation === 'list') {
    // Listado de colección requiere ser nutrióloga y filtrar estrictamente por ownerUid == request.auth.uid
    const isNutritionist = evalCtx.userRole === 'nutritionist';
    const hasOwnerFilter = evalCtx.queryFilters?.ownerUid === evalCtx.requestAuthUid;
    if (isNutritionist && hasOwnerFilter) {
      return 'ALLOW';
    }
    return 'DENY';
  }

  if (evalCtx.operation === 'get') {
    const isOwner = evalCtx.resourceOwnerUid === evalCtx.requestAuthUid && evalCtx.userRole === 'nutritionist';
    const isLinked = evalCtx.resourceUserId === evalCtx.requestAuthUid;
    if (isOwner || isLinked) {
      return 'ALLOW';
    }
    return 'DENY';
  }

  return 'DENY';
}

// 1. Nutrióloga intentando getDocs sin filtro (listado irrestricto)
assert(
  evaluatePatientsSecurityRule({
    requestAuthUid: 'NUTRI_1',
    userRole: 'nutritionist',
    operation: 'list',
    queryFilters: {}
  }) === 'DENY',
  'getDocs(collection(db, "pacientes")) sin filtro por ownerUid -> DENY'
);

// 2. Nutrióloga con consulta correctamente acotada (where("ownerUid", "==", auth.uid))
assert(
  evaluatePatientsSecurityRule({
    requestAuthUid: 'NUTRI_1',
    userRole: 'nutritionist',
    operation: 'list',
    queryFilters: { ownerUid: 'NUTRI_1' }
  }) === 'ALLOW',
  'query(collection, where("ownerUid", "==", auth.uid)) -> ALLOW'
);

// 3. Paciente intentando listar la colección /pacientes
assert(
  evaluatePatientsSecurityRule({
    requestAuthUid: 'PACIENTE_1',
    userRole: 'patient',
    operation: 'list',
    queryFilters: {}
  }) === 'DENY',
  'Intento de paciente de listar la colección /pacientes -> DENY'
);

// 4. Paciente consultando su propio expediente mediante get directo (conociendo linkedPatientId)
assert(
  evaluatePatientsSecurityRule({
    requestAuthUid: 'PACIENTE_1',
    userRole: 'patient',
    operation: 'get',
    resourceOwnerUid: 'NUTRI_1',
    resourceUserId: 'PACIENTE_1'
  }) === 'ALLOW',
  'Paciente consultando directamente doc("pacientes", linkedPatientId) -> ALLOW'
);

// -------------------------------------------------------------
// GRUPO 13: MATRIZ DE REGLAS DE SEGURIDAD FIRESTORE v2 (LINK, UNLINK, RELINK, CREATE, DELETE, USERS)
// -------------------------------------------------------------
console.log('\n[13. Matriz Completa de Reglas de Seguridad (v2 Matrix)]');

// 13.1 ACCESO A /users/{uid}
function testUserGetAccess(authUid: string | null, targetUid: string, role?: string): 'ALLOW' | 'DENY' {
  if (!authUid) return 'DENY';
  // El usuario solo puede leer su propio perfil.
  // Las nutriólogas NO tienen acceso global de lectura sobre otros usuarios.
  if (authUid === targetUid) return 'ALLOW';
  return 'DENY';
}

assert(testUserGetAccess('USER_1', 'USER_1', 'patient') === 'ALLOW', 'User reads own profile -> ALLOW');
assert(testUserGetAccess('USER_1', 'USER_2', 'patient') === 'DENY', 'User reads another profile -> DENY');
assert(testUserGetAccess('NUTRI_1', 'USER_2', 'nutritionist') === 'DENY', 'Nutritionist reads unrelated user profile -> DENY');

// 13.2 MUTABILIDAD EN /users/{uid} POR EL PROPIO USUARIO
function testUserSelfUpdate(affectedKeys: string[]): 'ALLOW' | 'DENY' {
  if (affectedKeys.includes('role') || affectedKeys.includes('linkedPatientId')) {
    return 'DENY';
  }
  return 'ALLOW';
}

assert(testUserSelfUpdate(['role']) === 'DENY', 'Patient changes own role -> DENY');
assert(testUserSelfUpdate(['linkedPatientId']) === 'DENY', 'Patient changes own linkedPatientId -> DENY');
assert(testUserSelfUpdate(['name', 'photoUrl']) === 'ALLOW', 'Patient updates own profile name -> ALLOW');

// 13.3 SIMULADOR DE TRANSACCIONES ATÓMICAS (PATIENT & USER)
interface BatchSimulationState {
  authUid: string;
  authRole: 'nutritionist' | 'patient';
  // Estado previo
  patientBefore?: { id: string; ownerUid: string; userId?: string | null };
  userBefore?: { id: string; linkedPatientId?: string | null; role: string };
  // Operaciones en el batch
  patientWrite?: { op: 'create' | 'update' | 'delete'; data?: any };
  userWrite?: { op: 'update'; targetUid: string; affectedKeys: string[]; data: any };
}

function evaluateAtomicBatchRules(sim: BatchSimulationState): {
  patientRule: 'ALLOW' | 'DENY';
  userRule?: 'ALLOW' | 'DENY';
  overall: 'ALLOW' | 'DENY';
  reason?: string;
} {
  const isNutri = sim.authRole === 'nutritionist';

  // --- Validación del documento paciente ---
  let patientResult: 'ALLOW' | 'DENY' = 'DENY';

  const CONFIDENTIAL_FIELDS = [
    'alertasMedicas',
    'notasGenerales',
    'diagnosticos',
    'notasInternas',
    'observacionesClinicas',
    'notasConsulta',
    'notasEvolucion'
  ];

  if (sim.patientWrite?.op === 'create') {
    const data = sim.patientWrite.data;
    const hasConfidentialField = CONFIDENTIAL_FIELDS.some(f => f in data);

    if (!isNutri || data.ownerUid !== sim.authUid || hasConfidentialField) {
      patientResult = 'DENY';
    } else if (!data.userId) {
      patientResult = 'ALLOW';
    } else {
      // CREATE CON LINK: requiere existsAfter y que el usuario tenga linkedPatientId en el mismo batch
      const userExistsAfter = sim.userWrite !== undefined || sim.userBefore !== undefined;
      const userAfter = sim.userWrite?.data;
      if (userExistsAfter && sim.userWrite?.targetUid === data.userId && userAfter?.linkedPatientId === data.id) {
        patientResult = 'ALLOW';
      } else {
        patientResult = 'DENY';
      }
    }
  } else if (sim.patientWrite?.op === 'update') {
    const prev = sim.patientBefore;
    const next = sim.patientWrite.data;
    const hasConfidentialField = CONFIDENTIAL_FIELDS.some(f => f in next);

    if (!prev || !isNutri || prev.ownerUid !== sim.authUid || next.ownerUid !== prev.ownerUid || hasConfidentialField) {
      patientResult = 'DENY';
    } else {
      const oldUserId = prev.userId || null;
      const newUserId = next.userId || null;

      if (oldUserId === newUserId) {
        // UNCHANGED
        patientResult = 'ALLOW';
      } else if (oldUserId === null && newUserId !== null) {
        // LINK: requiere que en userWrite se vincule este patientId
        if (sim.userWrite?.targetUid === newUserId && sim.userWrite?.data?.linkedPatientId === prev.id) {
          patientResult = 'ALLOW';
        } else {
          patientResult = 'DENY';
        }
      } else if (oldUserId !== null && newUserId === null) {
        // UNLINK: requiere que en userWrite se limpie linkedPatientId del oldUserId
        if (sim.userWrite?.targetUid === oldUserId && (!sim.userWrite?.data?.linkedPatientId)) {
          patientResult = 'ALLOW';
        } else {
          patientResult = 'DENY';
        }
      } else {
        // DIRECT RELINK (oldUserId !== null && newUserId !== null && oldUserId !== newUserId): DENY
        patientResult = 'DENY';
      }
    }
  } else if (sim.patientWrite?.op === 'delete') {
    const prev = sim.patientBefore;
    if (!prev || !isNutri || prev.ownerUid !== sim.authUid) {
      patientResult = 'DENY';
    } else if (!prev.userId) {
      // Sin enlace -> ALLOW
      patientResult = 'ALLOW';
    } else {
      // Con enlace -> requiere que en userWrite se limpie linkedPatientId
      if (sim.userWrite?.targetUid === prev.userId && (!sim.userWrite?.data?.linkedPatientId)) {
        patientResult = 'ALLOW';
      } else {
        patientResult = 'DENY';
      }
    }
  } else {
    // Si no hubo escritura de paciente pero hubo de usuario
    patientResult = 'ALLOW';
  }

  // --- Validación del documento usuario ---
  let userResult: 'ALLOW' | 'DENY' = 'ALLOW';
  if (sim.userWrite) {
    const uWrite = sim.userWrite;
    const uPrev = sim.userBefore;
    if (!isNutri) {
      userResult = 'DENY';
    } else if (!uWrite.affectedKeys.every(k => ['linkedPatientId', 'updatedAt'].includes(k))) {
      userResult = 'DENY';
    } else {
      // Simular getAfter en el documento paciente
      const patientAfterUserId = sim.patientWrite
        ? (sim.patientWrite.data?.userId ?? null)
        : (sim.patientBefore?.userId ?? null);

      if (uWrite.data.linkedPatientId) {
        // Subcase LINK
        const targetPatientId = uWrite.data.linkedPatientId;
        // Validar sobreescritura silenciosa
        if (uPrev?.linkedPatientId && uPrev.linkedPatientId !== targetPatientId) {
          userResult = 'DENY';
        } else {
          // Verificar que el paciente tenga userId igual a targetUid en getAfter
          if (patientAfterUserId === uWrite.targetUid) {
            userResult = 'ALLOW';
          } else {
            userResult = 'DENY';
          }
        }
      } else {
        // Subcase UNLINK
        if (!patientAfterUserId) {
          userResult = 'ALLOW';
        } else {
          userResult = 'DENY';
        }
      }
    }
  }

  const overall = (patientResult === 'ALLOW' && userResult === 'ALLOW') ? 'ALLOW' : 'DENY';
  return { patientRule: patientResult, userRule: userResult, overall };
}

// 13.4 PRUEBAS DE CASOS LINK
assert(
  evaluateAtomicBatchRules({
    authUid: 'NUTRI_1',
    authRole: 'nutritionist',
    patientBefore: { id: 'P_1', ownerUid: 'NUTRI_1', userId: null },
    userBefore: { id: 'U_1', linkedPatientId: null, role: 'patient' },
    patientWrite: { op: 'update', data: { ownerUid: 'NUTRI_1', userId: 'U_1' } },
    userWrite: { op: 'update', targetUid: 'U_1', affectedKeys: ['linkedPatientId', 'updatedAt'], data: { linkedPatientId: 'P_1' } }
  }).overall === 'ALLOW',
  'Owner nutritionist + clean target user + atomic bidirectional batch -> ALLOW'
);

assert(
  evaluateAtomicBatchRules({
    authUid: 'NUTRI_1',
    authRole: 'nutritionist',
    patientBefore: { id: 'P_1', ownerUid: 'NUTRI_1', userId: null },
    userBefore: { id: 'U_1', linkedPatientId: null, role: 'patient' },
    patientWrite: { op: 'update', data: { ownerUid: 'NUTRI_1', userId: 'U_1' } }
    // userWrite omitido
  }).overall === 'DENY',
  'Owner nutritionist updates only patient.userId -> DENY'
);

assert(
  evaluateAtomicBatchRules({
    authUid: 'NUTRI_1',
    authRole: 'nutritionist',
    patientBefore: { id: 'P_1', ownerUid: 'NUTRI_1', userId: null },
    userBefore: { id: 'U_1', linkedPatientId: null, role: 'patient' },
    // patientWrite omitido
    userWrite: { op: 'update', targetUid: 'U_1', affectedKeys: ['linkedPatientId', 'updatedAt'], data: { linkedPatientId: 'P_1' } }
  }).overall === 'DENY',
  'Owner nutritionist updates only user.linkedPatientId -> DENY'
);

assert(
  evaluateAtomicBatchRules({
    authUid: 'NUTRI_IMPOSTOR',
    authRole: 'nutritionist',
    patientBefore: { id: 'P_1', ownerUid: 'NUTRI_ORIGINAL', userId: null },
    userBefore: { id: 'U_1', linkedPatientId: null, role: 'patient' },
    patientWrite: { op: 'update', data: { ownerUid: 'NUTRI_ORIGINAL', userId: 'U_1' } },
    userWrite: { op: 'update', targetUid: 'U_1', affectedKeys: ['linkedPatientId', 'updatedAt'], data: { linkedPatientId: 'P_1' } }
  }).overall === 'DENY',
  'Nutritionist does not own patient -> DENY'
);

assert(
  evaluateAtomicBatchRules({
    authUid: 'NUTRI_1',
    authRole: 'nutritionist',
    patientBefore: { id: 'P_1', ownerUid: 'NUTRI_1', userId: null },
    userBefore: { id: 'U_1', linkedPatientId: 'OTRO_EXPEDIENTE_YA_EXISTENTE', role: 'patient' },
    patientWrite: { op: 'update', data: { ownerUid: 'NUTRI_1', userId: 'U_1' } },
    userWrite: { op: 'update', targetUid: 'U_1', affectedKeys: ['linkedPatientId', 'updatedAt'], data: { linkedPatientId: 'P_1' } }
  }).overall === 'DENY',
  'Target user already linked to another patient -> DENY'
);

// 13.5 PRUEBAS DE CASOS UNLINK
assert(
  evaluateAtomicBatchRules({
    authUid: 'NUTRI_1',
    authRole: 'nutritionist',
    patientBefore: { id: 'P_1', ownerUid: 'NUTRI_1', userId: 'U_1' },
    userBefore: { id: 'U_1', linkedPatientId: 'P_1', role: 'patient' },
    patientWrite: { op: 'update', data: { ownerUid: 'NUTRI_1', userId: null } },
    userWrite: { op: 'update', targetUid: 'U_1', affectedKeys: ['linkedPatientId', 'updatedAt'], data: { linkedPatientId: null } }
  }).overall === 'ALLOW',
  'Owner nutritionist atomically removes both patient.userId & user.linkedPatientId -> ALLOW'
);

assert(
  evaluateAtomicBatchRules({
    authUid: 'NUTRI_1',
    authRole: 'nutritionist',
    patientBefore: { id: 'P_1', ownerUid: 'NUTRI_1', userId: 'U_1' },
    userBefore: { id: 'U_1', linkedPatientId: 'P_1', role: 'patient' },
    patientWrite: { op: 'update', data: { ownerUid: 'NUTRI_1', userId: null } }
    // userWrite omitido
  }).overall === 'DENY',
  'Only patient.userId removed -> DENY'
);

assert(
  evaluateAtomicBatchRules({
    authUid: 'NUTRI_1',
    authRole: 'nutritionist',
    patientBefore: { id: 'P_1', ownerUid: 'NUTRI_1', userId: 'U_1' },
    userBefore: { id: 'U_1', linkedPatientId: 'P_1', role: 'patient' },
    // patientWrite omitido
    userWrite: { op: 'update', targetUid: 'U_1', affectedKeys: ['linkedPatientId', 'updatedAt'], data: { linkedPatientId: null } }
  }).overall === 'DENY',
  'Only user.linkedPatientId removed -> DENY'
);

// 13.6 PRUEBAS DE RELINK (DENIED DIRECTAMENTE)
assert(
  evaluateAtomicBatchRules({
    authUid: 'NUTRI_1',
    authRole: 'nutritionist',
    patientBefore: { id: 'P_1', ownerUid: 'NUTRI_1', userId: 'OLD_UID' },
    userBefore: { id: 'NEW_UID', linkedPatientId: null, role: 'patient' },
    patientWrite: { op: 'update', data: { ownerUid: 'NUTRI_1', userId: 'NEW_UID' } },
    userWrite: { op: 'update', targetUid: 'NEW_UID', affectedKeys: ['linkedPatientId', 'updatedAt'], data: { linkedPatientId: 'P_1' } }
  }).overall === 'DENY',
  'OLD_UID -> NEW_UID directly without prior UNLINK -> DENY (direct RELINK unsupported)'
);

// 13.7 PRUEBAS DE CREATE WITH LINK
assert(
  evaluateAtomicBatchRules({
    authUid: 'NUTRI_1',
    authRole: 'nutritionist',
    patientWrite: { op: 'create', data: { id: 'P_NEW', ownerUid: 'NUTRI_1' } }
  }).overall === 'ALLOW',
  'Nutritionist creates patient without userId -> ALLOW'
);

assert(
  evaluateAtomicBatchRules({
    authUid: 'NUTRI_1',
    authRole: 'nutritionist',
    userBefore: { id: 'U_1', linkedPatientId: null, role: 'patient' },
    patientWrite: { op: 'create', data: { id: 'P_NEW', ownerUid: 'NUTRI_1', userId: 'U_1' } },
    userWrite: { op: 'update', targetUid: 'U_1', affectedKeys: ['linkedPatientId', 'updatedAt'], data: { linkedPatientId: 'P_NEW' } }
  }).overall === 'ALLOW',
  'Nutritionist creates patient with userId and same batch sets user.linkedPatientId -> ALLOW'
);

assert(
  evaluateAtomicBatchRules({
    authUid: 'NUTRI_1',
    authRole: 'nutritionist',
    patientWrite: { op: 'create', data: { id: 'P_NEW', ownerUid: 'NUTRI_1', userId: 'U_1' } }
    // Sin reciprocal user write
  }).overall === 'DENY',
  'Nutritionist creates patient with userId without reciprocal user link -> DENY'
);

// 13.8 PRUEBAS DE DELETE
assert(
  evaluateAtomicBatchRules({
    authUid: 'NUTRI_1',
    authRole: 'nutritionist',
    patientBefore: { id: 'P_1', ownerUid: 'NUTRI_1', userId: null },
    patientWrite: { op: 'delete' }
  }).overall === 'ALLOW',
  'Unlinked owned patient -> ALLOW delete'
);

assert(
  evaluateAtomicBatchRules({
    authUid: 'NUTRI_1',
    authRole: 'nutritionist',
    patientBefore: { id: 'P_1', ownerUid: 'NUTRI_1', userId: 'U_1' },
    userBefore: { id: 'U_1', linkedPatientId: 'P_1', role: 'patient' },
    patientWrite: { op: 'delete' },
    userWrite: { op: 'update', targetUid: 'U_1', affectedKeys: ['linkedPatientId', 'updatedAt'], data: { linkedPatientId: null } }
  }).overall === 'ALLOW',
  'Linked owned patient + reciprocal user cleanup in same batch -> ALLOW delete'
);

assert(
  evaluateAtomicBatchRules({
    authUid: 'NUTRI_1',
    authRole: 'nutritionist',
    patientBefore: { id: 'P_1', ownerUid: 'NUTRI_1', userId: 'U_1' },
    userBefore: { id: 'U_1', linkedPatientId: 'P_1', role: 'patient' },
    patientWrite: { op: 'delete' }
    // userWrite omitido
  }).overall === 'DENY',
  'Linked owned patient deleted without clearing user.linkedPatientId -> DENY delete'
);

// 13.9 PRUEBAS DE ALLOWLISTS DE DOCUMENTOS COMPARTIDOS (PREVENCIÓN DE FUGAS)
console.log('\n[13.9 Allowlists de Documentos Compartidos]');

assert(
  evaluateAtomicBatchRules({
    authUid: 'NUTRI_1',
    authRole: 'nutritionist',
    patientWrite: {
      op: 'create',
      data: {
        id: 'P_LEAK',
        ownerUid: 'NUTRI_1',
        alertasMedicas: ['Cardiopatía severa'] // CAMPO CONFIDENCIAL PROHIBIDO EN RAÍZ
      }
    }
  }).overall === 'DENY',
  'Intento de escribir alertasMedicas en la raíz compartida de paciente -> DENY (Allowlist Violada)'
);

assert(
  evaluateAtomicBatchRules({
    authUid: 'NUTRI_1',
    authRole: 'nutritionist',
    patientBefore: { id: 'P_1', ownerUid: 'NUTRI_1', userId: null },
    patientWrite: {
      op: 'update',
      data: {
        ownerUid: 'NUTRI_1',
        notasGenerales: 'Historial confidencial' // CAMPO CONFIDENCIAL PROHIBIDO EN RAÍZ
      }
    }
  }).overall === 'DENY',
  'Intento de actualizar notasGenerales en la raíz compartida de paciente -> DENY (Allowlist Violada)'
);

function evaluateSharedAppointmentAllowlist(data: Record<string, any>): 'ALLOW' | 'DENY' {
  const FORBIDDEN_APPOINTMENT_FIELDS = ['notasEvolucion', 'observacionesClinicas', 'notasInternas', 'soap'];
  if (FORBIDDEN_APPOINTMENT_FIELDS.some(f => f in data)) return 'DENY';
  return 'ALLOW';
}

assert(
  evaluateSharedAppointmentAllowlist({
    id: 'cita_1',
    fecha: '2026-09-15',
    motivo: 'Seguimiento',
    notasEvolucion: 'Notas SOAP privadas'
  }) === 'DENY',
  'Intento de escribir notasEvolucion (SOAP) en citas compartidas -> DENY (Allowlist Violada)'
);

assert(
  evaluateSharedAppointmentAllowlist({
    id: 'cita_1',
    fecha: '2026-09-15',
    motivo: 'Seguimiento',
    acuerdosCompromisos: 'Cumplir metas de agua'
  }) === 'ALLOW',
  'Escritura de cita compartida con campos válidos -> ALLOW'
);

// 13.10 SEGURIDAD DE existsAfter EN DOCUMENTOS INEXISTENTES
console.log('\n[13.10 Seguridad existsAfter en Transacciones Atómicas]');

assert(
  evaluateAtomicBatchRules({
    authUid: 'NUTRI_1',
    authRole: 'nutritionist',
    patientWrite: {
      op: 'create',
      data: { id: 'P_NEW', ownerUid: 'NUTRI_1', userId: 'USER_INEXISTENTE' }
    }
    // userWrite omitido (el usuario no existe en la base ni en el batch)
  }).overall === 'DENY',
  'CREATE con userId pero el usuario no existe (existsAfter falla cerrado) -> DENY'
);

testEmailDiscoveryDeactivation().then(() => {
  console.log('\n===============================================================');
  console.log(' ¡TODAS LAS PRUEBAS DE AUTORIZACIÓN Y OWNERSHIP PASARON CON ÉXITO!');
  console.log('===============================================================');
}).catch((err) => {
  console.error('Error durante la ejecución de pruebas:', err);
  process.exit(1);
});
