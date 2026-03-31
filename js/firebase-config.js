/**
 * firebase-config.js
 * Configuración pública del proyecto Firebase de Cronos Sport Media.
 *
 * IMPORTANTE: Las API keys de Firebase son PÚBLICAS por diseño de la plataforma.
 * La seguridad del sistema NO depende de ocultar estas keys, sino de las
 * Firestore Security Rules desplegadas en la consola de Firebase.
 * Ver ROLES.md para el detalle completo de las reglas de seguridad.
 *
 * Firebase Storage NO se usa en este proyecto — fue reemplazado por
 * Cloudinary (cloud: dgfmlxvfn, preset: cronos_articles). Ver DEC-009.
 */

import { initializeApp }
  from "https://www.gstatic.com/firebasejs/10.12.0/firebase-app.js";
import { getAuth }
  from "https://www.gstatic.com/firebasejs/10.12.0/firebase-auth.js";
import { getFirestore }
  from "https://www.gstatic.com/firebasejs/10.12.0/firebase-firestore.js";

const firebaseConfig = {
  apiKey:            "AIzaSyACGQlXKkdJsvsuIn77ZQ06SghlTvUTDLI",
  authDomain:        "cronossportmedia-e07ef.firebaseapp.com",
  projectId:         "cronossportmedia-e07ef",
  storageBucket:     "cronossportmedia-e07ef.firebasestorage.app",
  messagingSenderId: "898405181430",
  appId:             "1:898405181430:web:12ad5dc59fa049c26609d7"
};

// Inicializar Firebase
const app = initializeApp(firebaseConfig);

// Exportar servicios que usan los demás módulos JS
export const auth = getAuth(app);
export const db   = getFirestore(app);
