// Importa el SDK de Firebase. 'initializeApp' configura la conexión inicial
// con tu proyecto de Firebase (identificado por las credenciales en firebaseConfig).
import { initializeApp } from 'firebase/app';
// Módulo de autenticación: funciones para crear cuenta, iniciar sesión,
// actualizar el perfil, cerrar sesión, restablecer contraseña y suscribirse
// a cambios del estado de autenticación en tiempo real (onAuthStateChanged).
import {
  getAuth,
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  updateProfile,
  signOut,
  sendPasswordResetEmail,
  onAuthStateChanged,
} from 'firebase/auth';
// Módulo de Firestore (base de datos documental NoSQL):
// - doc/collection: referencias a un documento/colección por su path.
// - setDoc/getDoc/updateDoc: escribir/leer/actualizar un documento.
// - query/orderBy/limit/getDocs: construir y ejecutar consultas (orden y tope).
import {
  getFirestore, doc, setDoc, getDoc, updateDoc,
  collection, query, orderBy, limit, getDocs,
} from 'firebase/firestore';

// import.meta.env.VITE_* expone variables del archivo .env al código del cliente
// (prefijo obligatorio VITE_ en Vite). Aquí se leen las credenciales de Firebase.
const firebaseConfig = {
  apiKey: import.meta.env.VITE_FIREBASE_API_KEY,
  authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN,
  projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID,
  storageBucket: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID,
  appId: import.meta.env.VITE_FIREBASE_APP_ID,
};

// Guardia: solo inicializa Firebase si las variables .env están presentes (fallback de desarrollo)
const hasConfig = firebaseConfig.apiKey && firebaseConfig.projectId;

// Se mantienen como null si no hay configuración, para que el resto del código
// pueda comprobar `if (!auth)` y advertir en lugar de lanzar errores de SDK.
let auth = null;
let db = null;

// Inicializa la app una sola vez (no se puede llamar initializeApp dos veces
// con la misma config sin obtener la app existente). getAuth/getFirestore
// retornan los servicios singleton asociados a esa app.
if (hasConfig) {
  const app = initializeApp(firebaseConfig);
  auth = getAuth(app);
  db = getFirestore(app);
}

// Lanzada cuando se intenta usar Firebase sin credenciales (.env ausente).
function required() {
  throw new Error('Firebase no configurado. Crea un .env con las variables VITE_FIREBASE_*');
}

/*
  Registra un usuario nuevo.
  - async/await: espera promesas de Firebase; el await "pausa" la función hasta que
    la promesa se resuelve (el código posterior corre cuando hay resultado).
  - createUserWithEmailAndPassword: crea la cuenta en Firebase Auth.
  - updateProfile: guarda el displayName en el objeto de Auth (asociado al UID).
  - Promise.all: ejecuta las dos escrituras en Firestore en paralelo y espera ambas.
  - doc(db, 'profiles', uid): referencia al documento profiles/<uid>; setDoc lo crea
    o lo sobrescribe. El documento 'usernames/<@usuario>' sirve para buscar el email
    al iniciar sesión solo con el nombre de usuario.
*/
export async function registerUser(username, email, password) {
  if (!auth) required();
  const cred = await createUserWithEmailAndPassword(auth, email, password);
  await updateProfile(cred.user, { displayName: username });
  await Promise.all([
    setDoc(doc(db, 'profiles', cred.user.uid), {
      username,
      email,
      bestScore: 0,
      createdAt: Date.now(),
    }),
    setDoc(doc(db, 'usernames', username.toLowerCase()), {
      uid: cred.user.uid,
      email,
    }),
  ]);
  return cred.user;
}

// Inicio de sesión mediante nombre de usuario → búsqueda de email (colección usernames almacena uid + email)
// getDoc lee el snapshot (instantánea) del documento; .exists() indica si existe,
// y .data() retorna el objeto almacenado. Luego se autentica con ese email.
export async function loginUser(username, password) {
  if (!auth) required();
  const map = await getDoc(doc(db, 'usernames', username.toLowerCase()));
  if (!map.exists()) throw { code: 'auth/user-not-found', message: 'Usuario no encontrado' };
  const email = map.data().email;
  const cred = await signInWithEmailAndPassword(auth, email, password);
  return cred.user;
}

// Cierra la sesión local en Firebase Auth (invalida el token en el cliente).
export async function logoutUser() {
  if (!auth) required();
  await signOut(auth);
}

// Lee el perfil de un usuario por su uid; retorna null si no existe (ternario).
export async function getUserProfile(uid) {
  if (!db) required();
  const snap = await getDoc(doc(db, 'profiles', uid));
  return snap.exists() ? snap.data() : null;
}

/*
  Guarda el mejor puntaje solo si supera el guardado (NO sobrescribe con peores marcas).
  updateDoc hace una actualización parcial: solo cambia el campo bestScore
  del documento, sin tocar los demás.
*/
export async function saveBestScore(uid, score) {
  if (!db) required();
  const ref = doc(db, 'profiles', uid);
  const snap = await getDoc(ref);
  if (!snap.exists()) return;
  const current = snap.data().bestScore || 0;
  if (score > current) {
    await updateDoc(ref, { bestScore: score });
  }
}

/*
  Ranking global. query() arma una consulta: ordena la colección 'profiles'
  por bestScore descendente y toma solo los primeros `count`.
  snap.docs es un array de snapshots; .map transforma cada uno en un objeto
  plano (uid = id del documento), y .filter descarta puntajes <= 0.
*/
export async function getTopPlayers(count = 200) {
  if (!db) required();
  const q = query(collection(db, 'profiles'), orderBy('bestScore', 'desc'), limit(count));
  const snap = await getDocs(q);
  return snap.docs
    .filter((d) => d.data().bestScore > 0)
    .map((d) => ({
      uid: d.id,
      username: d.data().username,
      bestScore: d.data().bestScore || 0,
    }));
}

// Restablecimiento de contraseña: verifica que el email coincida con el usuario antes de enviar
// Compara el email del documento usernames/<usuario> con el ingresado; si coincide,
// sendPasswordResetEmail envía el correo con el enlace de restablecimiento.
export async function resetPassword(username, email) {
  if (!db || !auth) required();
  const map = await getDoc(doc(db, 'usernames', username.toLowerCase()));
  if (!map.exists()) throw { code: 'auth/user-not-found', message: 'Usuario no encontrado' };
  const data = map.data();
  if (data.email !== email) throw { code: 'auth/email-mismatch', message: 'El correo no coincide con el usuario' };
  await sendPasswordResetEmail(auth, email);
}

// Re-exporta estos símbolos para que otros módulos (App.jsx) puedan suscribirse
// a cambios de autenticación sin importar el SDK directamente.
export { auth, db, onAuthStateChanged };
