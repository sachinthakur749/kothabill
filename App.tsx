// App.tsx
// Root entry point — sets up providers and listens to Firebase auth state

import React, { useEffect } from 'react';
import { StatusBar } from 'expo-status-bar';
import { PaperProvider, MD3LightTheme } from 'react-native-paper';
import { NavigationContainer } from '@react-navigation/native';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { onAuthStateChanged } from 'firebase/auth';
import { doc, getDoc } from 'firebase/firestore';

import { auth, db } from '@/config/firebase';
import { useAuthStore } from '@/store/authStore';
import { KothaBillUser } from '@/types';
import { COLORS } from '@/constants';
import RootNavigator from '@/navigation/RootNavigator';

// ── Custom Paper theme using KothaBill brand colors ───────────────────────────
const theme = {
  ...MD3LightTheme,
  colors: {
    ...MD3LightTheme.colors,
    primary:          COLORS.primary,
    secondary:        COLORS.tenant,
    background:       COLORS.background,
    surface:          COLORS.surface,
    error:            COLORS.error,
    onPrimary:        COLORS.textOnPrimary,
    onSecondary:      COLORS.textOnPrimary,
    outline:          COLORS.border,
  },
};

export default function App() {
  const { setUser, setLoading } = useAuthStore();

  useEffect(() => {
    // Listen to Firebase auth state changes on app start
    const unsubscribe = onAuthStateChanged(auth, async (firebaseUser) => {
      if (firebaseUser) {
        // User is signed in — fetch their profile from Firestore
        try {
          const userDoc = await getDoc(doc(db, 'users', firebaseUser.uid));
          if (userDoc.exists()) {
            setUser(userDoc.data() as KothaBillUser);
          } else {
            // Signed in but no profile yet (mid-registration)
            setUser(null);
          }
        } catch (error) {
          console.error('Error fetching user profile:', error);
          setUser(null);
        }
      } else {
        // No user signed in
        setUser(null);
        setLoading(false);
      }
    });

    return unsubscribe; // Cleanup listener on unmount
  }, []);

  return (
    <SafeAreaProvider>
      <PaperProvider theme={theme}>
        <NavigationContainer>
          <StatusBar style="auto" />
          <RootNavigator />
        </NavigationContainer>
      </PaperProvider>
    </SafeAreaProvider>
  );
}
