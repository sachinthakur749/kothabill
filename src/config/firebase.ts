// src/config/firebase.ts

import { initializeApp, getApps, getApp } from 'firebase/app';
import { initializeAuth, getAuth, getReactNativePersistence } from 'firebase/auth';
import { getFirestore } from 'firebase/firestore';
import AsyncStorage from '@react-native-async-storage/async-storage';

const firebaseConfig = {
  apiKey: 'AIzaSyCV5iEgzuFJGCxoch9vZqS1yvXtWw8nT7E',
  authDomain: 'kotha-bill.firebaseapp.com',
  projectId: 'kotha-bill',
  storageBucket: 'kotha-bill.firebasestorage.app',
  messagingSenderId: '1063251461588',
  appId: '1:1063251461588:web:977de6ebf8a4c262f88241',
};

// isFirstLoad MUST be captured before initializeApp runs
const isFirstLoad = getApps().length === 0;
const app = isFirstLoad ? initializeApp(firebaseConfig) : getApp();

// initializeAuth with AsyncStorage persistence — now works because metro.config.js
// forces Metro to resolve Firebase's React Native build instead of the browser build.
export const auth = isFirstLoad
  ? initializeAuth(app, {
    persistence: getReactNativePersistence(AsyncStorage),
  })
  : getAuth(app);

export const db = getFirestore(app);
export default app;
