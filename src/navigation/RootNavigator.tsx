// src/navigation/RootNavigator.tsx
// Decides which navigator to show based on auth state

import React from 'react';
import { View, ActivityIndicator, StyleSheet } from 'react-native';
import { createStackNavigator } from '@react-navigation/stack';

import { useAuthStore } from '@/store/authStore';
import { COLORS } from '@/constants';
import { RootStackParamList } from '@/types';

// Screens
import WelcomeScreen  from '@/screens/auth/WelcomeScreen';
import LoginScreen    from '@/screens/auth/LoginScreen';
import RegisterScreen from '@/screens/auth/RegisterScreen';

// Tab navigators (built in Phase 1 shell, filled in Phase 2+)
import OwnerTabs  from '@/navigation/OwnerTabs';
import TenantTabs from '@/navigation/TenantTabs';

const Stack = createStackNavigator<RootStackParamList>();

export default function RootNavigator() {
  const { isLoggedIn, isLoading, user } = useAuthStore();

  // Show a loading spinner while Firebase checks auth state
  if (isLoading) {
    return (
      <View style={styles.loader}>
        <ActivityIndicator size="large" color={COLORS.primary} />
      </View>
    );
  }

  return (
    <Stack.Navigator screenOptions={{ headerShown: false }}>
      {!isLoggedIn ? (
        // ── Auth screens ──────────────────────────────────────────────────────
        <>
          <Stack.Screen name="Welcome"  component={WelcomeScreen} />
          <Stack.Screen name="Login"    component={LoginScreen} />
          <Stack.Screen name="Register" component={RegisterScreen} />
        </>
      ) : (
        // ── App screens (role-based) ───────────────────────────────────────────
        <>
          {user?.role === 'owner' ? (
            <Stack.Screen name="OwnerTabs"  component={OwnerTabs} />
          ) : (
            <Stack.Screen name="TenantTabs" component={TenantTabs} />
          )}
        </>
      )}
    </Stack.Navigator>
  );
}

const styles = StyleSheet.create({
  loader: {
    flex:            1,
    justifyContent:  'center',
    alignItems:      'center',
    backgroundColor: COLORS.background,
  },
});
