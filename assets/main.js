import { initializeApp } from 'https://www.gstatic.com/firebasejs/10.8.0/firebase-app.js';
import {
  getAuth,
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  onAuthStateChanged,
  signOut,
} from 'https://www.gstatic.com/firebasejs/10.8.0/firebase-auth.js';
import {
  getFirestore,
  collection,
  doc,
  setDoc,
  addDoc,
  getDoc,
  Timestamp,
  serverTimestamp,
} from 'https://www.gstatic.com/firebasejs/10.8.0/firebase-firestore.js';

const firebaseConfig = {
  apiKey: 'AIzaSyBFtPToovTkLvYpIMN1XpRIcdmBiT2XBzs',
  authDomain: 'short-sessions.firebaseapp.com',
  projectId: 'short-sessions',
  storageBucket: 'short-sessions.appspot.com',
  messagingSenderId: '624454792238',
  appId: '1:624454792238:web:36ec8d47044c365a6c1bbf',
};

const app = initializeApp(firebaseConfig);
const auth = getAuth();
const db = getFirestore(app);

const authRoutes = ['/auth/login.html', '/auth/register.html'];

if (typeof document !== 'undefined') {
  document.addEventListener('DOMContentLoaded', () => {
    handleRouteProtection();

    const loginForm = document.querySelector('#form-login');
    loginForm?.addEventListener('submit', e => {
      e.preventDefault();
      handleLogin(e.target);
    });

    const registerForm = document.querySelector('#form-register');
    registerForm?.addEventListener('submit', e => {
      e.preventDefault();
      handleRegister(e.target);
    });

    const logoutBtn = document.querySelector('#logout');
    logoutBtn?.addEventListener('click', () => {
      handleLogout();
    });

    const userShowSessions = document.querySelector('#user-show-sessions');
    const userAddSession = document.querySelector('#user-add-session');

    const userSessionsList = document.querySelector('#user-sessions-list');
    const userSessionForm = document.querySelector('#user-session-form');

    userShowSessions?.addEventListener('click', () => {
      userSessionsList?.classList.remove('hidden');
      userSessionForm?.classList.add('hidden');
    });

    userAddSession?.addEventListener('click', () => {
      userSessionForm?.classList.remove('hidden');
      userSessionsList?.classList.add('hidden');
    });

    userSessionForm?.addEventListener('submit', e => {
      e.preventDefault();
      handleUserAddSession(e.target);
    });
  });
}

function handleRouteProtection() {
  const origin = window.location.origin;
  const pathname = window.location.pathname;
  const auth = getAuth();

  onAuthStateChanged(auth, user => {
    if (user) {
      // const uid = user.uid;
      const displayName = document.querySelector('#displayName');
      if (displayName) {
        displayName.textContent = user.email;
      }

      if (authRoutes.includes(pathname)) {
        window.location.href = `${origin}/user`;
      }
    } else {
      if (!authRoutes.includes(pathname)) {
        window.location.href = `${origin}/auth/login.html`;
      }
    }
  });
}

async function handleLogin(form) {
  const email = form.email.value || '';
  const password = form.password.value || '';

  const errorMsg = form.querySelector('.error-msg');
  const submitBtn = form.querySelector('button');

  // [TASK] add validation

  try {
    errorMsg.classList.add('hidden');
    submitBtn.disabled = true;
    const userCredential = await signInWithEmailAndPassword(auth, email, password);
    const { user } = userCredential;
    console.log(user);
  } catch (error) {
    errorMsg.classList.remove('hidden');
    errorMsg.textContent = error.message;
  } finally {
    submitBtn.disabled = false;
  }
}

async function handleRegister(form) {
  const email = form.email.value || '';
  const password = form.password.value || '';

  const errorMsg = form.querySelector('.error-msg');
  const submitBtn = form.querySelector('button');

  // [TASK] add validation

  try {
    errorMsg.classList.add('hidden');
    submitBtn.disabled = true;
    const userCredential = await createUserWithEmailAndPassword(auth, email, password);
    const { user } = userCredential;
    console.log(user);
  } catch (error) {
    errorMsg.classList.remove('hidden');
    errorMsg.textContent = error.message;
  } finally {
    submitBtn.disabled = false;
  }
}

async function handleLogout() {
  try {
    await signOut(auth);
  } catch (error) {
    console.log('An error happened.');
  }
}

async function handleUserAddSession(form) {
  const userId = auth.currentUser?.uid;
  const sessionName = form.sessionName;

  const usersColRef = collection(db, 'users');
  const userDocRef = doc(usersColRef, userId);
  const userDocSnap = await getDoc(userDocRef);

  console.log(userDocSnap.exists());

  if (!userDocSnap.exists()) {
    await setDoc(userDocRef, {});
  }

  const sessionsColRef = collection(db, `users/${userId}/sessions`);
  console.log(sessionsColRef);
  await addDoc(sessionsColRef, {
    name: sessionName,
    created_at: serverTimestamp(),
    finished_at: null,
  });

  return;

  try {
    const sessionData = {
      name: sessionName,
      // created_at: serverTimestamp(),
      finished_at: null,
    };

    await addDoc(sessionsRef, sessionData);
  } catch (e) {
    console.error('Error adding document: ', e);
  }
}
