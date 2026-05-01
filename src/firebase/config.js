import { initializeApp } from "firebase/app";
import { getAuth } from "firebase/auth";
import { getDatabase } from "firebase/database";

// Validate that all required environment variables are loaded
const requiredEnvVars = [
  'VITE_FIREBASE_API_KEY',
  'VITE_FIREBASE_AUTH_DOMAIN',
  'VITE_FIREBASE_DATABASE_URL',
  'VITE_FIREBASE_PROJECT_ID',
  'VITE_FIREBASE_STORAGE_BUCKET',
  'VITE_FIREBASE_MESSAGING_SENDER_ID',
  'VITE_FIREBASE_APP_ID'
];

const missingVars = requiredEnvVars.filter(varName => !import.meta.env[varName]);
if (missingVars.length > 0) {
  const errorMessage = `❌ Missing Firebase environment variables: ${missingVars.join(', ')}. 
  Please ensure all variables are defined in your .env file. 
  Reference: .env.example for required configuration.`;
  console.error(errorMessage);
  throw new Error(errorMessage);
}

const firebaseConfig = {
  apiKey: import.meta.env.VITE_FIREBASE_API_KEY,
  authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN,
  databaseURL: import.meta.env.VITE_FIREBASE_DATABASE_URL,
  projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID,
  storageBucket: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID,
  appId: import.meta.env.VITE_FIREBASE_APP_ID
};

console.log('🔧 Firebase config loaded');
console.log('   Database URL:', firebaseConfig.databaseURL);
console.log('   Project ID:', firebaseConfig.projectId);

const app = initializeApp(firebaseConfig);
console.log('✅ Firebase App initialized');

export const auth = getAuth(app);
console.log('✅ Auth service initialized');

export const db = getDatabase(app);
console.log('✅ Database service initialized');

// Storage removed to stay on the 100% Free Spark Plan without billing prompts
