import { initializeApp } from 'https://www.gstatic.com/firebasejs/10.8.0/firebase-app.js';
import {
  getAuth,
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  onAuthStateChanged,
} from 'https://www.gstatic.com/firebasejs/10.8.0/firebase-auth.js';

const firebaseConfig = {
  apiKey: 'AIzaSyBFtPToovTkLvYpIMN1XpRIcdmBiT2XBzs',
  authDomain: 'short-sessions.firebaseapp.com',
  projectId: 'short-sessions',
  storageBucket: 'short-sessions.appspot.com',
  messagingSenderId: '624454792238',
  appId: '1:624454792238:web:36ec8d47044c365a6c1bbf',
};

initializeApp(firebaseConfig);

const authPages = ['/auth/login.html', '/auth/register.html'];

document.addEventListener('DOMContentLoaded', () => {
  // check firebase auth & redirect to correct page (user/admin)
  handleUserRedirect();

  const loginForm = document.querySelector('#form-login');
  loginForm.addEventListener('submit', e => {
    e.preventDefault();

    handleLogin(e.target);
  });
});

function handleUserRedirect() {
  const auth = getAuth();
  onAuthStateChanged(auth, user => {
    if (user) {
      const uid = user.uid;
      // redirect to (user/admin)
    } else {
      // redirect to auth
      const origin = window.location.origin;
      const pathname = window.location.pathname;
      if (!authPages.includes(pathname)) {
        window.location.href = `${origin}/auth/login.html`;
      }
    }
  });
}

async function handleLogin(form) {
  const email = form.email.value;
  const password = form.password.value;

  const errorMsg = form.querySelector('.error-msg');
  const submitBtn = form.querySelector('button');

  const auth = getAuth();
  try {
    errorMsg.classList.add('hidden');
    submitBtn.disabled = true;
    const res = await signInWithEmailAndPassword(auth, email, password);
    console.log(res);
  } catch (error) {
    errorMsg.classList.remove('hidden');

    const errorMessage = error.message;
    errorMsg.textContent = errorMessage;
  } finally {
    submitBtn.disabled = false;
  }

  // .then(userCredential => {
  //   // Signed in
  //   const user = userCredential.user;
  //   // ...
  // })
  // .catch(error => {

  // });
}
