import firebase from "firebase/compat/app";
import { getFirestore } from "firebase/firestore";

// Configuración de tu proyecto "bazar-2432d"
const firebaseConfig = {
  apiKey: "AIzaSyCq5GLb7HGR4lV_pWwLsyaERHK2Byn6-CU",
  authDomain: "bazar-2432d.firebaseapp.com",
  projectId: "bazar-2432d",
  storageBucket: "bazar-2432d.firebasestorage.app",
  messagingSenderId: "729565128774",
  appId: "1:729565128774:web:7366c4ebd6adf1bc840247",
  measurementId: "G-NBZPXVHCLN"
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