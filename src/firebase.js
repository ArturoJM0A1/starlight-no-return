import { initializeApp } from 'firebase/app';
import {
  getAuth,
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  updateProfile,
  signOut,
  sendPasswordResetEmail,
  onAuthStateChanged,
} from 'firebase/auth';
import {
  getFirestore, doc, setDoc, getDoc, updateDoc,
  collection, query, orderBy, limit, getDocs,
} from 'firebase/firestore';

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

let auth = null;
let db = null;

if (hasConfig) {
  const app = initializeApp(firebaseConfig);
  auth = getAuth(app);
  db = getFirestore(app);
}

function required() {
  throw new Error('Firebase no configurado. Crea un .env con las variables VITE_FIREBASE_*');
}

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
export async function loginUser(username, password) {
  if (!auth) required();
  const map = await getDoc(doc(db, 'usernames', username.toLowerCase()));
  if (!map.exists()) throw { code: 'auth/user-not-found', message: 'Usuario no encontrado' };
  const email = map.data().email;
  const cred = await signInWithEmailAndPassword(auth, email, password);
  return cred.user;
}

export async function logoutUser() {
  if (!auth) required();
  await signOut(auth);
}

export async function getUserProfile(uid) {
  if (!db) required();
  const snap = await getDoc(doc(db, 'profiles', uid));
  return snap.exists() ? snap.data() : null;
}

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
export async function resetPassword(username, email) {
  if (!db || !auth) required();
  const map = await getDoc(doc(db, 'usernames', username.toLowerCase()));
  if (!map.exists()) throw { code: 'auth/user-not-found', message: 'Usuario no encontrado' };
  const data = map.data();
  if (data.email !== email) throw { code: 'auth/email-mismatch', message: 'El correo no coincide con el usuario' };
  await sendPasswordResetEmail(auth, email);
}

export { auth, db, onAuthStateChanged };
