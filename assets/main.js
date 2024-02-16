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
  doc,
  setDoc,
  updateDoc,
  getDoc,
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

const authRoutes = ['/auth/login.html', '/auth/register.html', '/'];

if (typeof document !== 'undefined') {
  document.addEventListener('DOMContentLoaded', () => {
    handleRouteProtection();

    const loginForm = document.querySelector('#form-login');
    loginForm?.addEventListener('submit', handleLogin);

    const registerForm = document.querySelector('#form-register');
    registerForm?.addEventListener('submit', handleRegister);

    const logoutBtn = document.querySelector('#logout');
    logoutBtn?.addEventListener('click', handleLogout);

    const userShowSessions = document.querySelector('#user-show-sessions');
    const userAddSession = document.querySelector('#user-add-session');
    const userSessionForm = document.querySelector('#user-session-form');

    userShowSessions?.addEventListener('click', activateShowSessions);
    userAddSession?.addEventListener('click', activateAddSession);
    userSessionForm?.addEventListener('submit', handleUserAddSession);
  });
}

function handleRouteProtection() {
  const origin = window.location.origin;
  const pathname = window.location.pathname;
  const auth = getAuth();

  onAuthStateChanged(auth, user => {
    if (user) {
      const displayName = document.querySelector('#displayName');
      if (displayName) {
        displayName.textContent = user.email;
      }

      if (authRoutes.includes(pathname)) {
        window.location.href = `${origin}/user`;
      }

      if (pathname === '/user/') {
        activateShowSessions();
      }
    } else if (!authRoutes.includes(pathname)) {
      window.location.href = `${origin}/auth/login.html`;
    }
  });
}

async function handleLogin(e) {
  e.preventDefault();
  const form = e.target;
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
  } catch (error) {
    errorMsg.classList.remove('hidden');
    errorMsg.textContent = error.message;
  } finally {
    submitBtn.disabled = false;
  }
}

async function handleRegister(e) {
  e.preventDefault();
  const form = e.target;
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

async function handleUserAddSession(e) {
  e.preventDefault();
  const form = e.target;
  const userId = auth.currentUser?.uid;
  const sessionName = form.sessionName?.value;

  const userDocRef = doc(db, 'users', userId);
  const userDocSnap = await getDoc(userDocRef);

  const sessionData = {
    name: sessionName || '',
    created_at: Date.now(),
    finished_at: null,
  };

  if (userDocSnap.exists()) {
    const oldSessions = userDocSnap.data()?.sessions || [];
    await updateDoc(userDocRef, {
      sessions: [...oldSessions, sessionData],
    });
  } else {
    await setDoc(userDocRef, {
      user: {
        id: userId || '',
        email: auth.currentUser?.email || '',
      },
      sessions: [sessionData],
    });
  }

  form.reset();
  // redirect to sessions
  activateShowSessions();
}

function activateShowSessions() {
  const userSessionsList = document.querySelector('#user-sessions-list');
  const userSessionForm = document.querySelector('#user-session-form');

  userSessionsList?.classList.remove('hidden');
  userSessionForm?.classList.add('hidden');

  handleSessionsList();
}

function activateAddSession() {
  const userSessionsList = document.querySelector('#user-sessions-list');
  const userSessionForm = document.querySelector('#user-session-form');

  userSessionsList?.classList.add('hidden');
  userSessionForm?.classList.remove('hidden');
}

async function handleSessionsList() {
  const userId = auth.currentUser?.uid;
  const listMsg = document.querySelector('[data-user-sessions-msg]');
  const listItems = document.querySelector('[data-user-sessions-items]');
  listItems.innerHTML = '';

  const userDocRef = doc(db, 'users', userId);
  const userDocSnap = await getDoc(userDocRef);

  if (userDocSnap.exists()) {
    const listData = userDocSnap.data().sessions || [];

    if (listData.length) {
      listMsg.classList.add('hidden');
      listItems.classList.remove('hidden');

      listData.forEach((obj, index) => {
        const listItem = `
          <tr>
            <td class="py-2">${index}</td>
            <td class="py-2">${obj.name}</td>
            <td class="py-2">${dateFns.format(new Date(obj.created_at), 'MMM, d YYYY  h:m:s a')}</td>
            <td class="py-2">${
              obj.finished_at ? dateFns.format(new Date(obj.finished_at), 'MMM, d YYYY  h:m:s a') : '----'
            }</td>
            <td class="py-2">${
              // dateFns.formatDistance(obj.finished_at, obj.created_at)
              obj.finished_at ? 0 : '----'
            }</td>
            <td class="py-2">
            ${
              !obj.finished_at
                ? `<button class="px-3 py-2 text-white rounded bg-blue-600 hover:bg-blue-800 transition-colors" data-session-id="${
                    obj.id || index
                  }">Finish</button>`
                : `<span class="py-1 px-2 font-semibold rounded-full bg-gray-200 text-xs">finished</span>`
            }
              
            </td>
          </tr>
        `;

        listItems.insertAdjacentHTML('beforeend', listItem);
      });
    } else {
      listMsg.classList.remove('hidden');
      listItems.classList.add('hidden');
    }
  } else {
    // show empty msg
    listMsg.classList.remove('hidden');
    listItems.classList.add('hidden');
  }
}
