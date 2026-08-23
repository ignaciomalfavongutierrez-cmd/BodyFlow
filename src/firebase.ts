import { initializeApp } from 'firebase/app';
import { getAuth, browserLocalPersistence, setPersistence } from 'firebase/auth';
import { initializeFirestore, persistentLocalCache, persistentMultipleTabManager } from 'firebase/firestore';

const firebaseConfig = {
  apiKey: import.meta.env.VITE_FIREBASE_API_KEY,
  authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN,
  projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID,
  storageBucket: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID,
  appId: import.meta.env.VITE_FIREBASE_APP_ID,
  measurementId: import.meta.env.VITE_FIREBASE_MEASUREMENT_ID
};

if (import.meta.env.DEV) {
  console.log('[AUTH:FLOW] FIREBASE_INIT_START');
}

const app = initializeApp(firebaseConfig);
export const auth = getAuth(app);

if (import.meta.env.DEV) {
  console.log('[AUTH:FLOW] FIREBASE_INITIALIZED');
}

// Enforce browser local persistence so sessions survive mobile redirects & PWA reloads.
// Export the promise so auth store can await it before reading auth state.
export const persistenceReady = setPersistence(auth, browserLocalPersistence)
  .then(() => {
    if (import.meta.env.DEV) {
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
