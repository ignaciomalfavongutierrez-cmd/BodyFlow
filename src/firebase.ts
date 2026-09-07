import { initializeApp } from 'firebase/app';
import { getAuth, browserLocalPersistence, setPersistence } from 'firebase/auth';
import { initializeFirestore, persistentLocalCache, persistentMultipleTabManager } from 'firebase/firestore';

const env = (typeof import.meta !== 'undefined' && (import.meta as any).env) || {};

const firebaseConfig = {
  apiKey: env.VITE_FIREBASE_API_KEY || 'mock_api_key',
  authDomain: env.VITE_FIREBASE_AUTH_DOMAIN || 'mock_domain',
  projectId: env.VITE_FIREBASE_PROJECT_ID || 'mock_project',
  storageBucket: env.VITE_FIREBASE_STORAGE_BUCKET || 'mock_bucket',
  messagingSenderId: env.VITE_FIREBASE_MESSAGING_SENDER_ID || 'mock_sender',
  appId: env.VITE_FIREBASE_APP_ID || 'mock_app',
  measurementId: env.VITE_FIREBASE_MEASUREMENT_ID || 'mock_measurement'
};

if (env.DEV) {
  console.log('[AUTH:FLOW] FIREBASE_INIT_START');
}

const app = initializeApp(firebaseConfig);
export const auth = getAuth(app);

if (env.DEV) {
  console.log('[AUTH:FLOW] FIREBASE_INITIALIZED');
}

// Enforce browser local persistence so sessions survive mobile redirects & PWA reloads.
// Export the promise so auth store can await it before reading auth state.
export const persistenceReady = setPersistence(auth, browserLocalPersistence)
  .then(() => {
    if (env.DEV) {
      console.log('[AUTH:FLOW] PERSISTENCE_CONFIGURED');
    }
  })
  .catch((err) => {
    console.warn('[AUTH:ERROR] PERSISTENCE_SETUP_FAILED', err?.code || err);
  });

// Configure Firestore with modern persistent local cache (resilient on mobile/iOS)
export const db = initializeFirestore(app, {
  localCache: persistentLocalCache({
    tabManager: persistentMultipleTabManager()
  })
});
