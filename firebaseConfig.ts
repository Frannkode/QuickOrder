import firebase from "firebase/compat/app";
import { getFirestore } from "firebase/firestore";

// Configuración de tu proyecto "bazar-2432d"
const firebaseConfig = {
  apiKey: import.meta.env.VITE_FIREBASE_API_KEY,
  authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN,
  projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID,
  storageBucket: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID,
  appId: import.meta.env.VITE_FIREBASE_APP_ID,
  measurementId: import.meta.env.VITE_FIREBASE_MEASUREMENT_ID
};

let app: any;
let db: any;
let isConfigured = false;

try {
  // Singleton Pattern: Evitar errores de "App already exists" en re-renders o hot-reloads
  // Usamos la API compat para verificar apps existentes de manera segura
  if (firebase.apps.length > 0) {
    app = firebase.app();
  } else {
    app = firebase.initializeApp(firebaseConfig);
  }
  
  // Obtenemos la instancia de Firestore usando el SDK modular
  // Pasamos la app (aunque sea compat, suele funcionar con el SDK modular o se puede castear)
  db = getFirestore(app);
  isConfigured = true;
} catch (error) {
  console.error("Error inicializando Firebase:", error);
  // Permitir que la app continúe en modo offline/demo si falla la configuración
  isConfigured = false;
}

export { db, isConfigured };