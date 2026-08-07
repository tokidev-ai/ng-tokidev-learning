// Este archivo SE SUBE al repositorio — no contiene credenciales.
// Las claves vienen del archivo .env (que está en .gitignore).
//
// Para configurar: creá un archivo .env en la raíz del proyecto
// copiando .env.example y pegando tus valores de Firebase Console.

export const firebaseConfig = {
  apiKey:            import.meta.env['NG_APP_FIREBASE_API_KEY'],
  authDomain:        import.meta.env['NG_APP_FIREBASE_AUTH_DOMAIN'],
  projectId:         import.meta.env['NG_APP_FIREBASE_PROJECT_ID'],
  storageBucket:     import.meta.env['NG_APP_FIREBASE_STORAGE_BUCKET'],
  messagingSenderId: import.meta.env['NG_APP_FIREBASE_MESSAGING_SENDER_ID'],
  appId:             import.meta.env['NG_APP_FIREBASE_APP_ID'],
  measurementId:     import.meta.env['NG_APP_FIREBASE_MEASUREMENT_ID'],
};
