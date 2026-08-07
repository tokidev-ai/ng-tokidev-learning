// Este archivo SE SUBE al repositorio — no contiene credenciales.
// Las claves vienen del archivo .env (que está en .gitignore).
//
// Para configurar: creá un archivo .env en la raíz del proyecto
// copiando .env.example y pegando tus valores de Firebase Console.

export const firebaseConfig = {
  apiKey:            import.meta.env['NG_APP_FIREBASE_API_KEY'] || 'mock-api-key-for-testing-purposes',
  authDomain:        import.meta.env['NG_APP_FIREBASE_AUTH_DOMAIN'] || 'mock-project.firebaseapp.com',
  projectId:         import.meta.env['NG_APP_FIREBASE_PROJECT_ID'] || 'mock-project',
  storageBucket:     import.meta.env['NG_APP_FIREBASE_STORAGE_BUCKET'] || 'mock-project.firebasestorage.app',
  messagingSenderId: import.meta.env['NG_APP_FIREBASE_MESSAGING_SENDER_ID'] || '1234567890',
  appId:             import.meta.env['NG_APP_FIREBASE_APP_ID'] || '1:1234567890:web:1234567890abc',
  measurementId:     import.meta.env['NG_APP_FIREBASE_MEASUREMENT_ID'] || 'G-MOCK12345',
};
