import { initializeApp } from 'firebase/app'
import { getAuth, GoogleAuthProvider } from 'firebase/auth'
import { getFirestore } from 'firebase/firestore'

const firebaseConfig = {
  apiKey: 'AIzaSyD8b_QytGCZ7WyJHP_2OYVRbxYK3aj6La8',
  authDomain: 'pulso-training.web.app',
  projectId: 'pulso-training',
  storageBucket: 'pulso-training.firebasestorage.app',
  messagingSenderId: '93495235639',
  appId: '1:93495235639:web:0a48fed10bca9a6b595bb2',
}

export const firebaseApp = initializeApp(firebaseConfig)
export const firebaseAuth = getAuth(firebaseApp)
export const googleProvider = new GoogleAuthProvider()
export const firestore = getFirestore(firebaseApp)
