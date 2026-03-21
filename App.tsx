// App.tsx
// Root entry point — sets up providers and listens to Firebase auth state

import React, { useEffect } from 'react';
import { StatusBar } from 'expo-status-bar';
import { PaperProvider, MD3LightTheme, MD3DarkTheme } from 'react-native-paper';
import { NavigationContainer } from '@react-navigation/native';
import '@/i18n'; // Initialize i18n
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { onAuthStateChanged } from 'firebase/auth';
import { doc, getDoc } from 'firebase/firestore';

import { auth, db } from '@/config/firebase';
import { useAuthStore } from '@/store/authStore';
import { KothaBillUser } from '@/types';
import { COLORS, COLLECTIONS } from '@/constants';
import RootNavigator from '@/navigation/RootNavigator';
import { DefaultTheme, DarkTheme } from '@react-navigation/native';

import { useColorScheme } from 'react-native';
import { useThemeStore } from '@/store/themeStore';

// ── Custom Paper themes using KothaBill brand colors ───────────────────────────
const lightTheme = {
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

const darkTheme = {
  ...MD3DarkTheme,
  colors: {
    ...MD3DarkTheme.colors,
    primary:          COLORS.primary,
    secondary:        COLORS.tenant,
    background:       '#121212',
    surface:          '#1E1E1E',
  },
};

// ── Navigation Themes ──────────────────────────────────────────────────────────
const lightNavTheme = {
  ...DefaultTheme,
  colors: {
    ...DefaultTheme.colors,
    primary:    COLORS.primary,
    background: COLORS.background,
    card:       COLORS.surface,
    text:       COLORS.textPrimary,
    border:     COLORS.border,
  },
};

const darkNavTheme = {
  ...DarkTheme,
  colors: {
    ...DarkTheme.colors,
    primary:    COLORS.primary,
    background: '#121212',
    card:       '#1E1E1E',
    text:       '#E1E1E1',
    border:     '#333333',
  },
};

export default function App() {
  const systemColorScheme = useColorScheme();
  const { isDarkMode, setDarkMode } = useThemeStore();
  
  useEffect(() => {
    // Sync with system theme if needed
  }, [systemColorScheme]);

  const theme = isDarkMode ? darkTheme : lightTheme;
  const navTheme = isDarkMode ? darkNavTheme : lightNavTheme;
  const { setUser, setLoading } = useAuthStore();

  useEffect(() => {
    // Listen to Firebase auth state changes on app start
    const unsubscribe = onAuthStateChanged(auth, async (firebaseUser) => {
      if (firebaseUser) {
        // User is signed in — fetch their profile from Firestore
        try {
          const userDoc = await getDoc(doc(db, COLLECTIONS.USERS, firebaseUser.uid));
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
        <NavigationContainer theme={navTheme}>
          <StatusBar style={isDarkMode ? 'light' : 'dark'} />
          <RootNavigator />
        </NavigationContainer>
      </PaperProvider>
    </SafeAreaProvider>
  );
}
